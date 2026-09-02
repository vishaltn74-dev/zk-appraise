"""Immutable model contract plus validated operational configuration."""

from __future__ import annotations

import os
from pathlib import Path

from exceptions import ConfigurationError

PROJECT_ROOT: Path = Path(__file__).resolve().parent
FEATURE_INDICES: list[int] = [0, 1, 2, 5]
FEATURE_NAMES: list[str] = ["MedInc", "HouseAge", "AveRooms", "AveOccup"]
INPUT_SHAPE: list[int] = [1, 4]
OUTPUT_SHAPE: list[int] = [1, 1]
INPUT_DTYPE: str = "float32"
OUTPUT_DTYPE: str = "float32"
TARGET_NAME: str = "MedHouseVal"
ONNX_OPSET: int = 14
RANDOM_STATE: int = 42
TEST_SIZE: float = 0.20
DATASET_EXPECTED_SAMPLES: int = 20_640
FEATURE_COUNT: int = 4
DATASET_FEATURE_NAMES: list[str] = [
    "MedInc",
    "HouseAge",
    "AveRooms",
    "AveBedrms",
    "Population",
    "AveOccup",
    "Latitude",
    "Longitude",
]
MODEL_NAME: str = "house_appraiser"
MODEL_VERSION: str = "1.0.0"
ARTIFACT_SCHEMA_VERSION: str = "1.1.0"
PARITY_SAMPLE_COUNT: int = 100
PARITY_MAX_ABS_TOLERANCE: float = 1e-5
PARITY_MEAN_ABS_TOLERANCE: float = 1e-6
MANUAL_MAX_ABS_TOLERANCE: float = 1e-5
ZK_MAPE_THRESHOLD: float = 1e-8
ZK_MAPE_MAX: float = 0.005
MAX_RETRIES: int = 3
RETRY_BACKOFF_SECONDS: float = 1.0
LOCK_TIMEOUT_SECONDS: float = 30.0
DEFAULT_TIMEOUT_SECONDS: float = 300.0
MAX_VECTOR_COUNT: int = 20_640
MAX_ARTIFACT_BYTES: int = 50 * 1024 * 1024
MIN_AVAILABLE_MEMORY_BYTES: int = 256 * 1024 * 1024
MIN_FREE_DISK_BYTES: int = 100 * 1024 * 1024
MAX_LOG_FIELD_LENGTH: int = 4000
CHECKSUM_MANIFEST: str = "checksums.json"
AUDIT_LOG: str = "audit.jsonl"
METRICS_FILE: str = "metrics.json"
HEALTH_FILE: str = "health.json"
FRONTEND_STEP: dict[str, float] = {
    "MedInc": 0.01,
    "HouseAge": 1.0,
    "AveRooms": 0.01,
    "AveOccup": 0.01,
}
FRONTEND_DEFAULT: dict[str, float] = {
    "MedInc": 3.0,
    "HouseAge": 20.0,
    "AveRooms": 5.0,
    "AveOccup": 3.0,
}
QUALITY_MIN_R2: float = 0.30
QUALITY_MAX_RMSE: float = 1.50
QUALITY_MAX_MAE: float = 1.00


def _env(name: str, default: str) -> str:
    value = os.getenv(name, default).strip()
    return value or default


def env_int(name: str, default: int, minimum: int | None = None, maximum: int | None = None) -> int:
    """Read a bounded integer environment variable."""
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        value = int(raw)
    except ValueError as exc:
        raise ConfigurationError(f"{name} must be an integer; got {raw!r}.") from exc
    if minimum is not None and value < minimum:
        raise ConfigurationError(f"{name} must be >= {minimum}; got {value}.")
    if maximum is not None and value > maximum:
        raise ConfigurationError(f"{name} must be <= {maximum}; got {value}.")
    return value


def env_float(name: str, default: float, minimum: float | None = None, maximum: float | None = None) -> float:
    """Read a bounded floating-point environment variable."""
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        value = float(raw)
    except ValueError as exc:
        raise ConfigurationError(f"{name} must be numeric; got {raw!r}.") from exc
    if minimum is not None and value < minimum:
        raise ConfigurationError(f"{name} must be >= {minimum}; got {value}.")
    if maximum is not None and value > maximum:
        raise ConfigurationError(f"{name} must be <= {maximum}; got {value}.")
    return value


def artifact_dir() -> Path:
    """Return a validated artifact directory under the project root."""
    from security_utils import validate_artifact_dir

    return validate_artifact_dir(Path(_env("AI_ENGINE_ARTIFACT_DIR", str(PROJECT_ROOT))))


def log_level() -> str:
    """Return a validated logging level."""
    value = _env("AI_ENGINE_LOG_LEVEL", "INFO").upper()
    if value not in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
        raise ConfigurationError(f"AI_ENGINE_LOG_LEVEL has unsupported value {value!r}.")
    return value


def runtime_retries() -> int:
    """Return bounded retry count."""
    return env_int("AI_ENGINE_MAX_RETRIES", MAX_RETRIES, 1, 10)


def retry_backoff() -> float:
    """Return bounded retry backoff."""
    return env_float("AI_ENGINE_RETRY_BACKOFF_SECONDS", RETRY_BACKOFF_SECONDS, 0.0, 60.0)


def timeout_seconds() -> float:
    """Return bounded operation timeout."""
    return env_float("AI_ENGINE_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS, 1.0, 3600.0)


def validate() -> None:
    """Validate immutable model and operational configuration."""
    if FEATURE_INDICES != [0, 1, 2, 5] or FEATURE_NAMES != ["MedInc", "HouseAge", "AveRooms", "AveOccup"]:
        raise ConfigurationError("Canonical feature contract has been modified.")
    if len(FEATURE_INDICES) != FEATURE_COUNT or INPUT_SHAPE != [1, FEATURE_COUNT] or OUTPUT_SHAPE != [1, 1]:
        raise ConfigurationError("Tensor/feature configuration is inconsistent.")
    if ONNX_OPSET != 14 or RANDOM_STATE != 42 or TEST_SIZE != 0.20:
        raise ConfigurationError("Deterministic model configuration has been modified.")
    if not 0 < TEST_SIZE < 1:
        raise ConfigurationError(f"TEST_SIZE must be between 0 and 1; got {TEST_SIZE}.")
    runtime_retries()
    retry_backoff()
    timeout_seconds()
    log_level()
