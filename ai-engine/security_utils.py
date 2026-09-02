"""Security, filesystem safety, atomic persistence, locking, and audit helpers."""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import tempfile
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from filelock import FileLock, Timeout

import model_config as cfg
from exceptions import ArtifactValidationError, ConfigurationError

SECRET_PATTERNS = [
    re.compile(r"(?i)(password|passwd|secret|api[_-]?key|token|private[_-]?key)\s*[=:]\s*[^\s,]+"),
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    re.compile(r"(?i)aws_access_key_id\s*[=:]\s*[A-Z0-9]{16,}"),
]


def validate_artifact_dir(path: Path, root: Path | None = None) -> Path:
    """Validate and return a safe artifact directory.

    Parameters:
        path: User/configuration supplied directory.
        root: Optional allowed root directory. Defaults to project directory.

    Returns:
        Resolved artifact directory.

    Raises:
        ConfigurationError: If the path is unsafe or invalid.
    """
    allowed_root = (root or cfg.PROJECT_ROOT).resolve()
    candidate = path.expanduser().resolve()
    try:
        candidate.relative_to(allowed_root)
    except ValueError as exc:
        raise ConfigurationError(f"Artifact directory '{candidate}' escapes allowed root '{allowed_root}'.") from exc
    if candidate == allowed_root / ".git":
        raise ConfigurationError("Artifact directory may not be the Git metadata directory.")
    return candidate


def ensure_safe_directory(path: Path) -> None:
    """Create an artifact directory after path validation."""
    safe = validate_artifact_dir(path)
    safe.mkdir(parents=True, exist_ok=True)
    if not safe.is_dir():
        raise ConfigurationError(f"Artifact path is not a directory: {safe}")


@contextmanager
def artifact_lock(directory: Path) -> Iterator[None]:
    """Serialize artifact writers using an inter-process lock."""
    ensure_safe_directory(directory)
    lock_path = directory / ".ai-engine.lock"
    lock = FileLock(str(lock_path), timeout=cfg.LOCK_TIMEOUT_SECONDS)
    try:
        lock.acquire()
        yield
    except Timeout as exc:
        raise ArtifactValidationError(
            f"Could not acquire artifact lock '{lock_path}' within {cfg.LOCK_TIMEOUT_SECONDS}s. "
            "Another pipeline process may be running."
        ) from exc
    finally:
        if lock.is_locked:
            lock.release()


def create_artifact_backup_snapshot(directory: Path, files: list[str]) -> None:
    """Create a synchronized backup snapshot of all artifacts before pipeline execution."""
    for name in files:
        src = directory / name
        if src.exists():
            dst = directory / f"{name}.bak"
            shutil.copy2(src, dst)


def atomic_write_text(path: Path, content: str, backup: bool = False) -> None:
    """Atomically write text and optionally back up the previous artifact."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if backup and path.exists():
        backup_path = path.with_suffix(path.suffix + ".bak")
        shutil.copy2(path, backup_path)
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temp_path = Path(temp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_path, path)
    except Exception:
        temp_path.unlink(missing_ok=True)
        raise


def atomic_write_bytes(path: Path, content: bytes, backup: bool = False) -> None:
    """Atomically write binary content and optionally back up the previous artifact."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if backup and path.exists():
        shutil.copy2(path, path.with_suffix(path.suffix + ".bak"))
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temp_path = Path(temp_name)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_path, path)
    except Exception:
        temp_path.unlink(missing_ok=True)
        raise


def atomic_write_json(path: Path, payload: Any, backup: bool = False) -> None:
    """Serialize JSON without allowing NaN/Infinity and atomically persist it."""
    content = json.dumps(payload, indent=2, allow_nan=False, sort_keys=True) + "\n"
    atomic_write_text(path, content, backup=backup)


def sha256_file(path: Path) -> str:
    """Return the SHA-256 checksum of a file."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_checksum_manifest(directory: Path, files: list[str], backup: bool = False) -> Path:
    """Write checksums for generated artifacts after successful creation."""
    manifest = {
        "schema_version": cfg.ARTIFACT_SCHEMA_VERSION,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "files": {name: sha256_file(directory / name) for name in sorted(files)},
    }
    path = directory / cfg.CHECKSUM_MANIFEST
    atomic_write_json(path, manifest, backup=backup)
    return path


def verify_checksum_manifest(directory: Path) -> None:
    """Verify every checksum recorded in the artifact manifest."""
    path = directory / cfg.CHECKSUM_MANIFEST
    if not path.exists():
        raise ArtifactValidationError(f"Checksum manifest missing: {path}")
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        for name, expected in payload["files"].items():
            artifact = directory / name
            if not artifact.exists():
                raise ArtifactValidationError(f"Checksum target missing: {artifact}")
            actual = sha256_file(artifact)
            if actual != expected:
                raise ArtifactValidationError(f"Checksum mismatch for '{name}': expected {expected}, got {actual}.")
    except (KeyError, json.JSONDecodeError) as exc:
        raise ArtifactValidationError(f"Invalid checksum manifest '{path}': {exc}") from exc


def redact(value: object) -> object:
    """Redact common secret-like values from structured log fields."""
    if not isinstance(value, str):
        return value
    redacted = value
    for pattern in SECRET_PATTERNS:
        redacted = pattern.sub(lambda m: m.group(0).split("=")[0].split(":")[0] + "=<REDACTED>", redacted)
    return redacted


def scan_text_for_secrets(text: str) -> list[str]:
    """Return human-readable findings for obvious secret patterns."""
    findings: list[str] = []
    for pattern in SECRET_PATTERNS:
        if pattern.search(text):
            findings.append(pattern.pattern)
    return findings
