"""Strict cross-artifact, checksum, quality, and mathematical validation gate."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import onnx
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

import model_config as cfg
from cli import parse_args
from data_utils import dataset_fingerprint, load_data
from exceptions import ArtifactValidationError
from logging_utils import configure_logging
from security_utils import artifact_lock, ensure_safe_directory, verify_checksum_manifest
from train_model import onnx_predict

REQUIRED = [
    "house_appraiser.onnx",
    "model_meta.json",
    "model_weights.json",
    "sample_input.json",
    "test_vectors.json",
    cfg.METRICS_FILE,
    cfg.CHECKSUM_MANIFEST,
]


def _json(path: Path) -> dict[str, Any]:
    """Read an object JSON artifact."""
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ArtifactValidationError(f"Expected JSON object in '{path}'.")
    return value


def verify(directory: Path) -> list[str]:
    """Run all deployment artifact checks and return failures.

    Parameters:
        directory: Validated artifact directory.

    Returns:
        List of failure descriptions; empty means PASS.
    """
    failures: list[str] = []
    for name in REQUIRED:
        path = directory / name
        if not path.exists():
            failures.append(f"missing artifact: {name}")
        elif path.stat().st_size > cfg.MAX_ARTIFACT_BYTES:
            failures.append(f"artifact too large: {name}")
    if failures:
        return failures

    try:
        verify_checksum_manifest(directory)
        meta = _json(directory / "model_meta.json")
        weights = _json(directory / "model_weights.json")
        sample = _json(directory / "sample_input.json")
        vectors = _json(directory / "test_vectors.json")

        if meta.get("schema_version") != cfg.ARTIFACT_SCHEMA_VERSION:
            failures.append("unsupported metadata schema")
        if meta.get("input", {}).get("shape") != cfg.INPUT_SHAPE:
            failures.append("metadata input shape mismatch")
        if meta.get("output", {}).get("shape") != cfg.OUTPUT_SHAPE:
            failures.append("metadata output shape mismatch")
        if meta.get("input", {}).get("dtype") != cfg.INPUT_DTYPE:
            failures.append("metadata input dtype mismatch")

        order = meta.get("input", {}).get("feature_order")
        expected_order = [
            {"model_index": i, "dataset_index": cfg.FEATURE_INDICES[i], "name": cfg.FEATURE_NAMES[i]}
            for i in range(cfg.FEATURE_COUNT)
        ]
        if order != expected_order:
            failures.append("metadata feature mapping mismatch")
        if weights.get("feature_order") != expected_order:
            failures.append("weight feature mapping mismatch")
        if sample.get("feature_order") != cfg.FEATURE_NAMES:
            failures.append("sample feature order mismatch")
        if vectors.get("feature_order") != cfg.FEATURE_NAMES:
            failures.append("vector feature order mismatch")

        records = vectors.get("vectors", [])
        if len(records) != cfg.DATASET_EXPECTED_SAMPLES:
            failures.append(f"expected {cfg.DATASET_EXPECTED_SAMPLES} vectors, got {len(records)}")
        for i, record in enumerate(records):
            if record.get("id") != i:
                failures.append(f"vector id mismatch at {i}")
                break
            if len(record.get("inputs", [])) != cfg.FEATURE_COUNT:
                failures.append(f"vector input length mismatch at {i}")
                break
            all_finite = all(
                np.isfinite(float(v)) for v in record["inputs"] + [record["expected_output"], record["ground_truth"]]
            )
            if not all_finite:
                failures.append(f"non-finite vector at {i}")
                break

        model = onnx.load(directory / "house_appraiser.onnx")
        onnx.checker.check_model(model)
        inp, out = model.graph.input[0], model.graph.output[0]
        if [d.dim_value for d in inp.type.tensor_type.shape.dim] != cfg.INPUT_SHAPE:
            failures.append("ONNX input shape mismatch")
        if [d.dim_value for d in out.type.tensor_type.shape.dim] != cfg.OUTPUT_SHAPE:
            failures.append("ONNX output shape mismatch")

        X, y = load_data()
        if meta.get("lineage", {}).get("fingerprint_sha256") != dataset_fingerprint(X, y):
            failures.append("dataset lineage fingerprint mismatch")

        onnx_model_path = directory / "house_appraiser.onnx"
        preds = onnx_predict(onnx_model_path, X[: cfg.PARITY_SAMPLE_COUNT]).astype(np.float64)

        w = np.asarray(weights.get("weights", []), dtype=np.float64)
        intercept_raw = weights.get("intercept")
        if intercept_raw is None or not isinstance(intercept_raw, int | float):
            failures.append("invalid intercept in weights")
            b = 0.0
        else:
            b = float(intercept_raw)

        manual = X[: cfg.PARITY_SAMPLE_COUNT].astype(np.float64) @ w + b
        if w.shape != (cfg.FEATURE_COUNT,):
            failures.append("weight count mismatch")
        if float(np.max(np.abs(manual - preds))) > cfg.MANUAL_MAX_ABS_TOLERANCE:
            failures.append("manual-vs-ONNX parity failed")

        # Refit deterministic sklearn model solely for independent artifact verification.
        Xt, Xv, yt, _ = train_test_split(X, y, test_size=cfg.TEST_SIZE, random_state=cfg.RANDOM_STATE)
        sklearn_model = LinearRegression(fit_intercept=True).fit(Xt, yt)
        sk = np.asarray(sklearn_model.predict(Xv[: cfg.PARITY_SAMPLE_COUNT]), dtype=np.float64)
        onx = onnx_predict(onnx_model_path, Xv[: cfg.PARITY_SAMPLE_COUNT]).astype(np.float64)
        if float(np.max(np.abs(sk - onx))) >= cfg.PARITY_MAX_ABS_TOLERANCE:
            failures.append("sklearn-vs-ONNX parity failed")

        sample_inputs = np.asarray(sample["inputs"], dtype=np.float64).reshape(1, -1)
        sample_manual = float((sample_inputs @ w.reshape(-1, 1) + b).reshape(-1)[0])
        if float(np.abs(sample_manual - float(sample["expected_output"]))) > cfg.MANUAL_MAX_ABS_TOLERANCE:
            failures.append("sample mathematical verification failed")

        # Quality gates prevent silent bad-model deployment.
        evaluation = weights.get("evaluation", {})
        if float(evaluation.get("r2", -np.inf)) < cfg.QUALITY_MIN_R2:
            failures.append("R2 quality gate failed")
        if float(evaluation.get("rmse", np.inf)) > cfg.QUALITY_MAX_RMSE:
            failures.append("RMSE quality gate failed")
        if float(evaluation.get("mae", np.inf)) > cfg.QUALITY_MAX_MAE:
            failures.append("MAE quality gate failed")
    except Exception as exc:
        failures.append(f"validation exception: {exc}")
    return failures


def main(argv: list[str] | None = None) -> int:
    """Execute the validation gate and emit PASS/FAIL."""
    options = parse_args("Verify zk-appraise artifacts.", argv)
    logger = configure_logging(options.log_level)
    ensure_safe_directory(options.artifact_dir)
    with artifact_lock(options.artifact_dir):
        failures = verify(options.artifact_dir)
    if failures:
        for failure in failures:
            logger.error("check_fail", extra={"event": "check_fail", "check": failure})
        logger.error(
            "artifact_validation_failed",
            extra={"event": "artifact_validation_failed", "failure_count": len(failures)},
        )
        logger.info("RESULT: FAIL", extra={"event": "result", "status": "FAIL"})
        return 1
    logger.info("artifact_validation_pass", extra={"event": "artifact_validation_pass"})
    logger.info("RESULT: PASS", extra={"event": "result", "status": "PASS"})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
