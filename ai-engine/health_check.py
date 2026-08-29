"""Read-only health check for model artifact integrity and runtime readiness."""

from __future__ import annotations

import json
from pathlib import Path

import onnx

import model_config as cfg
from cli import parse_args
from exceptions import ArtifactValidationError
from logging_utils import configure_logging
from runtime_utils import check_resources
from security_utils import atomic_write_json, sha256_file, validate_artifact_dir, verify_checksum_manifest

REQUIRED_HEALTH_ARTIFACTS = [
    "house_appraiser.onnx",
    "model_meta.json",
    "model_weights.json",
    "sample_input.json",
    "test_vectors.json",
    cfg.CHECKSUM_MANIFEST,
]


def run_health_check(directory: Path, root: Path | None = None) -> dict[str, object]:
    """Return health status without modifying model artifacts.

    Parameters:
        directory: Artifact directory.
        root: Optional allowed root directory for path validation.

    Returns:
        Health payload suitable for monitoring.

    Raises:
        ArtifactValidationError: If required artifacts are unhealthy.
    """
    safe_dir = validate_artifact_dir(directory, root=root)
    missing = [name for name in REQUIRED_HEALTH_ARTIFACTS if not (safe_dir / name).exists()]
    if missing:
        raise ArtifactValidationError(f"Health check missing artifacts: {missing}")
    check_resources(safe_dir)
    onnx.checker.check_model(onnx.load(safe_dir / "house_appraiser.onnx"))
    verify_checksum_manifest(safe_dir)
    meta = json.loads((safe_dir / "model_meta.json").read_text(encoding="utf-8"))
    if meta.get("schema_version") != cfg.ARTIFACT_SCHEMA_VERSION:
        raise ArtifactValidationError("Unsupported artifact schema version.")
    return {
        "status": "healthy",
        "model": cfg.MODEL_NAME,
        "model_version": cfg.MODEL_VERSION,
        "artifact_sha256": sha256_file(safe_dir / "house_appraiser.onnx"),
    }


def main(argv: list[str] | None = None) -> int:
    """Run health check and persist an atomic health snapshot."""
    options = parse_args("Check AI-engine artifact health.", argv)
    logger = configure_logging(options.log_level)
    try:
        payload = run_health_check(options.artifact_dir)
        atomic_write_json(options.artifact_dir / cfg.HEALTH_FILE, payload, backup=False)
        logger.info("health_check_pass", extra={"event": "health_check_pass"})
        return 0
    except Exception:
        logger.error("health_check_failed", extra={"event": "health_check_failed"}, exc_info=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
