"""Structured JSON logging, timestamps, redaction, and stage metrics."""

from __future__ import annotations

import json
import logging
import sys
import time
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime, timezone

from security_utils import redact


class JsonFormatter(logging.Formatter):
    """Format log records as JSON objects with UTC timestamps."""

    def format(self, record: logging.LogRecord) -> str:
        """Serialize one log record with safe structured context."""
        payload: dict[str, object] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "timestamp_epoch": time.time(),
            "level": record.levelname,
            "logger": record.name,
            "message": redact(record.getMessage()),
        }
        for key in ("event", "duration_seconds", "started_epoch", "metric_name", "metric_value", "check", "stage"):
            if hasattr(record, key):
                payload[key] = redact(getattr(record, key))
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, allow_nan=False)


def configure_logging(level: str = "INFO") -> logging.Logger:
    """Configure the application logger once and return it."""
    logger = logging.getLogger("zk_appraise")
    logger.setLevel(level.upper())
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
        logger.propagate = False
    return logger


@contextmanager
def timed(logger: logging.Logger, event: str, **context: object) -> Iterator[None]:
    """Log stage start/end events and elapsed wall-clock duration."""
    start_wall = time.time()
    start = time.perf_counter()
    logger.info("stage_started", extra={"event": "stage_started", "stage": event, **context})
    try:
        yield
    finally:
        elapsed = round(time.perf_counter() - start, 6)
        logger.info(
            "stage_finished",
            extra={
                "event": "stage_finished",
                "stage": event,
                "duration_seconds": elapsed,
                "started_epoch": start_wall,
                **context,
            },
        )


def log_metric(logger: logging.Logger, name: str, value: float, **context: object) -> None:
    """Emit a numeric metric as a structured event."""
    logger.info("metric", extra={"event": "metric", "metric_name": name, "metric_value": float(value), **context})
