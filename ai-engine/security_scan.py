"""Local dependency and source secret scanning entry point."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from cli import parse_args
from logging_utils import configure_logging

EXCLUDE_PATTERN = (
    r"(\.pytest_cache|\.mypy_cache|\.ruff_cache|venv|\.venv|audit\.jsonl|"
    r"checksums\.json.*|model_meta\.json.*|test_vectors\.json|health\.json.*|"
    r"metrics\.json.*|monitoring\.json.*|\.bak$)"
)


def run_pip_audit(cwd: Path) -> int:
    """Execute pip-audit against pinned dependencies."""
    cmd = [sys.executable, "-m", "pip_audit", "-r", "requirements.txt"]
    result = subprocess.run(cmd, cwd=cwd, text=True, check=False)
    return result.returncode


def run_detect_secrets(cwd: Path) -> int:
    """Execute detect-secrets and fail if any secrets are discovered."""
    cmd = [
        sys.executable,
        "-m",
        "detect_secrets",
        "scan",
        "--all-files",
        "--exclude-files",
        EXCLUDE_PATTERN,
    ]
    result = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True, check=False)
    if result.returncode != 0:
        return result.returncode
    try:
        data = json.loads(result.stdout)
        findings = data.get("results", {})
        if findings:
            print("Secrets detected by detect-secrets:", file=sys.stderr)
            for filepath, secrets in findings.items():
                print(f"  {filepath}: {len(secrets)} potential secret(s)", file=sys.stderr)
            return 1
    except json.JSONDecodeError:
        pass
    return 0


def main(argv: list[str] | None = None) -> int:
    """Run pip-audit and detect-secrets against the source tree."""
    options = parse_args("Run dependency CVE and source secret scans.", argv)
    logger = configure_logging(options.log_level)
    root = Path(__file__).resolve().parent

    logger.info("security_scan_started", extra={"event": "security_scan_started", "scanner": "pip_audit"})
    code = run_pip_audit(root)
    if code != 0:
        logger.error(
            "security_scan_failed",
            extra={"event": "security_scan_failed", "scanner": "pip_audit", "exit_code": code},
        )
        return code

    logger.info("security_scan_started", extra={"event": "security_scan_started", "scanner": "detect_secrets"})
    code = run_detect_secrets(root)
    if code != 0:
        logger.error(
            "security_scan_failed",
            extra={"event": "security_scan_failed", "scanner": "detect_secrets", "exit_code": code},
        )
        return code

    logger.info("security_scan_pass", extra={"event": "security_scan_pass"})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
