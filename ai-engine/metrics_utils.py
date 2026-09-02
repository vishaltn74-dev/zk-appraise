"""Numerical metrics and persisted performance baselines."""

from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np

import model_config as cfg
from exceptions import ModelError
from security_utils import atomic_write_json


def safe_zk_mape(reference: np.ndarray, candidate: np.ndarray) -> tuple[float, int]:
    """Calculate ZK MAPE with an explicit near-zero denominator floor.

    Parameters:
        reference: ONNX reference predictions.
        candidate: EZKL/circuit predictions.

    Returns:
        MAPE and count of reference values below the configured threshold.

    Raises:
        ModelError: If shapes or numeric values are invalid.
    """
    ref = np.asarray(reference, dtype=np.float64).reshape(-1)
    pred = np.asarray(candidate, dtype=np.float64).reshape(-1)
    if ref.shape != pred.shape:
        raise ModelError(f"ZK MAPE shape mismatch: reference={ref.shape}, candidate={pred.shape}")
    if not np.all(np.isfinite(ref)) or not np.all(np.isfinite(pred)):
        raise ModelError("ZK MAPE cannot be calculated from non-finite values.")
    near_zero = int(np.count_nonzero(np.abs(ref) < cfg.ZK_MAPE_THRESHOLD))
    denominator = np.maximum(np.abs(ref), cfg.ZK_MAPE_THRESHOLD)
    return float(np.mean(np.abs(pred - ref) / denominator)), near_zero


def record_performance_baseline(directory: Path, metrics: dict[str, float]) -> None:
    """Persist model performance and execution timestamp as a baseline."""
    payload = {
        "schema_version": cfg.ARTIFACT_SCHEMA_VERSION,
        "recorded_at_epoch": time.time(),
        "model_name": cfg.MODEL_NAME,
        "model_version": cfg.MODEL_VERSION,
        "metrics": {k: float(v) for k, v in metrics.items()},
    }
    atomic_write_json(directory / cfg.METRICS_FILE, payload)


def load_baseline(directory: Path) -> dict[str, float] | None:
    """Load a previously persisted baseline, if present and valid."""
    path = directory / cfg.METRICS_FILE
    if not path.exists():
        return None
    payload = json.loads(path.read_text(encoding="utf-8"))
    metrics = payload.get("metrics")
    if not isinstance(metrics, dict):
        raise ModelError(f"Invalid metrics baseline at '{path}'.")
    return {str(k): float(v) for k, v in metrics.items()}
