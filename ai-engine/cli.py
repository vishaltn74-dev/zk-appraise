"""Shared CLI parsing with safe path, timeout, retry, and logging controls."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

import model_config as cfg
from security_utils import validate_artifact_dir


@dataclass(frozen=True)
class CLIOptions:
    """Validated command-line options."""

    artifact_dir: Path
    log_level: str
    retries: int
    backoff: float
    timeout: float


def parse_args(description: str, argv: list[str] | None = None) -> CLIOptions:
    """Parse and validate common CLI options.

    Parameters:
        description: Command description shown by argparse.
        argv: Optional argument list for tests.

    Returns:
        Validated CLI options.
    """
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--artifact-dir", type=Path, default=cfg.artifact_dir())
    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        default=cfg.log_level(),
    )
    parser.add_argument("--retries", type=int, default=cfg.runtime_retries())
    parser.add_argument("--backoff", type=float, default=cfg.retry_backoff())
    parser.add_argument("--timeout", type=float, default=cfg.timeout_seconds())
    args = parser.parse_args(argv)
    artifact_dir = validate_artifact_dir(args.artifact_dir)
    if not 1 <= args.retries <= 10:
        parser.error("--retries must be between 1 and 10")
    if not 0 <= args.backoff <= 60:
        parser.error("--backoff must be between 0 and 60 seconds")
    if not 1 <= args.timeout <= 3600:
        parser.error("--timeout must be between 1 and 3600 seconds")
    return CLIOptions(artifact_dir, args.log_level, args.retries, args.backoff, args.timeout)
