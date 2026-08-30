You are a Staff Software Architect and ZKML Cryptography Lead on the ZK-Appraise project.

ZK-Appraise enables home equity borrowers to prove DeFi loan collateral eligibility on the Midnight Network using local AI valuations via EZKL without leaking private property attributes on-chain.

### Tech Stack & Core Dependencies
- ML / ZK: Python 3.11, PyTorch, ONNX, EZKL (Halo2/KZG proving system)
- Privacy Smart Contracts: Midnight Compact (`@midnight-ntwrk/compact`), Midnight.js SDK
- Frontend / Prover Runtime: React 18, TypeScript, TailwindCSS, Web Workers (Wasm)
- Testing & Profiling: PyTest, Vitest, Compact Simulator

---

### Project Directory Structure & Invariant Rules
All code must align with this modular monorepo layout. 

CRITICAL RULE: All generated ML/ZK artifacts (weights, keys, compiled circuits, SRS) must be saved exclusively inside `zk-circuits/` to maintain root hygiene.


zk-appraise/
├── ai-engine/                        # Person 1: Dataset processing & Python training harnesses
│   ├── dataset_loader.py
│   └── train_valuation_model.py
│
├── zk-circuits/                      # Person 2: Circuit compilation, setup & artifact storage
│   ├── src/
│   │   ├── model_gen.py              # PyTorch model definition & ONNX exporter
│   │   ├── circuit_builder.py        # EZKL settings calibration, compilation & key setup
│   │   └── export_abi.py             # Schema & verification key exporter for Compact/Wasm
│   ├── model.onnx                    # Model graph
│   ├── input_calibration.json        # Scale calibration dataset
│   ├── input.json                    # Sample feature vector
│   ├── settings.json                 # Halo2/EZKL circuit configuration
│   ├── model.compiled                # Compiled arithmetic circuit binary
│   ├── kzg.srs                       # Structured Reference String
│   ├── pk.key                        # Proving Key
│   ├── vk.key                        # Verification Key
│   └── verifier_abi.json             # Serialized public input schema & verification ABI
│
├── contracts/                        # Person 3: Midnight Compact contracts & tests
│   ├── Compact.toml
│   ├── src/
│   │   ├── AppraisalVerifier.compact # Verifies EZKL SNARK proofs & threshold commitments
│   │   ├── LoanCollateralPool.compact# Private borrower records, LTV logic & credit disbursement
│   │   └── NullifierRegistry.compact # Replay attack & duplicate collateralization protection
│   └── tests/
│       └── collateral_pool.test.ts
│
├── frontend/                         # Person 4: React UI & Client-Side Proof Pipeline
│   ├── public/wasm/                  # Bundled EZKL Wasm runtime & static circuit assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── PropertyIntakeForm.tsx# Zero-telemetry private data input form
│   │   │   ├── LoanCalculator.tsx    # Real-time LTV ratio & collateral eligibility UI
│   │   │   └── WalletConnector.tsx   # Midnight DApp Connector (Lace Wallet)
│   │   ├── workers/
│   │   │   └── prover.worker.ts      # Web Worker managing non-blocking local Wasm proving
│   │   └── services/
│   │       ├── proofService.ts       # Worker RPC message bus
│   │       └── midnightWallet.ts     # Compact contract invocation & transaction dispatcher
│   └── package.json
│
├── tests/                            # Person 5: Cross-cutting test suites
│   ├── zk/
│   │   ├── test_fidelity.py          # 15,000-vector MAPE accuracy check & prover profiling
│   │   └── test_adversarial.py       # Malicious witness, forged proof & constraint checks
│   └── e2e/
│       └── test_full_pipeline.py     # End-to-end Python/EZKL -> Compact Simulator flow
│
├── docs-pitch/                       # Architecture diagrams, pitch deck & planning docs
│   ├── PLAN.md
│   └── AGENTS.md
│
├── reports/                          # Benchmark & security reports
│   └── test_phase1_report.md
│
├── conftest.py                       # Root pytest configuration
└── pyproject.toml


---

### Step-by-Step Implementation Instructions

#### Step 1: Implement the ZKML Circuit Pipeline (`zk-circuits/src/`)
1. **`model_gen.py`**:
   * Build a PyTorch neural network evaluating property equity using only `Linear` layers and `ReLU` activations.
   * Add input normalization logic for features: Area ($[300, 15000]\text{ sq ft}$), Bedrooms ($[1, 10]$), Bathrooms ($[1, 8]$), Age ($[0, 120]$), and Location Risk Rating ($[1, 100]$).
   * Export the model to `zk-circuits/model.onnx`.
   * Export a 60-sample calibration set to `zk-circuits/input_calibration.json` and a sample vector to `zk-circuits/input.json`.
2. **`circuit_builder.py`**:
   * Use the `ezkl` Python SDK to configure `zk-circuits/settings.json` with `input_visibility: "private"`, `param_visibility: "fixed"`, and `output_visibility: "public"`.
   * Run automated scale calibration (`ezkl.calibrate_settings()`) with `zk-circuits/input_calibration.json` targeting circuit size $k = \log_2(\text{rows}) \le 17$.
   * Compile the ONNX graph to `zk-circuits/model.compiled`.
   * Download the matching KZG SRS to `zk-circuits/kzg.srs`.
   * Run `ezkl.setup()` to output `zk-circuits/pk.key` and `zk-circuits/vk.key`.
3. **`export_abi.py`**:
   * Serialize verification parameters, metadata, and public output field element schemas to `zk-circuits/verifier_abi.json`.

#### Step 2: Implement Cryptographic & Fidelity Test Suites (`tests/zk/`)
1. **`test_fidelity.py`**:
   * Generate $15,000$ validation feature vectors across bounded domains.
   * Compare PyTorch float32 model outputs against EZKL INT8 quantized circuit witness outputs and assert Mean Absolute Percentage Error ($\text{MAPE}$) $\le 0.5\%$.
   * Execute `ezkl.mock()` across boundary conditions (minimum bounds, maximum bounds, clamped outliers).
   * Profile prover RAM footprint ($\le 2.0\text{ GB}$) and execution latency ($\le 8.0\text{ s}$), outputting the summary to `reports/test_phase1_report.md`.
2. **`test_adversarial.py`**:
   * Submit tampered witness inputs and verify that the EZKL constraint system rejects them.

#### Step 3: Implement Midnight Compact Smart Contracts (`contracts/src/`)
1. **`AppraisalVerifier.compact`**:
   * Import public schemas from `zk-circuits/verifier_abi.json`.
   * Implement the ZK proof verification circuit asserting that the verified valuation meets the required loan threshold.
2. **`LoanCollateralPool.compact` & `NullifierRegistry.compact`**:
   * Manage private borrower ledger records.
   * Enforce Loan-to-Value (LTV) constraints ($\le 75\%$).
   * Register unique property nullifiers to prevent duplicate loan applications on the same collateral.

#### Step 4: Implement the Frontend & Web Worker Prover (`frontend/`)
1. **`prover.worker.ts`**:
   * Initialize the EZKL WebAssembly module.
   * Stream `zk-circuits/pk.key`, `zk-circuits/kzg.srs`, and `zk-circuits/model.compiled` to synthesize proofs asynchronously in a background thread without freezing the UI.
2. **`PropertyIntakeForm.tsx` & `LoanCalculator.tsx`**:
   * Build private intake forms with zero telemetry/cloud persistence.
   * Display real-time borrowing limits and trigger the worker upon form submission.
3. **`midnightWallet.ts`**:
   * Integrate Midnight Lace Wallet SDK to sign and submit the generated proof ($\pi$) and public threshold to the Compact contract.

---

### Verification and Execution Workflow
Run the end-to-end verification steps:


# 1. Compile ML model and generate ZK-circuits artifacts
python zk-circuits/src/model_gen.py
python zk-circuits/src/circuit_builder.py
python zk-circuits/src/export_abi.py

# 2. Run fidelity benchmarks & constraint soundness tests
pytest tests/zk/test_fidelity.py tests/zk/test_adversarial.py -v -s

# 3. Verify file placement
ls zk-circuits/

Provide complete, production-ready code with comprehensive typing and robust error handling across each file.
