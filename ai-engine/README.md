# zk-appraise AI Engine — Production-Hardened

Deterministic, ZK-friendly California Housing Linear Regression pipeline with security, reliability, quality, audit, and CI/CD controls.

## 1. Model contract

```text
Dataset indices [0, 1, 2, 5]
→ [MedInc, HouseAge, AveRooms, AveOccup]
```

Never use `data.data[:, :4]`. `model_config.py` is the single source of truth.

```text
INPUT_SHAPE  = [1, 4]
OUTPUT_SHAPE = [1, 1]
DTYPE        = float32
ONNX_OPSET   = 14
test_size    = 0.20
random_state = 42
```

## 2. Python environment

Use Python 3.10 for the pinned ONNX/scikit-learn compatibility set.

```powershell
cd ai-engine
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Linux/macOS:

```bash
python3.10 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

The first dataset fetch may require network access.

## 3. Configuration

Operational environment variables:

```text
AI_ENGINE_ARTIFACT_DIR=artifacts
AI_ENGINE_LOG_LEVEL=INFO
AI_ENGINE_MAX_RETRIES=3
AI_ENGINE_RETRY_BACKOFF_SECONDS=1.0
AI_ENGINE_TIMEOUT_SECONDS=300
```

Copy `.env.example` for reference. Do **not** commit `.env` or credentials. The model contract itself is not environment-configurable.

CLI options override operational defaults safely:

```powershell
python train_model.py --help
python train_model.py --artifact-dir artifacts --log-level DEBUG --retries 3 --backoff 1 --timeout 300
```

Artifact paths must remain under the project root; traversal outside the allowed root is rejected.

## 4. Run

```powershell
python train_model.py
python generate_test_vectors.py
python verify_artifacts.py
python health_check.py
```

Pipeline:

```text
load + validate data
→ deterministic train/test split
→ LinearRegression
→ model quality gates
→ ONNX export
→ ONNX checker + Runtime parity
→ weights + metadata + sample
→ 20,640 vectors
→ checksum manifest
→ independent mathematical verification
→ health/deployment gate
```

## 5. Reliability and security controls

### Dependency vulnerability scanning

```powershell
python security_scan.py
```

This runs `pip-audit` against the pinned requirements and `detect-secrets` against repository files. A CI deployment must fail on scanner failure. Pin changes must be reviewed and rescanned; exact pins do not imply vulnerability-free dependencies.

### Secrets management

- `.env`, private keys, and credential-like files are ignored.
- Logs redact common secret patterns.
- Security scanning runs before deployment validation.
- No credentials are required by the model pipeline.
- For production deployment, inject secrets through the deployment platform's secret store rather than source control.

### Artifact race protection

All writer pipelines acquire `.ai-engine.lock`. Multiple concurrent writers cannot replace artifacts simultaneously.

### Atomic writes and graceful shutdown

JSON/ONNX artifacts are written to a temporary file, fsynced, then atomically replaced. Existing artifacts receive `.bak` backups. SIGINT/SIGTERM requests a graceful stop before the next artifact commit.

### Timeouts

CI/deployment subprocesses have a hard configurable timeout (`--timeout`, default 300 seconds). This prevents a hung child process from holding the deployment gate forever. Retry loops are bounded.

### Resource limits

The pipeline checks available memory and artifact-directory free disk before expensive stages. Vector generation is capped at the canonical 20,640 records.

### Audit trail

Pipeline start/pass/failure events are written to `audit.jsonl` with timestamp, PID, model/version, action, and non-secret context.

### Checksums

`checksums.json` stores SHA-256 checksums for the generated handoff artifacts. Verification fails on missing or silently modified files.

### Backup and rollback

Successful writes retain `.bak` copies of replaced artifacts. To restore the latest backups:

```powershell
python rollback.py --artifact-dir artifacts
python verify_artifacts.py --artifact-dir artifacts
```

Rollback should be followed by health verification before traffic is restored.

## 6. Model quality gates

Training fails rather than silently producing a deployable bad model when:

```text
R²   < 0.30
RMSE > 1.50
MAE  > 1.00
```

These are deployment guardrails, not claims about the model's theoretical accuracy. Update them only through reviewed configuration changes.

ONNX parity requires:

```text
max absolute drift < 1e-5
mean absolute drift <= 1e-6
```

on at least 100 deterministic held-out samples.

## 7. Data lineage and compatibility

`model_meta.json` records:

- dataset name and sample count
- feature indices/order
- SHA-256 dataset fingerprint
- model version
- artifact schema version
- tensor contract
- quality metrics

Consumers must reject unsupported `schema_version` values rather than guessing field meanings. Backward-compatible schema changes require a version bump and explicit migration/compatibility handling.

## 8. Health and monitoring

`health_check.py` performs read-only checks of required artifacts, ONNX structure, checksums, metadata schema, and resource availability.

`monitoring.json` records resource usage and key performance metrics. It is suitable as a simple local/CI snapshot; production teams can ship these JSON events into their existing metrics/logging backend. The pipeline intentionally does not embed a separate heavyweight dashboard service.

## 9. Testing

Unit tests:

```powershell
pytest -q -m "not integration"
```

Full integration:

```powershell
pytest -q -m integration
```

All tests:

```powershell
pytest -q
```

Coverage includes canonical mapping, shape validation, NaN inputs/targets, boundary values, retry recovery, path traversal, secret detection, near-zero MAPE, quality gates, and the end-to-end pipeline.

## 10. Static checks and pre-commit

```powershell
ruff check .
ruff format --check .
mypy .
pre-commit install
pre-commit run --all-files
```

## 11. Deployment gate

Run:

```powershell
python deployment_validate.py --artifact-dir artifacts --timeout 300
```

The gate executes:

```text
pip-audit + secret scan
→ ruff
→ mypy
→ pytest
→ artifact verification
→ health check
→ PASS/FAIL
```

A failed gate returns a non-zero exit status. This should be the CI/CD deployment condition.

## 12. Performance and observability

Every major stage emits structured JSON logs containing UTC timestamp, event, and duration. Metrics include training R²/RMSE/MAE and ONNX drift. This gives a baseline for detecting future degradation without adding a separate service dependency.

## 13. Troubleshooting

**`ConfigurationError` for artifact path:** choose a directory below the project root, such as `artifacts/`.

**Checksum mismatch:** do not overwrite the artifact manually. Inspect the audit trail and regenerate or rollback, then run `verify_artifacts.py`.

**Lock timeout:** another pipeline is probably running. Wait for it to finish; do not delete the lock while another process is active.

**Dataset load failure:** confirm network/cache access and retry. The retry count is bounded.

**ONNX parity failure:** treat it as a release blocker. Do not loosen the tolerance to force deployment.

**Quality gate failure:** inspect R²/RMSE/MAE and dataset lineage. A bad model must not be deployed silently.

**Security scan failure:** inspect the reported CVE/secret. Upgrade/replace the vulnerable dependency or remove the secret before deployment.

**Deployment timeout:** inspect the timed-out stage and resource metrics. Increase the timeout only after confirming the workload is legitimately slow.

## 14. Final acceptance criteria

```text
[ ] canonical [0,1,2,5] mapping enforced
[ ] no data.data[:, :4]
[ ] dependency CVE scan passes
[ ] secret scan passes
[ ] artifact path traversal blocked
[ ] inter-process artifact lock enabled
[ ] atomic writes + backups enabled
[ ] bounded deployment timeout enabled
[ ] graceful SIGINT/SIGTERM handling enabled
[ ] model quality gates enabled
[ ] checksums verified
[ ] audit trail generated
[ ] health check passes
[ ] lineage fingerprint matches
[ ] schema version supported
[ ] unit + integration tests pass
[ ] ruff + mypy pass
[ ] deployment_validate.py returns 0
```
