"""Unit and integration tests for the zk-appraise AI engine."""

from __future__ import annotations

import json
import subprocess
import sys
import time
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import numpy as np
import pytest

import model_config as cfg
from audit_utils import audit_event
from cli import parse_args
from data_utils import load_data
from exceptions import ArtifactValidationError, DataValidationError, ModelError
from health_check import run_health_check
from monitoring import write_monitoring_snapshot
from rollback import RESTORE_TARGETS, restore_artifact_backups

ROOT = Path(__file__).resolve().parent


class TestDataLoading:
    """Unit tests for deterministic dataset validation."""

    def _dataset(self, X: np.ndarray, y: np.ndarray, names: list[str] | None = None) -> Any:
        """Build a lightweight sklearn-like dataset fixture."""
        return SimpleNamespace(
            data=X,
            target=y,
            feature_names=names or cfg.DATASET_FEATURE_NAMES,
        )

    def test_feature_mapping_and_shapes(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Verify that only indices [0,1,2,5] are selected in canonical order."""
        import data_utils

        raw = np.arange(cfg.DATASET_EXPECTED_SAMPLES * 8, dtype=np.float64).reshape(cfg.DATASET_EXPECTED_SAMPLES, 8)
        target = np.arange(cfg.DATASET_EXPECTED_SAMPLES, dtype=np.float64)
        monkeypatch.setattr(data_utils, "load_raw_dataset", lambda: self._dataset(raw, target))
        X, y = load_data()
        np.testing.assert_array_equal(X, raw[:, [0, 1, 2, 5]].astype(np.float32))
        assert X.shape == (cfg.DATASET_EXPECTED_SAMPLES, cfg.FEATURE_COUNT)
        assert y.dtype == np.float32

    def test_nan_inputs_are_rejected(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Reject NaN feature values with a contextual validation error."""
        import data_utils

        raw = np.zeros((cfg.DATASET_EXPECTED_SAMPLES, 8), dtype=np.float64)
        raw[10, 2] = np.nan
        target = np.zeros(cfg.DATASET_EXPECTED_SAMPLES, dtype=np.float64)
        monkeypatch.setattr(data_utils, "load_raw_dataset", lambda: self._dataset(raw, target))
        with pytest.raises(DataValidationError, match="non-finite"):
            load_data()

    def test_nan_targets_are_rejected(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Reject NaN target values."""
        import data_utils

        raw = np.zeros((cfg.DATASET_EXPECTED_SAMPLES, 8), dtype=np.float64)
        target = np.zeros(cfg.DATASET_EXPECTED_SAMPLES, dtype=np.float64)
        target[0] = np.nan
        monkeypatch.setattr(data_utils, "load_raw_dataset", lambda: self._dataset(raw, target))
        with pytest.raises(DataValidationError, match="targets"):
            load_data()

    def test_boundary_values_are_preserved(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Ensure finite boundary-like values are not clipped by the loader."""
        import data_utils

        raw = np.zeros((cfg.DATASET_EXPECTED_SAMPLES, 8), dtype=np.float64)
        raw[:, 0] = np.finfo(np.float32).max / 4
        raw[:, 1] = 0.0
        raw[:, 2] = np.finfo(np.float32).tiny
        raw[:, 5] = np.finfo(np.float32).max / 4
        target = np.ones(cfg.DATASET_EXPECTED_SAMPLES, dtype=np.float64)
        monkeypatch.setattr(data_utils, "load_raw_dataset", lambda: self._dataset(raw, target))
        X, _ = load_data()
        assert np.isfinite(X).all()
        assert X[0, 0] > 0
        assert X[0, 2] > 0


@pytest.mark.integration
def test_full_pipeline() -> None:
    """Run training, vector generation, and strict artifact verification end-to-end."""
    commands = [
        [sys.executable, "train_model.py"],
        [sys.executable, "generate_test_vectors.py"],
        [sys.executable, "verify_artifacts.py"],
    ]
    for command in commands:
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
        assert result.returncode == 0, f"{command} failed:\nSTDOUT={result.stdout}\nSTDERR={result.stderr}"

    vectors = json.loads((ROOT / "test_vectors.json").read_text(encoding="utf-8"))
    assert len(vectors["vectors"]) == cfg.DATASET_EXPECTED_SAMPLES


def test_retry_validation_rejects_invalid_retry_count() -> None:
    """Reject an invalid retry count instead of entering a retry loop."""
    import data_utils

    with pytest.raises(DataValidationError, match="retries must be >= 1"):
        data_utils.load_raw_dataset(retries=0)


def test_transient_dataset_failure_recovers(monkeypatch: pytest.MonkeyPatch) -> None:
    """Recover from transient loader failures within the configured retry budget."""
    import data_utils

    expected = SimpleNamespace(
        data=np.zeros((cfg.DATASET_EXPECTED_SAMPLES, 8)),
        target=np.zeros(cfg.DATASET_EXPECTED_SAMPLES),
        feature_names=cfg.DATASET_FEATURE_NAMES,
    )
    attempts = {"count": 0}

    def flaky_loader() -> Any:
        attempts["count"] += 1
        if attempts["count"] < 3:
            raise OSError("temporary network failure")
        return expected

    monkeypatch.setattr(data_utils, "fetch_california_housing", flaky_loader)
    monkeypatch.setattr(time, "sleep", lambda _seconds: None)
    result = data_utils.load_raw_dataset(retries=3, backoff=0)
    assert result is expected
    assert attempts["count"] == 3


def test_onnx_input_rejects_nan() -> None:
    """Reject NaN before invoking ONNX Runtime."""
    from train_model import onnx_predict

    X = np.zeros((1, cfg.FEATURE_COUNT), dtype=np.float32)
    X[0, 2] = np.nan
    with pytest.raises(ModelError, match="NaN or infinite"):
        onnx_predict(Path("does-not-need-to-exist.onnx"), X)


def test_safe_zk_mape_handles_zero_reference() -> None:
    """Ensure the ZK MAPE policy is finite for zero and near-zero references."""
    from metrics_utils import safe_zk_mape

    reference = np.array([0.0, 1e-12, 2.0], dtype=np.float64)
    candidate = np.array([0.0, 2e-12, 2.001], dtype=np.float64)
    mape, near_zero = safe_zk_mape(reference, candidate)
    assert np.isfinite(mape)
    assert near_zero == 2


def test_artifact_path_traversal_is_rejected() -> None:
    """Reject artifact directories outside the project root."""
    from security_utils import validate_artifact_dir

    with pytest.raises(Exception, match="escapes allowed root"):
        validate_artifact_dir(ROOT.parent / "outside")


def test_safe_secret_scan_detects_obvious_secret() -> None:
    """Detect common credential assignment patterns before commit."""
    from security_utils import scan_text_for_secrets

    assert scan_text_for_secrets("API_KEY=super-secret-value")


def test_quality_gate_rejects_bad_model() -> None:
    """Bad metrics must never pass the model quality gate."""
    from train_model import train_model

    X = np.zeros((cfg.DATASET_EXPECTED_SAMPLES, cfg.FEATURE_COUNT), dtype=np.float32)
    y = np.arange(cfg.DATASET_EXPECTED_SAMPLES, dtype=np.float32)
    with pytest.raises(ModelError, match="quality gate"):
        train_model(X, y)


def test_audit_event_appends_records(tmp_path: Path) -> None:
    """Audit events append distinct valid JSON lines."""
    audit_event(tmp_path, "action_1", "started")
    audit_event(tmp_path, "action_2", "passed", extra_field=123)

    log_path = tmp_path / cfg.AUDIT_LOG
    assert log_path.exists()
    lines = [json.loads(line) for line in log_path.read_text(encoding="utf-8").strip().split("\n")]
    assert len(lines) == 2
    assert lines[0]["action"] == "action_1"
    assert lines[1]["action"] == "action_2"
    assert lines[1]["context"]["extra_field"] == 123


def test_monitoring_snapshot_generation(tmp_path: Path) -> None:
    """Monitoring snapshot creates valid process and resource telemetry."""
    path = write_monitoring_snapshot(tmp_path, "passed", r2=0.55)
    assert path.exists()
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["status"] == "passed"
    assert "process" in data and "pid" in data["process"]
    assert "resources" in data and "memory_available_bytes" in data["resources"]
    assert data["metrics"]["r2"] == 0.55


def test_rollback_restores_all_targets(tmp_path: Path) -> None:
    """Rollback restores all target files from their .bak counterparts."""
    for name in RESTORE_TARGETS:
        backup = tmp_path / f"{name}.bak"
        backup.write_text(f"backup-content-for-{name}", encoding="utf-8")
        target = tmp_path / name
        target.write_text(f"corrupt-content-for-{name}", encoding="utf-8")

    restored = restore_artifact_backups(tmp_path)
    assert len(restored) == len(RESTORE_TARGETS)
    for name in RESTORE_TARGETS:
        assert (tmp_path / name).read_text(encoding="utf-8") == f"backup-content-for-{name}"


def test_rollback_fails_when_no_backups(tmp_path: Path) -> None:
    """Rollback raises ArtifactValidationError when no .bak files exist."""
    with pytest.raises(ArtifactValidationError, match="No artifact backups found"):
        restore_artifact_backups(tmp_path)


def test_health_check_detects_missing_files(tmp_path: Path) -> None:
    """Health check fails if required artifacts are absent."""
    with pytest.raises(ArtifactValidationError, match="missing artifacts"):
        run_health_check(tmp_path, root=tmp_path)


def test_health_check_passes_on_valid_artifacts() -> None:
    """Health check succeeds on root artifact workspace."""
    health = run_health_check(ROOT)
    assert health["status"] == "healthy"
    assert health["model"] == cfg.MODEL_NAME


def test_cli_parsing_options() -> None:
    """CLI parser enforces valid ranges for retries, backoff, and timeouts."""
    opts = parse_args("Test Parser", ["--retries", "5", "--backoff", "2.5", "--timeout", "60"])
    assert opts.retries == 5
    assert opts.backoff == 2.5
    assert opts.timeout == 60.0

    with pytest.raises(SystemExit):
        parse_args("Test Parser", ["--retries", "0"])
