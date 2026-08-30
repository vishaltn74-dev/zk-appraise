"""California Housing loading, feature extraction, validation, and lineage."""

from __future__ import annotations

import hashlib
import time
from typing import Any

import numpy as np
from sklearn.datasets import fetch_california_housing

import model_config as cfg
from exceptions import DataValidationError


def validate_configuration() -> None:
    """Validate the immutable feature and tensor contract."""
    try:
        cfg.validate()
    except Exception as exc:
        if isinstance(exc, DataValidationError):
            raise
        raise DataValidationError(f"Configuration validation failed: {exc}") from exc


def load_raw_dataset(retries: int | None = None, backoff: float | None = None) -> Any:
    """Load California Housing with bounded transient retries.

    Parameters:
        retries: Maximum number of attempts.
        backoff: Base backoff in seconds.

    Returns:
        scikit-learn dataset object.

    Raises:
        DataValidationError: If loading fails.
    """
    attempts = cfg.runtime_retries() if retries is None else retries
    delay = cfg.retry_backoff() if backoff is None else backoff

    if attempts < 1:
        raise DataValidationError("retries must be >= 1")

    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return fetch_california_housing()
        except Exception as exc:
            last_error = exc
            if attempt < attempts:
                time.sleep(delay * attempt)
    raise DataValidationError(
        f"Unable to load California Housing after {attempts} attempts. "
        f"Check network/cache access. Last error: {last_error}"
    ) from last_error


def validate_arrays(X: np.ndarray, y: np.ndarray) -> None:
    """Validate feature/target arrays against the model contract.

    Parameters:
        X: Feature matrix.
        y: Target vector.

    Raises:
        DataValidationError: If shape, ordering assumptions, or finite-value checks fail.
    """
    if X.shape != (cfg.DATASET_EXPECTED_SAMPLES, cfg.FEATURE_COUNT):
        raise DataValidationError(f"Invalid X shape: {X.shape}; expected (20640, 4).")
    if y.shape != (cfg.DATASET_EXPECTED_SAMPLES,):
        raise DataValidationError(f"Invalid y shape: {y.shape}; expected (20640,).")
    if X.dtype != np.float32 or y.dtype != np.float32:
        raise DataValidationError(f"Expected float32 arrays; got X={X.dtype}, y={y.dtype}.")
    if not np.all(np.isfinite(X)):
        raise DataValidationError("Dataset inputs contain non-finite values (NaN or infinite).")
    if not np.all(np.isfinite(y)):
        raise DataValidationError("Dataset targets contain non-finite values (NaN or infinite).")


def load_data(retries: int | None = None, backoff: float | None = None) -> tuple[np.ndarray, np.ndarray]:
    """Load and validate the canonical four-feature dataset."""
    validate_configuration()
    if retries is None and backoff is None:
        data = load_raw_dataset()
    else:
        data = load_raw_dataset(retries=retries, backoff=backoff)
    if data.data.shape[0] != cfg.DATASET_EXPECTED_SAMPLES:
        raise DataValidationError(f"Dataset sample count mismatch: {data.data.shape[0]}.")
    if data.data.shape[1] != len(cfg.DATASET_FEATURE_NAMES):
        raise DataValidationError(f"Dataset feature count mismatch: {data.data.shape[1]}.")
    if list(data.feature_names) != cfg.DATASET_FEATURE_NAMES:
        raise DataValidationError(f"Dataset feature order mismatch: {list(data.feature_names)}.")
    X = np.asarray(data.data[:, cfg.FEATURE_INDICES], dtype=np.float32)
    y = np.asarray(data.target, dtype=np.float32)
    validate_arrays(X, y)
    return X, y


def dataset_fingerprint(X: np.ndarray, y: np.ndarray) -> str:
    """Return a reproducible SHA-256 fingerprint for dataset lineage."""
    validate_arrays(X, y)
    digest = hashlib.sha256()
    digest.update(X.tobytes(order="C"))
    digest.update(y.tobytes(order="C"))
    digest.update("|".join(cfg.FEATURE_NAMES).encode("utf-8"))
    return digest.hexdigest()
