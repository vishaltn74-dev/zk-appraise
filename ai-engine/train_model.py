"""Train, export, validate, and persist the zk-appraise linear model safely."""

from __future__ import annotations

import time
from pathlib import Path
from typing import Any

import numpy as np
import onnx
import onnxruntime as ort
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

import model_config as cfg
from audit_utils import audit_event
from cli import parse_args
from data_utils import dataset_fingerprint, load_data
from exceptions import ModelError
from logging_utils import configure_logging, log_metric, timed
from metrics_utils import record_performance_baseline
from monitoring import write_monitoring_snapshot
from runtime_utils import check_resources, check_shutdown, install_signal_handlers
from security_utils import (
    artifact_lock,
    atomic_write_bytes,
    atomic_write_json,
    create_artifact_backup_snapshot,
    ensure_safe_directory,
    write_checksum_manifest,
)

ALL_MANAGED_ARTIFACTS = [
    "house_appraiser.onnx",
    "model_meta.json",
    "model_weights.json",
    "sample_input.json",
    "test_vectors.json",
    cfg.METRICS_FILE,
    cfg.CHECKSUM_MANIFEST,
]

TRAIN_ARTIFACTS = [
    "house_appraiser.onnx",
    "model_meta.json",
    "model_weights.json",
    "sample_input.json",
    cfg.METRICS_FILE,
]


def feature_order_schema() -> list[dict[str, int | str]]:
    """Return the canonical ordered model-to-dataset feature mapping."""
    return [
        {"model_index": i, "dataset_index": cfg.FEATURE_INDICES[i], "name": cfg.FEATURE_NAMES[i]}
        for i in range(cfg.FEATURE_COUNT)
    ]


def train_model(X: np.ndarray, y: np.ndarray) -> tuple[LinearRegression, np.ndarray, np.ndarray, dict[str, float]]:
    """Train deterministic linear regression and calculate quality metrics.

    Parameters:
        X: Canonically ordered float32 features.
        y: Float32 California Housing target.

    Returns:
        Fitted model, held-out features, held-out targets, and R2/RMSE/MAE metrics.

    Raises:
        ModelError: If training produces invalid parameters or quality metrics.
    """
    try:
        check_shutdown()
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=cfg.TEST_SIZE, random_state=cfg.RANDOM_STATE
        )
        model = LinearRegression(fit_intercept=True)
        model.fit(X_train, y_train)
        predictions = np.asarray(model.predict(X_test), dtype=np.float32)
        metrics = {
            "r2": float(r2_score(y_test, predictions)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, predictions))),
            "mae": float(mean_absolute_error(y_test, predictions)),
        }
        if not np.all(np.isfinite(model.coef_)) or not np.isfinite(model.intercept_):
            raise ModelError("Training produced non-finite coefficients/intercept.")
        if metrics["r2"] < cfg.QUALITY_MIN_R2:
            raise ModelError(f"Model quality gate failed: R2={metrics['r2']:.6f} < {cfg.QUALITY_MIN_R2}.")
        if metrics["rmse"] > cfg.QUALITY_MAX_RMSE:
            raise ModelError(f"Model quality gate failed: RMSE={metrics['rmse']:.6f} > {cfg.QUALITY_MAX_RMSE}.")
        if metrics["mae"] > cfg.QUALITY_MAX_MAE:
            raise ModelError(f"Model quality gate failed: MAE={metrics['mae']:.6f} > {cfg.QUALITY_MAX_MAE}.")
        return model, X_test, y_test, metrics
    except ModelError:
        raise
    except Exception as exc:
        raise ModelError(f"Model training/evaluation failed: {exc}") from exc


def export_onnx(model: LinearRegression, output_dir: Path) -> Path:
    """Convert sklearn model to ONNX and atomically persist it.

    Parameters:
        model: Fitted LinearRegression model.
        output_dir: Validated artifact directory.

    Returns:
        ONNX artifact path.
    """
    try:
        onx = convert_sklearn(
            model,
            initial_types=[("float_input", FloatTensorType(cfg.INPUT_SHAPE))],
            target_opset=cfg.ONNX_OPSET,
        )
        path = output_dir / "house_appraiser.onnx"
        atomic_write_bytes(path, onx.SerializeToString())
        return path
    except Exception as exc:
        raise ModelError(f"ONNX export failed: {exc}") from exc


def inspect_onnx(path: Path) -> None:
    """Validate ONNX structure, shapes, dtypes, and opset."""
    try:
        model = onnx.load(path)
        onnx.checker.check_model(model)
        if len(model.graph.input) != 1 or len(model.graph.output) != 1:
            raise ModelError("ONNX must contain exactly one input and output.")
        inp, out = model.graph.input[0], model.graph.output[0]
        in_shape = [d.dim_value for d in inp.type.tensor_type.shape.dim]
        out_shape = [d.dim_value for d in out.type.tensor_type.shape.dim]
        if in_shape != cfg.INPUT_SHAPE or out_shape != cfg.OUTPUT_SHAPE:
            raise ModelError(f"ONNX tensor shape mismatch: input={in_shape}, output={out_shape}.")
        if (
            inp.type.tensor_type.elem_type != onnx.TensorProto.FLOAT
            or out.type.tensor_type.elem_type != onnx.TensorProto.FLOAT
        ):
            raise ModelError("ONNX input/output must both be float32.")
        opsets = {item.domain or "ai.onnx": item.version for item in model.opset_import}
        if opsets.get("ai.onnx") != cfg.ONNX_OPSET:
            raise ModelError(f"ONNX opset mismatch: expected {cfg.ONNX_OPSET}, got {opsets.get('ai.onnx')}.")
    except ModelError:
        raise
    except Exception as exc:
        raise ModelError(f"ONNX validation failed: {exc}") from exc


def onnx_predict(
    onnx_path: Path, X: np.ndarray, retries: int | None = None, backoff: float | None = None
) -> np.ndarray:
    """Run bounded ONNX Runtime inference with input/resource checks."""
    X_array = np.asarray(X, dtype=np.float32)
    if X_array.ndim != 2 or X_array.shape[1] != cfg.FEATURE_COUNT:
        raise ModelError(f"Invalid ONNX input shape {X_array.shape}; expected (?, 4).")
    if not np.all(np.isfinite(X_array)):
        raise ModelError("ONNX input contains NaN or infinite values.")
    attempts = cfg.runtime_retries() if retries is None else retries
    delay = cfg.retry_backoff() if backoff is None else backoff
    if not 1 <= attempts <= 10 or delay < 0:
        raise ModelError("Invalid ONNX retry configuration.")
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
            input_name = session.get_inputs()[0].name
            predictions: list[np.ndarray] = []
            for row in X_array:
                row_result = np.asarray(
                    session.run(None, {input_name: row.reshape(1, -1)})[0],
                    dtype=np.float32,
                ).reshape(-1)
                if row_result.size != 1 or not np.all(np.isfinite(row_result)):
                    raise ModelError("ONNX returned invalid prediction output.")
                predictions.append(row_result)
            result = np.concatenate(predictions).astype(np.float32, copy=False)
            if len(result) != len(X_array) or not np.all(np.isfinite(result)):
                raise ModelError("ONNX returned invalid prediction output.")
            return result
        except ModelError:
            raise
        except Exception as exc:
            last_error = exc
            if attempt < attempts:
                time.sleep(delay * attempt)
    raise ModelError(f"ONNX Runtime failed after {attempts} attempts: {last_error}") from last_error


def parity_check(
    model: LinearRegression, X_test: np.ndarray, onnx_path: Path, retries: int, backoff: float
) -> tuple[float, float]:
    """Require sklearn/ONNX parity over at least 100 deterministic samples."""
    if len(X_test) < cfg.PARITY_SAMPLE_COUNT:
        raise ModelError("Insufficient test samples for parity check.")
    Xp = X_test[: cfg.PARITY_SAMPLE_COUNT].astype(np.float32)
    sklearn_pred = np.asarray(model.predict(Xp), dtype=np.float32).reshape(-1)
    onnx_pred = onnx_predict(onnx_path, Xp, retries, backoff)
    diff = np.abs(sklearn_pred - onnx_pred)
    max_drift, mean_drift = float(np.max(diff)), float(np.mean(diff))
    if max_drift >= cfg.PARITY_MAX_ABS_TOLERANCE or mean_drift > cfg.PARITY_MEAN_ABS_TOLERANCE:
        raise ModelError(f"ONNX parity failed: max={max_drift:.10g}, mean={mean_drift:.10g}.")
    return max_drift, mean_drift


def build_metadata(
    metrics: dict[str, float], max_drift: float, mean_drift: float, X: np.ndarray, fingerprint: str
) -> dict[str, Any]:
    """Build versioned frontend/ZK metadata including lineage and quality gates."""
    bounds = {
        name: {
            "min": float(np.min(X[:, i])),
            "max": float(np.max(X[:, i])),
            "step": cfg.FRONTEND_STEP[name],
            "default": cfg.FRONTEND_DEFAULT[name],
        }
        for i, name in enumerate(cfg.FEATURE_NAMES)
    }
    return {
        "schema_version": cfg.ARTIFACT_SCHEMA_VERSION,
        "model_name": cfg.MODEL_NAME,
        "model_version": cfg.MODEL_VERSION,
        "framework": "scikit-learn + skl2onnx",
        "onnx_opset": cfg.ONNX_OPSET,
        "input": {"shape": cfg.INPUT_SHAPE, "dtype": cfg.INPUT_DTYPE, "feature_order": feature_order_schema()},
        "output": {
            "shape": cfg.OUTPUT_SHAPE,
            "dtype": cfg.OUTPUT_DTYPE,
            "name": cfg.TARGET_NAME,
            "units": "100,000 USD",
        },
        "frontend": {"validation_bounds": bounds},
        "target": {"name": cfg.TARGET_NAME, "multiplier_usd": 100000},
        "lineage": {
            "dataset": "California Housing",
            "sample_count": cfg.DATASET_EXPECTED_SAMPLES,
            "feature_indices": cfg.FEATURE_INDICES,
            "fingerprint_sha256": fingerprint,
        },
        "quality": {**metrics, "onnx_max_abs_drift": max_drift, "onnx_mean_abs_drift": mean_drift},
    }


def build_weights(model: LinearRegression, metrics: dict[str, float]) -> dict[str, Any]:
    """Build versioned model-weight handoff document."""
    return {
        "schema_version": cfg.ARTIFACT_SCHEMA_VERSION,
        "model_name": cfg.MODEL_NAME,
        "model_version": cfg.MODEL_VERSION,
        "feature_order": feature_order_schema(),
        "weights": [float(v) for v in np.asarray(model.coef_).reshape(-1)],
        "intercept": float(model.intercept_),
        "evaluation": metrics,
    }


def independent_verify(
    model: LinearRegression,
    weights: dict[str, Any],
    X: np.ndarray,
    onnx_path: Path,
    retries: int,
    backoff: float,
) -> None:
    """Verify direct linear equation against ONNX predictions."""
    w = np.asarray(weights["weights"], dtype=np.float64)
    b = float(weights["intercept"])
    sample = X[: cfg.PARITY_SAMPLE_COUNT].astype(np.float64)
    manual = sample @ w + b
    onnx_pred = onnx_predict(onnx_path, sample.astype(np.float32), retries, backoff).astype(np.float64)
    sklearn_pred = np.asarray(model.predict(sample.astype(np.float32)), dtype=np.float64).reshape(-1)
    if (
        float(np.max(np.abs(manual - onnx_pred))) > cfg.MANUAL_MAX_ABS_TOLERANCE
        or float(np.max(np.abs(sklearn_pred - onnx_pred))) > cfg.PARITY_MAX_ABS_TOLERANCE
    ):
        raise ModelError("Independent mathematical verification failed.")


def main(argv: list[str] | None = None) -> int:
    """Execute the complete training/export pipeline under a process lock."""
    options = parse_args("Train and export the zk-appraise model.", argv)
    logger = configure_logging(options.log_level)
    install_signal_handlers(logger)
    output_dir = options.artifact_dir
    ensure_safe_directory(output_dir)
    try:
        with artifact_lock(output_dir):
            check_resources(output_dir)
            create_artifact_backup_snapshot(output_dir, ALL_MANAGED_ARTIFACTS)
            audit_event(output_dir, "train_pipeline", "started")
            write_monitoring_snapshot(output_dir, "running")
            with timed(logger, "load_and_validate_data"):
                X, y = load_data(options.retries, options.backoff)
                fingerprint = dataset_fingerprint(X, y)
            with timed(logger, "train_model"):
                model, X_test, _, metrics = train_model(X, y)
            for name, value in metrics.items():
                log_metric(logger, name, value)
            with timed(logger, "export_and_validate_onnx"):
                onnx_path = export_onnx(model, output_dir)
                inspect_onnx(onnx_path)
                max_drift, mean_drift = parity_check(model, X_test, onnx_path, options.retries, options.backoff)
            log_metric(logger, "onnx_max_abs_drift", max_drift)
            log_metric(logger, "onnx_mean_abs_drift", mean_drift)
            weights = build_weights(model, metrics)
            metadata = build_metadata(metrics, max_drift, mean_drift, X, fingerprint)
            check_shutdown()
            with timed(logger, "persist_handoff_artifacts"):
                atomic_write_json(output_dir / "model_weights.json", weights)
                atomic_write_json(output_dir / "model_meta.json", metadata)
                sample = {
                    "feature_order": cfg.FEATURE_NAMES,
                    "inputs": [[float(v) for v in X[0]]],
                    "expected_output": float(onnx_predict(onnx_path, X[:1], options.retries, options.backoff)[0]),
                }
                atomic_write_json(output_dir / "sample_input.json", sample)
                record_performance_baseline(output_dir, metrics)
                independent_verify(model, weights, X, onnx_path, options.retries, options.backoff)
                write_checksum_manifest(output_dir, TRAIN_ARTIFACTS)
            write_monitoring_snapshot(output_dir, "passed", **metrics, onnx_max_abs_drift=max_drift)
            audit_event(
                output_dir,
                "train_pipeline",
                "passed",
                metrics=metrics,
                dataset_fingerprint=fingerprint,
            )
            logger.info("train_pipeline_pass", extra={"event": "train_pipeline_pass"})
        return 0
    except Exception as exc:
        try:
            audit_event(output_dir, "train_pipeline", "failed", error=str(exc))
        except Exception:
            pass
        logger.error("train_pipeline_failed", extra={"event": "train_pipeline_failed"}, exc_info=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
