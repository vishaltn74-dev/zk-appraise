"""Append-only audit events for pipeline operations."""

from __future__ import annotations

import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import model_config as cfg

_LOCK = threading.Lock()


def audit_event(directory: Path, action: str, status: str, **context: Any) -> None:
    """Append a redacted audit event to the local audit trail."""
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "pid": os.getpid(),
        "action": action,
        "status": status,
        "model": cfg.MODEL_NAME,
        "model_version": cfg.MODEL_VERSION,
        "context": context,
    }
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / cfg.AUDIT_LOG
    serialized = json.dumps(record, allow_nan=False) + "\n"
    with _LOCK:
        with path.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(serialized)
            handle.flush()
            os.fsync(handle.fileno())
