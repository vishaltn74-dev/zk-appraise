"""Lightweight local monitoring snapshot for dashboards and CI."""

from __future__ import annotations

import time
from pathlib import Path
from typing import Any

import psutil

import model_config as cfg
from security_utils import atomic_write_json


def write_monitoring_snapshot(directory: Path, status: str, **metrics: float | int | str) -> Path:
    """Persist a monitoring snapshot containing process/resource metrics."""
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage(str(directory))
    payload: dict[str, Any] = {
        "timestamp_epoch": time.time(),
        "status": status,
        "model_name": cfg.MODEL_NAME,
        "model_version": cfg.MODEL_VERSION,
        "process": {"pid": psutil.Process().pid, "rss_bytes": psutil.Process().memory_info().rss},
        "resources": {"memory_available_bytes": memory.available, "disk_free_bytes": disk.free},
        "metrics": metrics,
    }
    path = directory / "monitoring.json"
    atomic_write_json(path, payload)
    return path
