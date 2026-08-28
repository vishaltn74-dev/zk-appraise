# ZK-Appraise: Engineering Project Plan & Execution Architecture

**Project Title:** ZK-Appraise: Privacy-Preserving DeFi Collateralization via Zero-Knowledge Machine Learning (ZKML)  
**Lead Architect:** Senior Software Designer / Team Lead  
**Target Ledger:** Midnight Network (Compact Language)  
**Core Technologies:** Python, PyTorch, ONNX, EZKL, Midnight Compact, React, TypeScript, WebAssembly (Wasm)  
**Status:** Approved for Execution  

---

## 1. Executive Summary & System Overview

**ZK-Appraise** enables residential and commercial real estate owners to secure decentralized finance (DeFi) loans against their home equity without disclosing sensitive property information—such as street address, exact square footage, structural features, or granular valuation factors—to public blockchains.

The protocol executes a client-side quantized machine learning appraisal model via **EZKL** to generate a Zero-Knowledge SNARK proof verifying that a property's assessed value meets or exceeds a target collateral threshold ($\text{Appraised Value} \ge \text{Loan Threshold}$). This proof and its associated public commitments are submitted directly to smart contracts written in **Midnight Compact**, enforcing private state transitions and issuing loan entitlements with zero knowledge of underlying property specs.

```
+-----------------------------------------------------------------------------------+
|                            CLIENT BROWSER ENVIRONMENT                             |
|                                                                                   |
|  +-----------------------+     +-------------------+     +---------------------+  |
|  | Private Property Data | --> | Local ONNX Model  | --> | EZKL Prover (Wasm)  |  |
|  | (Address, Specs, Comps)|    | (Quantized INT8)  |     | (Halo2 / KZG SNARK) |  |
|  +-----------------------+     +-------------------+     +----------+----------+  |
|                                                                     |             |
+---------------------------------------------------------------------|-------------+
                                                                      | Proof (π) &
                                                                      | Public Inputs
                                                                      v
+-----------------------------------------------------------------------------------+
|                             MIDNIGHT NETWORK (LEDGER)                             |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Compact Smart Contracts                                                     |  |
|  |  • Verifier Circuit: Validates Proof (π) & Public Commitments               |  |
|  |  • Collateral Ledger: Private Borrower Record & Nonce/Nullifier Tracking   |  |
|  |  • Lending Pool Contract: Updates LTV Ratios & Issues Credit Token          |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Technical Stack & Architectural Boundaries

| Layer / Subsystem | Primary Technologies | Core Responsibilities |
|---|---|---|
| **ML Engine** | Python 3.11, PyTorch, Scikit-learn, ONNX Runtime | Dataset curation, feature engineering, regression modeling, INT8 fixed-point quantization, ONNX graph export. |
| **ZKML Circuit Engine** | EZKL (Halo2/KZG proving system), Rust, WebAssembly | Computational graph compilation, Structured Reference String (SRS) parameter generation, circuit optimization, client-side proving. |
| **Privacy Ledger & Contracts** | Midnight Compact, Midnight SDK, Lace/Midnight Wallet | Zero-knowledge smart contracts, private state management, witness verification, collateral locking, and nullifier management. |
| **Client Frontend** | React 18, TypeScript, TailwindCSS, Web Workers | Private data ingestion, local model inference orchestration, non-blocking proof synthesis, wallet connection, transaction dispatch. |
| **Testing & CI/CD** | PyTest, Vitest, Compact Simulator, Playwright | Model fidelity verification, constraint checking, proof soundness testing, adversarial vector validation, end-to-end integration. |

---

## 3. Dedicated Circuit Artifact Storage Policy

> **CRITICAL REPOSITORY DIRECTORY POLICY:**  
> To avoid cluttering the repository root or leaking intermediary files, **all generated circuit artifacts and cryptographic parameters MUST be saved exclusively inside the `zk-circuits/` folder**.  
>  
> Protected Artifact Directory: `zk-circuits/`  
> Included Files:
> * `zk-circuits/model.onnx`
> * `zk-circuits/input_calibration.json`
> * `zk-circuits/input.json`
> * `zk-circuits/settings.json`
> * `zk-circuits/model.compiled`
> * `zk-circuits/kzg.srs`
> * `zk-circuits/pk.key`
> * `zk-circuits/vk.key`
> * `zk-circuits/verifier_abi.json`

---

## 4. Detailed Multi-Phase Execution Plan

```
Phase 1: Valuation Modeling & Circuit Compilation (Outputs to zk-circuits/)
   │
   ▼
Phase 2: Test Phase I — Model Fidelity & Prover Benchmarking
   │
   ▼
Phase 3: Midnight Compact Contract Architecture
   │
   ▼
Phase 4: Client Frontend & Web Worker Prover Pipeline
   │
   ▼
Phase 5: Test Phase II — End-to-End Integration & Security
   │
   ▼
Phase 6: Production Hardening, Audit & Deployment
```

---

### Phase 1: Valuation Modeling & ZK Circuit Compilation

**Objective:** Design, train, quantize, and export an automated valuation model (AVM) optimized for zero-knowledge arithmetic circuit constraints, outputting all build files to `zk-circuits/`.

#### Tasks & Deliverables:
1. **1.1 Feature Engineering & Model Training (Python):**
   * Curate training dataset from public MLS, census tracts, and macroeconomic real estate data.
   * Restrict input topology to ZK-friendly operations: Linear/Dense layers, integer-based polynomial features, fixed-point operations, and non-saturating activations (`ReLU`).
   * Train a multi-layer regression network evaluating property equity baseline.
2. **1.2 ONNX Graph Serialization & Quantization Calibration:**
   * Export the PyTorch model to `zk-circuits/model.onnx`.
   * Export the calibration dataset to `zk-circuits/input_calibration.json` and a sample test vector to `zk-circuits/input.json`.
   * Run EZKL scale-calibration passes using `zk-circuits/input_calibration.json` to derive optimal fixed-point scaling factors ($S$).
   * Generate static INT8 execution graphs with minimized quantization error.
3. **1.3 EZKL Prover Setup & Circuit Compilation:**
   * Configure circuit properties and save output to `zk-circuits/settings.json`:
     * `input_visibility: "private"` (property features, location scores, comp values).
     * `output_visibility: "public"` (minimum collateral eligibility predicate or quantized bound).
   * Compile computational graph to `zk-circuits/model.compiled`.
   * Download/instantiate matching KZG SRS to `zk-circuits/kzg.srs`.
   * Execute `ezkl setup` to generate:
     * Proving Key: `zk-circuits/pk.key`
     * Verification Key: `zk-circuits/vk.key`
   * Export public input serialization layout to `zk-circuits/verifier_abi.json`.

---

### Phase 2: Testing Phase I – Model Fidelity & Prover Constraints

**Objective:** Validate model inference accuracy post-quantization and verify cryptographic circuit stability under extreme conditions using artifacts stored in `zk-circuits/`.

#### Test Suites & Methodologies:
1. **Precision & Numerical Fidelity Verification:**
   * Compare 32-bit floating point model outputs with INT8 EZKL circuit witnesses generated from `zk-circuits/model.compiled` and `zk-circuits/settings.json` across $15,000+$ unseen property profiles.
   * Enforce threshold: Mean Absolute Percentage Error (MAPE) variance $\le 0.5\%$.
2. **Circuit Constraint & Soundness Analysis:**
   * Test circuit behavior using `ezkl mock` with `zk-circuits/model.compiled` on out-of-distribution values, boundary conditions (zero lot size, extreme square footage), and edge cases.
   * Check for under-constrained arithmetic gates to prevent malicious witness manipulation.
3. **Prover Resource Profiling:**
   * Measure proof generation runtimes, memory footprint, and CPU core utilization across low-end and high-end client hardware targets (Node.js & browser Wasm runtimes) using `zk-circuits/pk.key` and `zk-circuits/kzg.srs`.
   * Performance SLA: RAM usage $\le 2\text{ GB}$, proving latency $\le 8\text{ seconds}$ on standard desktop CPU.
   * Output report to `reports/test_phase1_report.md`.

---

### Phase 3: Midnight Compact Contract Architecture

**Objective:** Implement private state, proof verification, and loan collateralization contracts on the Midnight privacy ledger consuming ABI/VK artifacts from `zk-circuits/`.

#### Tasks & Deliverables:
1. **3.1 Compact State & Schema Definition:**
   * Design private state schemas containing borrower identity commitments and hashed property nonces.
   * Design public ledger state tracking loan pool liquidity, debt obligations, interest indices, and global risk parameters.
2. **3.2 ZK Proof Verification Contract:**
   * Ingest `zk-circuits/verifier_abi.json` and `zk-circuits/vk.key` to implement Compact verification logic accepting EZKL SNARK proofs.
   * Integrate nullifier registers to prevent double-spending the same property valuation across multiple simultaneous loan applications without state clearing.
3. **3.3 Collateral State Machine & Lending Engine:**
   * Formulate state transitions: `SubmitCollateralProof` $\rightarrow$ `VerifyWitness` $\rightarrow$ `LockCollateral` $\rightarrow$ `DisburseLoan`.
   * Implement Loan-to-Value (LTV) constraints directly within Compact circuit contracts.

---

### Phase 4: Frontend Development & Client-Side Proof Pipeline

**Objective:** Build a performant, zero-leakage React application loading circuit assets from `zk-circuits/` into an asynchronous client-side proof worker.

#### Tasks & Deliverables:
1. **4.1 React User Interface & Data Privacy Enclave:**
   * Develop intake forms with local-only memory persistence (strictly zero transmission of raw address or property attributes over HTTP/RPC).
   * Build an interactive loan calculator displaying real-time LTV ratios, interest tiers, and borrowing limits.
2. **4.2 Dedicated Web Worker for EZKL Prover:**
   * Bundle EZKL Wasm runtime and configure worker asset-streaming from `zk-circuits/model.compiled`, `zk-circuits/pk.key`, and `zk-circuits/kzg.srs`.
   * Prevent UI thread blocking during memory-intensive polynomial arithmetic and proof synthesis.
3. **4.3 Wallet Integration & Transaction Dispatch:**
   * Integrate Midnight DApp Connector SDK (Lace / Midnight Wallet).
   * Assemble transaction payloads comprising the ZK proof, public commitments, and loan request parameters.

---

### Phase 5: Testing Phase II – Integration & Protocol Security

**Objective:** Conduct end-to-end integration testing, network simulation, and adversarial penetration tests across the entire decentralized stack.

#### Test Suites & Methodologies:
1. **End-to-End Flow Validation:**
   * Execute full system tests: Client Data Intake $\rightarrow$ Local Wasm Inference $\rightarrow$ EZKL Proof Generation (using `zk-circuits/`) $\rightarrow$ Midnight Wallet Signature $\rightarrow$ Compact Contract State Settlement.
2. **Adversarial & Tamper Resistance Testing:**
   * Submit forged valuation proofs, expired timestamps, and tampered public input vectors to confirm contract-level rejection.
   * Execute replay attacks using recorded proofs to verify nullifier invalidation.
3. **Network Telemetry & Leakage Audit:**
   * Execute comprehensive Wireshark and browser DevTools payload inspections during proving and submission.
   * Guarantee that no raw property identifiers (coordinates, parcel IDs, square footage) appear in RPC requests, headers, or client logs.

---

### Phase 6: Production Hardening, Audit & Deployment

**Objective:** Complete external security audits, lock circuit keys in `zk-circuits/`, deploy contracts to Midnight Testnet/Mainnet, and deliver the production interface.

#### Tasks & Deliverables:
1. **6.1 Smart Contract & ZK Circuit Security Audits:**
   * Commission external cryptographers and smart contract auditors to review Compact code, circuit constraints in `zk-circuits/model.compiled`, and mathematical soundness.
2. **6.2 Testnet Deployment & Closed Alpha Testing:**
   * Deploy finalized Compact contracts to Midnight Testnet.
   * Conduct closed alpha trials with partner DeFi lending pools and real-world property test sets.
3. **6.3 Mainnet Rollout & Circuit Key Freezing:**
   * Freeze and publish immutable verification keys (`zk-circuits/vk.key`), settings (`zk-circuits/settings.json`), and contract addresses.
   * Release open-source CLI verification scripts for independent third-party verification.

---

## 5. Delivery Timeline & Milestone Matrix

| Sprint / Week | Phase | Key Milestone | Deliverables & Artifacts (in `zk-circuits/`) | Primary Owner |
|---|---|---|---|---|
| **Weeks 1–3** | Phase 1 | Model & Circuit Setup | `zk-circuits/{model.onnx, input_calibration.json, settings.json, model.compiled, kzg.srs, pk.key, vk.key, verifier_abi.json}` | Person 1 & Person 2 |
| **Weeks 4–5** | Phase 2 | Test Phase I | Precision benchmark report, constraint validation suite | Person 2 & Person 5 |
| **Weeks 6–8** | Phase 3 | Compact Contracts | Midnight Compact contracts, verifier logic, LTV state machines | Person 3 |
| **Weeks 9–11** | Phase 4 | React Frontend & Worker | Web Worker prover pipeline, DApp UI, Midnight wallet integration | Person 4 |
| **Weeks 12–13** | Phase 5 | Test Phase II | E2E integration test suite, penetration test report, zero-leakage audit | Person 5 |
| **Weeks 14–16** | Phase 6 | Audits & Launch | Comprehensive audit sign-off, Testnet & Mainnet deployment | Team Lead / All |

---

## 6. Definition of Done (DoD)

A release candidate is approved for mainnet deployment only when:
- [x] All circuit and cryptographic artifacts (`settings.json`, `model.compiled`, `pk.key`, `kzg.srs`, `vk.key`, `verifier_abi.json`) reside exclusively in `zk-circuits/` with zero root directory clutter.
- [x] Model inference error between PyTorch (float32) and EZKL (INT8 quantized) is $\le 0.5\%$ across all benchmark sets.
- [x] Client-side proof generation completes in $\le 8\text{ seconds}$ with memory utilization under $2.0\text{ GB}$.
- [x] Midnight Compact contracts achieve $100\%$ unit and integration test branch coverage.
- [x] Dual external security audits (ZK Circuit Constraints & Compact Smart Contracts) yield zero unresolved critical/high vulnerabilities.
- [x] Zero-leakage packet inspection confirms complete cryptographic privacy of raw inputs during live network dispatch.
