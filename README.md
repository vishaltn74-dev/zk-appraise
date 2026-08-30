# ZK-Appraise: Zero-Knowledge Machine Learning Home Equity Appraisal & Lending Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Midnight Network](https://img.shields.io/badge/Midnight-Compact%200.26-blueviolet)](https://midnight.network)
[![ZKML](https://img.shields.io/badge/ZKML-Halo2%20%2F%20EZKL-orange)](https://github.com/zkonnx/ezkl)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Tailwind-blue)](https://reactjs.org/)

**ZK-Appraise** enables home equity borrowers to prove DeFi loan collateral eligibility on the **Midnight Network** using local AI valuations and Zero-Knowledge proofs (ZKML) without revealing sensitive property specifications, addresses, appraisal figures, or user identities on-chain.

---

## 📑 Pitch, Architecture & Documentation Index

Comprehensive technical documentation and pitch blueprints are structured across the repository:

- **Architecture & System Blueprint**: [docs-pitch/PLAN.md](file:///c:/Users/KIIT/zk-appraise/docs-pitch/PLAN.md) — End-to-end technical specification, trust model, and proving pipeline.
- **Multi-Agent Execution Roles**: [docs-pitch/AGENTS.md](file:///c:/Users/KIIT/zk-appraise/docs-pitch/AGENTS.md) — Separation of responsibilities across AI, Cryptography, Smart Contracts, and Frontend leads.
- **Contract Technical Specification**: [contracts/ZK_APPRAISAL_VERIFIER_SPEC.md](file:///c:/Users/KIIT/zk-appraise/contracts/ZK_APPRAISAL_VERIFIER_SPEC.md) — Ledger state schema, Jubjub Schnorr attestation, and privacy boundaries.
- **Circuit Manifest & Verification ABI**: [zk-circuits/CIRCUIT_MANIFEST.md](file:///c:/Users/KIIT/zk-appraise/zk-circuits/CIRCUIT_MANIFEST.md) — Halo2/KZG parameterization, scale factors, and verifier ABI layout.
- **Phase 1 Benchmark Report**: [reports/test_phase1_report.md](file:///c:/Users/KIIT/zk-appraise/reports/test_phase1_report.md) — Numerical fidelity (MAPE $\le 0.5\%$), RAM profiling, and latency benchmarks.
- **Phase 2 Security Audit Report**: [reports/test_phase2_security_report.md](file:///c:/Users/KIIT/zk-appraise/reports/test_phase2_security_report.md) — Resistance against witness forgery, scalar tampering, and replay attacks.

---

## 🌟 Key Features

- **Zero-Telemetry Local AI Valuation**: Properties are evaluated locally using a deterministic linear regression model trained on standardized housing attributes.
- **Client-Side ZKML Proving**: In-browser or local WebAssembly (Wasm) worker executing Halo2/KZG polynomial commitment proofs via EZKL.
- **Midnight Compact Smart Contracts**: Confidential smart contracts enforcing loan-to-value (LTV) limits, appraiser Schnorr signature verification over Jubjub curves, and loan eligibility tiers.
- **Privacy-Preserving On-Chain Identity**: Uses witness-derived, unlinkable `UserPublicKey`s and PIN codes without publishing raw wallet addresses.
- **Double-Collateralization & Replay Protection**: Merkle tree commitment registry (`MerkleTree<16, Bytes<32>>`) paired with a one-time nullifier set (`Set<Bytes<32>>`).

---

## 🏗️ System Architecture & Data Flow

```
┌─────────────────────────┐       ┌───────────────────────────┐
│   Property Intake Form  │ ────> │   Local AI Valuation      │
│  (Zero-Telemetry Specs) │       │   (ONNX Linear Model)     │
└─────────────────────────┘       └─────────────┬─────────────┘
                                                │
                                                ▼
┌─────────────────────────┐       ┌───────────────────────────┐
│  Licensed Appraiser     │       │   EZKL ZKML Prover        │
│  Schnorr Jubjub Witness │ ────> │   (Halo2/KZG SNARK Proof) │
└─────────────────────────┘       └─────────────┬─────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Midnight Network Blockchain                 │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Midnight Compact Contracts                          │  │
│  │   - appraiser_verifier.compact                        │  │
│  │   - AppraisalVerifier.compact                         │  │
│  │   - LoanCollateralPool.compact                        │  │
│  │   - NullifierRegistry.compact                         │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │   Public Ledger State:                                │  │
│  │   • Merkle Commitment Registry (Root check)           │  │
│  │   • One-time Nullifier Set (Anti-double-spend)        │  │
│  │   • Derived User Public Key (Unlinkable)              │  │
│  │   • Loan Outcome Tiers (Platinum/Gold/Silver/Bronze)  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```
zk-appraise/
├── ai-engine/                        # Python ML training, calibration & security harness
│   ├── cli.py                        # Unified CLI entrypoint
│   ├── model_config.py               # Single source of truth for model specifications
│   ├── dataset_loader.py             # California Housing dataset loader & validator
│   ├── train_valuation_model.py      # Deterministic model training & ONNX export
│   └── security_utils.py             # Cryptographic & integrity validators
│
├── zk-circuits/                      # ZKML circuit definition, compilation & artifacts
│   ├── src/
│   │   ├── model_gen.py              # PyTorch model architecture & ONNX exporter
│   │   ├── circuit_builder.py        # EZKL settings calibration & Halo2 keygen
│   │   ├── export_abi.py             # Schema & verification key exporter
│   │   └── verify_standalone.py      # Standalone cryptographic verification tool
│   ├── model.onnx                    # Model graph
│   ├── input_calibration.json        # Scale calibration dataset
│   ├── verifier_abi.json             # Serialized verification ABI schema
│   └── CIRCUIT_MANIFEST.md           # Circuit parameters & configuration manifest
│
├── contracts/                        # Midnight Compact privacy smart contracts
│   ├── appraiser_verifier.compact    # Full appraisal attestation & loan state machine
│   ├── Compact.toml                  # Compact package manifest
│   ├── ZK_APPRAISAL_VERIFIER_SPEC.md # Full contract technical specification
│   ├── src/
│   │   ├── AppraisalVerifier.compact # Modular proof verification contract
│   │   ├── LoanCollateralPool.compact# Private borrower records & disbursement
│   │   └── NullifierRegistry.compact # Replay & double-pledge protection
│   ├── managed/                      # Compiled ZKIR binaries, prover/verifier keys & TS bindings
│   │   ├── contract/                 # TypeScript contract bindings (index.d.ts, index.js)
│   │   ├── keys/                     # Prover & verifier keys for contract circuits
│   │   └── zkir/                     # Binary & JSON ZKIR representations
│   └── tests/
│       └── collateral_pool.test.ts   # Contract simulation test harness
│
├── frontend/                         # React 18 UI & In-Browser Prover
│   ├── public/wasm/                  # Bundled EZKL WebAssembly runtime & static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── PropertyIntakeForm.tsx# Private property details intake
│   │   │   ├── LoanCalculator.tsx    # Real-time LTV ratio & collateral eligibility
│   │   │   └── WalletConnector.tsx   # Midnight Lace Wallet connector
│   │   ├── services/
│   │   │   ├── proofService.ts       # Web Worker message bus
│   │   │   └── midnightWallet.ts     # DApp contract invocation & transaction dispatcher
│   │   └── workers/
│   │       └── prover.worker.ts      # Dedicated Wasm worker for local proof generation
│   ├── components/                   # Interactive appraisal landing page & UI widgets
│   └── package.json
│
├── src/
│   └── contractService.ts            # TypeScript bridge to Midnight.js contract APIs
│
├── tests/                            # Comprehensive cross-cutting test suites
│   ├── zk/
│   │   ├── test_fidelity.py          # 15,000-vector accuracy & prover profiling
│   │   ├── test_adversarial.py       # Malicious witness & tampering attack tests
│   │   ├── test_compact_abi.py       # Compact ABI compatibility checks
│   │   └── test_security_audit.py    # Multi-vector security audit suite
│   └── e2e/
│       └── test_full_pipeline.py     # End-to-end Python -> EZKL -> Compact flow
│
├── docs-pitch/                       # Architecture diagrams, pitch deck & planning docs
│   ├── PLAN.md                       # Comprehensive architectural blueprint
│   ├── AGENTS.md                     # Monorepo multi-agent team roles
│   └── implementationplann.md        # Cryptography & ZKML engineering spec
│
├── reports/                          # Audit & benchmark reports
├── pyproject.toml                    # Root Python dependencies & build config
├── tsconfig.json                     # TypeScript compiler configuration
└── package.json                      # Root npm configuration & scripts
```

---

## 🔒 Privacy & Public/Private Boundaries

| Data Element | Type | Where Stored / Handled | Public Visibility |
| :--- | :--- | :--- | :--- |
| **Property Specs / Address** | Private Input | User Browser / Client Only | ❌ Zero-Knowledge |
| **Appraisal Valuation ($)** | Private Input | Client & Appraiser Witness | ❌ Hidden |
| **Appraiser Signature** | Schnorr Jubjub | Witness only | ❌ In-Circuit Verified |
| **Applicant PIN & Secret** | Secret Witness | Client Wallet / Session | ❌ Never On-Chain |
| **Appraisal Commitment** | Hash Commitment | Merkle Tree on Ledger | ✅ Hash only (Unlinkable) |
| **Appraisal Nullifier** | Spend Nullifier | Nullifier Set on Ledger | ✅ One-time spend flag |
| **Derived User Public Key** | Derived PK | Ledger Index | ✅ Unlinkable to wallet |
| **Loan Status & Tier** | Outcome Struct | Ledger Outcome Map | ✅ Authorized tier & status |

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **Python**: 3.10 or 3.11
- **Midnight Compact Compiler**: `compactc` v0.26.0+ (optional for re-compiling contracts)

### 2. Root & Contract Setup

```bash
# Clone the repository
git clone https://github.com/vishaltn74-dev/zk-appraise.git
cd zk-appraise

# Install root dependencies (Midnight.js, TypeScript, Vitest)
npm install
```

### 3. AI Engine & Circuit Pipeline

```bash
# Set up Python virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r ai-engine/requirements.txt
pip install -e .

# Run deterministic model training & ONNX export
python ai-engine/cli.py train --export-onnx
```

### 4. Running the Frontend DApp

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to launch the ZK-Appraise DApp with client-side proof generation and Midnight wallet integration.

---

## 🧪 Testing & Verification

### Python & Cryptographic Test Suite

Run the full suite of unit, fidelity, adversarial, and end-to-end integration tests:

```bash
# Run all tests
pytest

# Run fidelity & adversarial ZK tests
pytest tests/zk/test_fidelity.py
pytest tests/zk/test_adversarial.py
pytest tests/zk/test_security_audit.py

# Run end-to-end pipeline test
pytest tests/e2e/test_full_pipeline.py
```

### Smart Contract Tests

```bash
# Run Compact contract tests
npm test
```

### Frontend Build & Typecheck

```bash
cd frontend
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
