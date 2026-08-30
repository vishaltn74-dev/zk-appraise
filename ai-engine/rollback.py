"""Backup and rollback utilities for generated model artifacts."""

from __future__ import annotations

import shutil
from pathlib import Path

import model_config as cfg
from cli import parse_args
from exceptions import ArtifactValidationError
from logging_utils import configure_logging
from security_utils import artifact_lock, ensure_safe_directory

RESTORE_TARGETS = [
    "house_appraiser.onnx",
    "model_weights.json",
    "model_meta.json",
    "sample_input.json",
    "test_vectors.json",
    cfg.CHECKSUM_MANIFEST,
    cfg.METRICS_FILE,
]


def restore_artifact_backups(directory: Path) -> list[str]:
    """Restore ``.bak`` files for artifacts after a failed deployment.

    Parameters:
        directory: Artifact directory.

    Returns:
        Names of restored artifacts.

    Raises:
        ArtifactValidationError: If a backup is missing or restoration fails.
    """
    restored: list[str] = []
    for name in RESTORE_TARGETS:
        backup = directory / f"{name}.bak"
        target = directory / name
        if backup.exists():
            try:
                shutil.copy2(backup, target)
                restored.append(name)
            except OSError as exc:
                raise ArtifactValidationError(f"Rollback failed for '{name}': {exc}") from exc
    if not restored:
        raise ArtifactValidationError(f"No artifact backups found in '{directory}'.")
    return restored


def main(argv: list[str] | None = None) -> int:
    """Restore backups from the configured artifact directory."""
    options = parse_args("Rollback model artifacts to the latest backups.", argv)
    logger = configure_logging(options.log_level)
    ensure_safe_directory(options.artifact_dir)
    try:
        with artifact_lock(options.artifact_dir):
            restored = restore_artifact_backups(options.artifact_dir)
        logger.warning("rollback_complete", extra={"event": "rollback_complete", "restored": restored})
        return 0
    except Exception:
        logger.error("rollback_failed", extra={"event": "rollback_failed"}, exc_info=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
