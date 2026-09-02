"""Generate deterministic ONNX-backed vectors for all California Housing rows."""

from __future__ import annotations

from typing import Any

import numpy as np

import model_config as cfg
from audit_utils import audit_event
from cli import parse_args
from data_utils import load_data
from exceptions import ModelError
from logging_utils import configure_logging
from runtime_utils import check_resources, check_shutdown, install_signal_handlers
from security_utils import (
    artifact_lock,
    atomic_write_json,
    ensure_safe_directory,
    sha256_file,
    write_checksum_manifest,
)
from train_model import onnx_predict


def build_vectors(X: np.ndarray, y: np.ndarray, predictions: np.ndarray) -> list[dict[str, Any]]:
    """Build and validate every deterministic test vector.

    Parameters:
        X: Canonically ordered feature matrix.
        y: Dataset targets.
        predictions: ONNX predictions aligned with X.

    Returns:
        List containing one record per dataset row.
    """
    if len(X) != cfg.DATASET_EXPECTED_SAMPLES or len(y) != len(X) or len(predictions) != len(X):
        raise ModelError("Vector arrays have inconsistent lengths.")
    if len(X) > cfg.MAX_VECTOR_COUNT:
        raise ModelError(f"Vector count {len(X)} exceeds safety limit {cfg.MAX_VECTOR_COUNT}.")
    if not all(np.all(np.isfinite(a)) for a in (X, y, predictions)):
        raise ModelError("Vector generation received non-finite values.")
    return [
        {
            "id": i,
            "inputs": [float(v) for v in X[i]],
            "expected_output": float(predictions[i]),
            "ground_truth": float(y[i]),
        }
        for i in range(len(X))
    ]


def main(argv: list[str] | None = None) -> int:
    """Generate the complete vector artifact with lock, audit, and atomic persistence."""
    options = parse_args("Generate ONNX-backed California Housing test vectors.", argv)
    logger = configure_logging(options.log_level)
    install_signal_handlers(logger)
    output_dir = options.artifact_dir
    ensure_safe_directory(output_dir)
    try:
        with artifact_lock(output_dir):
            check_resources(output_dir)
            audit_event(output_dir, "vector_generation", "started")
            onnx_path = output_dir / "house_appraiser.onnx"
            if not onnx_path.exists():
                raise ModelError(f"Required ONNX model is missing: {onnx_path}. Run train_model.py first.")
            if onnx_path.stat().st_size > cfg.MAX_ARTIFACT_BYTES:
                raise ModelError("ONNX artifact exceeds configured size limit.")
            X, y = load_data(options.retries, options.backoff)
            check_shutdown()
            predictions = onnx_predict(onnx_path, X, options.retries, options.backoff)
            vectors = build_vectors(X, y, predictions)
            payload = {
                "schema_version": cfg.ARTIFACT_SCHEMA_VERSION,
                "model_name": cfg.MODEL_NAME,
                "model_version": cfg.MODEL_VERSION,
                "feature_order": cfg.FEATURE_NAMES,
                "expected_output_definition": "ONNX model prediction",
                "ground_truth_definition": "California Housing dataset target",
                "vectors": vectors,
            }
            atomic_write_json(output_dir / "test_vectors.json", payload)
            # Refresh manifest to include vectors while preserving the pre-pipeline checksums.json.bak
            checksum_files = [
                "house_appraiser.onnx",
                "model_weights.json",
                "model_meta.json",
                "sample_input.json",
                "test_vectors.json",
                cfg.METRICS_FILE,
            ]
            write_checksum_manifest(output_dir, checksum_files, backup=False)
            audit_event(
                output_dir,
                "vector_generation",
                "passed",
                vector_count=len(vectors),
                sha256=sha256_file(output_dir / "test_vectors.json"),
            )
            logger.info(
                "vector_generation_pass",
                extra={"event": "vector_generation_pass", "vector_count": len(vectors)},
            )
        return 0
    except Exception:
        try:
            audit_event(output_dir, "vector_generation", "failed")
        except Exception:
            pass
        logger.error("vector_generation_failed", extra={"event": "vector_generation_failed"}, exc_info=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
