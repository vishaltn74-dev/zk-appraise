"""Runtime safety controls: graceful shutdown, deadlines, and resource checks."""

from __future__ import annotations

import os
import shutil
import signal
import threading
import time
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

import psutil

import model_config as cfg
from exceptions import AIEngineError

_SHUTDOWN = threading.Event()


class ShutdownRequested(AIEngineError):
    """Raised when a termination signal requests a safe stop."""


def install_signal_handlers(logger: object) -> None:
    """Install SIGINT/SIGTERM handlers that request graceful shutdown."""

    def handler(signum: int, _frame: object) -> None:
        _SHUTDOWN.set()
        if hasattr(logger, "warning"):
            logger.warning("shutdown_requested", extra={"event": "shutdown_requested", "signal": signum})

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            signal.signal(sig, handler)
        except (ValueError, OSError):
            # Signal installation may be unsupported outside the main thread/platform.
            continue


def check_shutdown() -> None:
    """Raise if graceful shutdown has been requested."""
    if _SHUTDOWN.is_set():
        raise ShutdownRequested("Shutdown requested; no new artifact will be committed.")


def reset_shutdown_for_tests() -> None:
    """Clear shutdown state for tests."""
    _SHUTDOWN.clear()


@contextmanager
def deadline(seconds: float, operation: str) -> Iterator[None]:
    """Provide a cooperative deadline for long-running application stages."""
    started = time.monotonic()
    yield
    elapsed = time.monotonic() - started
    if elapsed > seconds:
        raise AIEngineError(f"Operation '{operation}' exceeded deadline of {seconds:.1f}s ({elapsed:.1f}s).")


def check_resources(directory: Path) -> None:
    """Reject execution when memory or free disk is below configured limits."""
    memory = psutil.virtual_memory()
    if memory.available < cfg.MIN_AVAILABLE_MEMORY_BYTES:
        raise AIEngineError(
            f"Insufficient available memory: {memory.available} bytes; minimum is {cfg.MIN_AVAILABLE_MEMORY_BYTES}."
        )
    usage = shutil.disk_usage(directory)
    if usage.free < cfg.MIN_FREE_DISK_BYTES:
        raise AIEngineError(
            f"Insufficient free disk space in '{directory}': {usage.free} bytes; minimum is {cfg.MIN_FREE_DISK_BYTES}."
        )


def process_identity() -> dict[str, int]:
    """Return non-sensitive process identity fields for audit/diagnostics."""
    return {"pid": os.getpid()}
