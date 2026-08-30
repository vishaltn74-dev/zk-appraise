# Graph Report - zk-appraise  (2026-08-30)

## Corpus Check
- 96 files · ~58,486 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1085 nodes · 1704 edges · 73 communities (53 shown, 20 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `58e1ab32`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- security_scan.py
- generate_test_vectors.py
- compilerOptions
- train_model.py
- test_ai_engine.py
- package.json
- Compact Language Skill
- ZK-Appraise: AI Lead (Person 1) Multi-Phase Execution Plan
- index.js
- testing/SKILL.md
- Contract
- Midnight Security Skill
- model_config.py
- zk-appraise AI Engine — Production-Hardened
- ZK Real Estate Appraisal Verifier — Technical Specification
- Cryptography & ZKML Engineering Execution Plan (Remaining Phases)
- index.d.ts
- 4. Detailed Multi-Phase Execution Plan
- devDependencies
- App.tsx
- midnight-environment-setup/SKILL.md
- runtime_utils.py
- prover.worker.ts
- export_abi.py
- Midnight Network ZK Loan Application
- TestDataLoading
- useMidnightContract.ts
- VeilCred (ZK-Appraise)
- compilerOptions
- main
- verify_standalone.py
- .alignment
- model_gen.py
- test_security_audit.py
- ZK-Appraise: Production Circuit Audit Manifest
- record_performance_baseline
- mergingplan.md
- RealEstateAppraisalDataset
- parse_args
- index.ts
- LoanCalculator.tsx
- Test Phase II - Security Penetration & Performance Benchmark Report
- prover_daemon.py
- midnightWallet.ts
- Test Phase I - Numerical Fidelity & Resource Profiling Report
- .format
- _AppraisalReport_0
- _Either_0
- _LeafPreimage_0
- _LoanKey_0
- _LoanOutcome_0
- _MerkleTreeDigest_0
- _MerkleTreePath_0
- _MerkleTreePathEntry_0
- _tuple_0
- ZK-Appraise Frontend
- MidnightContractBridge
- ProofService
- implementationplann.md
- vite-env.d.ts
- rules/graphify.md
- workflows/graphify.md
- AGENTS.md
- copilot-instructions.md
- zk-appraise

## God Nodes (most connected - your core abstractions)
1. `Contract` - 38 edges
2. `main()` - 27 edges
3. `parse_args()` - 20 edges
4. `compilerOptions` - 20 edges
5. `ModelError` - 19 edges
6. `load_data()` - 18 edges
7. `configure_logging()` - 18 edges
8. `main()` - 17 edges
9. `atomic_write_json()` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `train_and_export()` --calls--> `export_onnx_model()`  [INFERRED]
  ai-engine/train_valuation_model.py → zk-circuits/src/model_gen.py
- `train_and_export()` --calls--> `generate_calibration_and_input()`  [INFERRED]
  ai-engine/train_valuation_model.py → zk-circuits/src/model_gen.py
- `train_and_export()` --uses--> `RealEstateValuationModel`  [INFERRED]
  ai-engine/train_valuation_model.py → zk-circuits/src/model_gen.py
- `test_e2e_circuit_compilation_and_abi_export()` --calls--> `export_verifier_abi()`  [INFERRED]
  tests/e2e/test_full_pipeline.py → zk-circuits/src/export_abi.py
- `test_dynamic_scale_extraction()` --calls--> `extract_scale_from_settings()`  [INFERRED]
  tests/zk/test_compact_abi.py → zk-circuits/src/export_abi.py

## Import Cycles
- None detected.

## Communities (73 total, 20 thin omitted)

### Community 0 - "security_scan.py"
Cohesion: 0.33
Nodes (8): main(), Path, Local dependency and source secret scanning entry point., Execute pip-audit against pinned dependencies., Execute detect-secrets and fail if any secrets are discovered., Run pip-audit and detect-secrets against the source tree., run_detect_secrets(), run_pip_audit()

### Community 1 - "generate_test_vectors.py"
Cohesion: 0.12
Nodes (24): build_vectors(), main(), Any, ndarray, Generate deterministic ONNX-backed vectors for all California Housing rows., Build and validate every deterministic test vector. Parameters: X: Canonically…, Generate the complete vector artifact with lock, audit, and atomic persistence., install_signal_handlers() (+16 more)

### Community 2 - "compilerOptions"
Cohesion: 0.06
Nodes (34): compilerOptions, allowImportingTsExtensions, allowJs, baseUrl, esModuleInterop, isolatedModules, jsx, lib (+26 more)

### Community 3 - "train_model.py"
Cohesion: 0.13
Nodes (27): ModelError, Raised when training, model export, or model inference fails., atomic_write_bytes(), Atomically write binary content and optionally back up the previous artifact., Bad metrics must never pass the model quality gate., test_quality_gate_rejects_bad_model(), build_metadata(), build_weights() (+19 more)

### Community 4 - "test_ai_engine.py"
Cohesion: 0.05
Nodes (45): audit_event(), Any, Path, Append-only audit events for pipeline operations., Append a redacted audit event to the local audit trail., ndarray, Calculate ZK MAPE with an explicit near-zero denominator floor. Parameters:…, safe_zk_mape() (+37 more)

### Community 5 - "package.json"
Cohesion: 0.06
Nodes (35): @midnight-ntwrk/midnight-js, bugs, url, dependencies, @midnight-ntwrk/midnight-js, description, devDependencies, ts-node (+27 more)

### Community 6 - "Compact Language Skill"
Cohesion: 0.06
Nodes (33): 10) Common Mistakes (The Full List), 11) Keyword Quick Reference, 1) The Mental Model, 2) Contract Structure, 3) Data Types, 4) Ledger State (Public) and `disclose()`, 5) Circuits and Witnesses, 6) Standard Library — Key Functions (+25 more)

### Community 7 - "ZK-Appraise: AI Lead (Person 1) Multi-Phase Execution Plan"
Cohesion: 0.06
Nodes (31): Architectural Data Flow, Deliverable: `model_meta.json`, Downstream Handoff Checklist, Executive Summary & Mission, Git Commit & Push Workflow, Implementation: `generate_test_vectors.py`, Implementation: `train_model.py`, Implementation: `verify_artifacts.py` (+23 more)

### Community 8 - "index.js"
Cohesion: 0.06
Nodes (31): contractReferenceLocations, _descriptor_0, _descriptor_1, _descriptor_10, _descriptor_11, _descriptor_12, _descriptor_13, _descriptor_14 (+23 more)

### Community 9 - "testing/SKILL.md"
Cohesion: 0.07
Nodes (27): 1) Two Error Layers, 2) Reading Compiler Error Messages, 3) The `--skip-zk` Development Loop, 4) Version Management, 5) Common Mistakes and Fixes, 6) Common Environment Issues, 7) Version Check Script, 8) Getting Help (+19 more)

### Community 11 - "Midnight Security Skill"
Cohesion: 0.07
Nodes (26): 1) The Fundamental Visibility Rule, 2) Privacy Audit Checklist, 3) What Leaks Even With Witnesses, 4) Data Leak Patterns (The Common Mistakes), 5) Defensive Patterns (Full Implementations), 6) Transaction Semantics — Security Implications, 7) What ZK Proofs Do and Do Not Guarantee, 8) Merkle Tree Depth Selection (+18 more)

### Community 12 - "model_config.py"
Cohesion: 0.07
Nodes (46): Shared CLI parsing with safe path, timeout, retry, and logging controls., ArtifactValidationError, ConfigurationError, Custom exception hierarchy for actionable pipeline failures., Raised when generated artifacts violate the cross-team contract., Raised when canonical configuration is internally inconsistent., Path, Read-only health check for model artifact integrity and runtime readiness. (+38 more)

### Community 13 - "zk-appraise AI Engine — Production-Hardened"
Cohesion: 0.08
Nodes (24): 10. Static checks and pre-commit, 11. Deployment gate, 12. Performance and observability, 13. Troubleshooting, 14. Final acceptance criteria, 1. Model contract, 2. Python environment, 3. Configuration (+16 more)

### Community 14 - "ZK Real Estate Appraisal Verifier — Technical Specification"
Cohesion: 0.08
Nodes (23): 1. High-Level Architecture, 2.1 Public Ledger (`export ledger`), 2.2 Private State (Witness / Off-Chain Only), 2.3 Derived Public Identifiers (On-Chain but Unlinkable to Wallet), 2. Ledger State — Public vs. Private Boundaries, 3.1 Core Circuits, 3.2 Admin Circuits (Guard: `deriveAdminPublicKey(getUserSecret()) == contractAdmin`), 3.3 Appraisal Tiers & Loan Limits (+15 more)

### Community 15 - "Cryptography & ZKML Engineering Execution Plan (Remaining Phases)"
Cohesion: 0.09
Nodes (21): 1. Public Input Field Serialization (`zk-circuits/src/export_abi.py` extension), 1. Security & Adversarial Test Suite (`tests/zk/test_security_audit.py`), 1. Standalone Verification CLI (`zk-circuits/src/verify_standalone.py`), 1. Wasm Runtime Deployment (`frontend/public/wasm/`), 1. Workstream Overview & Architecture, 2. Circuit Audit Manifest (`zk-circuits/CIRCUIT_MANIFEST.md`), 2. Compact Verifier Logic (`contracts/src/AppraisalVerifier.compact`), 2. Phase 3: Midnight Compact Verifier Integration & Circuit ABI (+13 more)

### Community 16 - "index.d.ts"
Cohesion: 0.10
Nodes (17): AdminPublicKey, AppraisalReport, AppraisalTier, Circuits, Contract, ContractReferenceLocations, ImpureCircuits, Ledger (+9 more)

### Community 17 - "4. Detailed Multi-Phase Execution Plan"
Cohesion: 0.10
Nodes (19): 1. Executive Summary & System Overview, 2. Technical Stack & Architectural Boundaries, 3. Dedicated Circuit Artifact Storage Policy, 4. Detailed Multi-Phase Execution Plan, 5. Delivery Timeline & Milestone Matrix, 6. Definition of Done (DoD), Phase 1: Valuation Modeling & ZK Circuit Compilation, Phase 2: Testing Phase I – Model Fidelity & Prover Constraints (+11 more)

### Community 18 - "devDependencies"
Cohesion: 0.05
Nodes (41): autoprefixer, class-variance-authority, clsx, dependencies, class-variance-authority, clsx, lucide-react, react (+33 more)

### Community 19 - "App.tsx"
Cohesion: 0.16
Nodes (10): App(), GradientMesh(), Hero(), stats, PropertyIntakeForm(), SiteNav(), SiteNavProps, WalletConnector() (+2 more)

### Community 20 - "midnight-environment-setup/SKILL.md"
Cohesion: 0.11
Nodes (17): Agent Behavior, compact: command not found, Docker not running, Final Verification Checklist, Goal, Port 6300 already in use, Responsibilities, Skill: Midnight Environment Setup (+9 more)

### Community 21 - "runtime_utils.py"
Cohesion: 0.14
Nodes (17): AIEngineError, Base exception for all expected AI-engine failures., check_resources(), check_shutdown(), deadline(), process_identity(), Path, Runtime safety controls: graceful shutdown, deadlines, and resource checks. (+9 more)

### Community 22 - "prover.worker.ts"
Cohesion: 0.16
Nodes (13): PropertyIntakeFormProps, getCachedCircuitAsset(), openAssetDatabase(), setCachedCircuitAsset(), PropertyInputs, ProverGenerateMessage, ProverInitMessage, ProverProgress (+5 more)

### Community 23 - "export_abi.py"
Cohesion: 0.20
Nodes (15): test_dynamic_scale_extraction(), test_export_verifier_abi_structure(), test_proof_serialization_to_compact_bytes(), test_public_input_marshaling(), test_vk_commitment_computation(), compute_vk_commitment(), export_verifier_abi(), extract_scale_from_settings() (+7 more)

### Community 24 - "Midnight Network ZK Loan Application"
Cohesion: 0.12
Nodes (16): 10) Security checklist, 11) Production notes, 1) Monorepo Structure, 2) Compact Contract, 3) Witnesses, 4) Attestation API, 5) CLI (headless wallet), 6) TypeScript Integration (browser) (+8 more)

### Community 25 - "TestDataLoading"
Cohesion: 0.17
Nodes (12): Any, ndarray, Recover from transient loader failures within the configured retry budget., Unit tests for deterministic dataset validation., Build a lightweight sklearn-like dataset fixture., Verify that only indices [0,1,2,5] are selected in canonical order., Reject NaN feature values with a contextual validation error., Reject NaN target values. (+4 more)

### Community 26 - "useMidnightContract.ts"
Cohesion: 0.33
Nodes (8): UseMidnightContractReturn, WorkflowState, ContractVerificationResult, globalMidnightContractBridge, LoanStatus, TierConfig, VerificationRequest, CompactProofPayload

### Community 27 - "VeilCred (ZK-Appraise)"
Cohesion: 0.11
Nodes (17): 1. Clone & Install Dependencies, 2. Launch the Frontend DApp, 3. Run the Smart Contract Test Suite, 4. (Optional) Train & Export AI Valuation Model, 🏗️ Core Technology Stack, 🚀 How It Works, 📄 License, 💎 Loan Eligibility & Collateral Tiers (+9 more)

### Community 28 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, exactOptionalPropertyTypes, isolatedModules, jsx, module, moduleDetection (+8 more)

### Community 29 - "main"
Cohesion: 0.16
Nodes (19): dataset_fingerprint(), load_data(), load_raw_dataset(), Any, ndarray, California Housing loading, feature extraction, validation, and lineage., Return a reproducible SHA-256 fingerprint for dataset lineage., Validate the immutable feature and tensor contract. (+11 more)

### Community 30 - "verify_standalone.py"
Cohesion: 0.22
Nodes (14): Namespace, compute_sha256_hash(), extract_circuit_scale(), main(), parse_arguments(), print_audit_banner(), Any, Executes self-contained mock verification testing for auditor pre-flight. (+6 more)

### Community 32 - "model_gen.py"
Cohesion: 0.15
Nodes (12): test_e2e_circuit_compilation_and_abi_export(), fixture, setup_adversarial_pipeline(), fixture, setup_pipeline(), fixture, setup_security_pipeline(), build_circuit_pipeline() (+4 more)

### Community 33 - "test_security_audit.py"
Cohesion: 0.15
Nodes (13): poseidon_domain_nullifier(), Phase 5: Security Penetration Testing & Test Phase II Comprehensive adversarial…, Adversarial Penetration Check: Keep proof bytes intact while forging public…, Robustness & Fuzzing Check: Evaluate extreme upper and lower physical bounds,…, Cryptographic Security Check: Verify that Poseidon nullifiers enforce strict…, Performance SLA & Memory Leak Profiling: Execute 50 consecutive witness and…, Computes a domain-separated Poseidon nullifier over BN254 field elements. Uses…, Adversarial Penetration Check: Mutate bytes within the KZG SNARK proof vector.… (+5 more)

### Community 34 - "ZK-Appraise: Production Circuit Audit Manifest"
Cohesion: 0.14
Nodes (13): 1. Circuit Architecture & Security Parameters, 2. Immutable Circuit Artifacts (SHA-256 Checksums), 3. Public and Private Input Schemas, 4. Precision-Safe Collateral Inequality, 5. Domain-Separated Nullifier Specification, 6. Auditor Standalone CLI Runbook, 7. Cryptographic Sign-Off & Verification Evidence, Execution Commands (+5 more)

### Community 35 - "record_performance_baseline"
Cohesion: 0.40
Nodes (5): load_baseline(), Path, Persist model performance and execution timestamp as a baseline., Load a previously persisted baseline, if present and valid., record_performance_baseline()

### Community 36 - "mergingplan.md"
Cohesion: 0.17
Nodes (11): 1. Compile ML model and generate ZK-circuits artifacts, 2. Run fidelity benchmarks & constraint soundness tests, 3. Verify file placement, Project Directory Structure & Invariant Rules, Step 1: Implement the ZKML Circuit Pipeline (`zk-circuits/src/`), Step 2: Implement Cryptographic & Fidelity Test Suites (`tests/zk/`), Step 3: Implement Midnight Compact Smart Contracts (`contracts/src/`), Step 4: Implement the Frontend & Web Worker Prover (`frontend/`) (+3 more)

### Community 38 - "RealEstateAppraisalDataset"
Cohesion: 0.27
Nodes (5): get_dataloaders(), Real Estate Appraisal Dataset with synthetic feature generation and…, RealEstateAppraisalDataset, train_and_export(), Dataset

### Community 39 - "parse_args"
Cohesion: 0.11
Nodes (25): CLIOptions, parse_args(), Validated command-line options., Parse and validate common CLI options. Parameters: description: Command…, main(), Path, CI/CD deployment gate with timeouts, security scans, tests, and rollback-safe…, Run a deployment command with a hard subprocess timeout. (+17 more)

### Community 40 - "index.ts"
Cohesion: 0.10
Nodes (30): ArtifactUnavailableError, ProofValidationError, ProverExecutionError, ProverUnavailableError, SimulationDisabledError, VersionMismatchError, DaemonProveResponse, DaemonStatusResponse (+22 more)

### Community 41 - "LoanCalculator.tsx"
Cohesion: 0.38
Nodes (5): currency(), LoanCalculator(), LoanCalculatorProps, AppraisalTier, TIER_DEFINITIONS

### Community 42 - "Test Phase II - Security Penetration & Performance Benchmark Report"
Cohesion: 0.33
Nodes (5): 1. Adversarial Penetration Test Summary, 2. 50-Iteration Prover Stress & Resource Profile, 3. Cryptographic Sign-Off, Performance SLA Compliance Table, Test Phase II - Security Penetration & Performance Benchmark Report

### Community 43 - "prover_daemon.py"
Cohesion: 0.16
Nodes (16): create_app(), get_ezkl_version(), load_settings(), main(), Execute the real EZKL proving pipeline: 1. Construct temporary input 2.…, Independently verify a proof using the repository artifacts., Create and configure the aiohttp application., Entry point — validate artifacts, check version, start server. (+8 more)

### Community 44 - "midnightWallet.ts"
Cohesion: 0.29
Nodes (3): MidnightTxResult, MidnightWalletService, SubmitCollateralTxParams

### Community 45 - "Test Phase I - Numerical Fidelity & Resource Profiling Report"
Cohesion: 0.40
Nodes (4): Benchmark Results vs Performance SLAs, Soundness & Security Checks, Summary Performance Metrics, Test Phase I - Numerical Fidelity & Resource Profiling Report

### Community 46 - ".format"
Cohesion: 0.40
Nodes (4): Serialize one log record with safe structured context., Redact common secret-like values from structured log fields., redact(), LogRecord

### Community 56 - "ZK-Appraise Frontend"
Cohesion: 0.17
Nodes (11): 10. External Environment Configuration (Live vs Simulator), 1. Canonical Frontend Runtime, 2. Dependency Installation, 3. Running Locally, 4. Building for Production, 5. Component Architecture & Directory Structure, 6. Where Proof Generation Lives, 7. Where Midnight Wallet Integration Lives (+3 more)

## Knowledge Gaps
- **397 isolated node(s):** `LoanStatus`, `AppraisalTier`, `LoanOutcome`, `LoanKey`, `AppraisalReport` (+392 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MidnightContractBridge` connect `MidnightContractBridge` to `useMidnightContract.ts`, `App.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Contract` connect `Contract` to `index.js`, `MidnightContractBridge`, `.alignment`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `load_data()` connect `main` to `generate_test_vectors.py`, `train_model.py`, `test_ai_engine.py`, `TestDataLoading`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `ModelError` (e.g. with `test_onnx_input_rejects_nan()` and `test_quality_gate_rejects_bad_model()`) actually correct?**
  _`ModelError` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `LoanStatus`, `AppraisalTier`, `LoanOutcome` to the rest of the system?**
  _397 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `generate_test_vectors.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._