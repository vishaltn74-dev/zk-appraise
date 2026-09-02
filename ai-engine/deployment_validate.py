"""CI/CD deployment gate with timeouts, security scans, tests, and rollback-safe checks."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from cli import parse_args
from logging_utils import configure_logging, timed


def run_gate(command: list[str], cwd: Path, timeout: float) -> None:
    """Run a deployment command with a hard subprocess timeout."""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            text=True,
            capture_output=True,
            check=False,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"Deployment gate timed out after {timeout}s: {' '.join(command)}") from exc
    print_output = result.stdout[-4000:] if result.stdout else ""
    if result.returncode != 0:
        raise RuntimeError(
            f"Deployment gate failed ({result.returncode}): {' '.join(command)}\n"
            f"{print_output}\n{result.stderr[-4000:]}"
        )


def main(argv: list[str] | None = None) -> int:
    """Run security, static analysis, tests, and artifact validation gates."""
    options = parse_args("Run zk-appraise deployment validation gates.", argv)
    logger = configure_logging(options.log_level)
    root = Path(__file__).resolve().parent
    gates = [
        ("security_scan", [sys.executable, "security_scan.py"]),
        ("ruff_check", [sys.executable, "-m", "ruff", "check", "."]),
        ("mypy_check", [sys.executable, "-m", "mypy", "."]),
        ("pytest", [sys.executable, "-m", "pytest", "-q"]),
        (
            "artifact_validation",
            [sys.executable, "verify_artifacts.py", "--artifact-dir", str(options.artifact_dir)],
        ),
        (
            "health_check",
            [sys.executable, "health_check.py", "--artifact-dir", str(options.artifact_dir)],
        ),
    ]
    try:
        for name, command in gates:
            with timed(logger, name):
                run_gate(command, root, options.timeout)
        logger.info("deployment_validation_pass", extra={"event": "deployment_validation_pass"})
        return 0
    except Exception:
        logger.error("deployment_validation_failed", extra={"event": "deployment_validation_failed"}, exc_info=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
