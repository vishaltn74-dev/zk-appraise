# Cryptography & ZKML Engineering Execution Plan (Remaining Phases)

**Branch Target:** `cryptography-lead`  
**Role:** ZKML Circuit & Systems Lead (Person 2)  
**Upstream Status:** Phase 1 (Circuit Compilation) & Phase 2 (Test Phase I Fidelity) are **COMPLETED & PASSING** (8/8 tests passed).  
**Remaining Scope:** Phase 3 (Compact Contract Interface & Serialization), Phase 4 (Client Wasm Prover & Worker Streaming), Phase 5 (Security Auditing & Test Phase II), and Phase 6 (Key Freezing & Standalone Auditor CLI).

---

## 1. Workstream Overview & Architecture

```
                               CURRENT PROGRESS BOUNDARY
                                          │
 ┌────────────────────────────────────────┴────────────────────────────────────────┐
 │ COMPLETED:                                                                      │
 │ • zk-circuits/src/{model_gen.py, circuit_builder.py, export_abi.py}             │
 │ • Artifacts: model.onnx, settings.json, model.compiled, kzg.srs, pk.key, vk.key │
 │ • Precision & soundess test suites: tests/zk/test_fidelity.py (MAPE: 0.125%)    │
 └────────────────────────────────────────┬────────────────────────────────────────┘
                                          │
                                          ▼
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ REMAINING ROADMAP (Phases 3 to 6):                                              │
 │                                                                                 │
 │ [Phase 3] Compact Verifier ABI & Public Input Marshaling                        │
 │           └─ contracts/src/AppraisalVerifier.compact bindings & field parsing   │
 │                                                                                 │
 │ [Phase 4] Browser Wasm Prover Pipeline & Memory Streaming                       │
 │           └─ frontend/public/wasm/ runtime & frontend/src/workers/prover.worker.ts│
 │                                                                                 │
 │ [Phase 5] Security Penetration Testing & Test Phase II                          │
 │           └─ tests/zk/test_security_audit.py & nullifier replay resistance      │
 │                                                                                 │
 │ [Phase 6] Circuit Key Freezing & Auditor Standalone CLI                         │
 │           └─ zk-circuits/src/verify_standalone.py & audit manifest              │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 3: Midnight Compact Verifier Integration & Circuit ABI

**Objective:** Bridge the cryptographic proof format and public inputs produced by EZKL into Midnight Compact contracts without leaking private property features.

### Tasks to Implement:

#### 1. Public Input Field Serialization (`zk-circuits/src/export_abi.py` extension)
* Generate helper functions that serialize EZKL proof vectors ($\pi$) and scalar public inputs into Midnight Compact byte arrays / field element representations.
* Ensure the public input schema explicitly maps:
  1. `public_inputs[0]`: Quantized appraisal output ($y_{\text{val}}$).
  2. `public_inputs[1]`: Quantization scale factor ($2^S$).
  3. `public_inputs[2]`: Model verification key commitment / hash ($H(\text{vk})$).

#### 2. Compact Verifier Logic (`contracts/src/AppraisalVerifier.compact`)
* Ingest the verification key (`zk-circuits/vk.key`) format into the contract verification circuit.
* Implement verification checks:
  * Validate proof validity $\pi$ against $H(\text{vk})$.
  * Check that the de-quantized appraisal meets the requested loan collateral minimum:
    $$\frac{y_{\text{val}}}{2^S} \ge \text{Required Collateral Base}$$
* Implement nullifier verification linking the private property nonce and borrower commitment to prevent replay attacks.

---

## 3. Phase 4: Client-Side WebAssembly Prover Pipeline

**Objective:** Package and optimize the EZKL WebAssembly prover runtime for zero-freeze, client-side proof generation within the React Web Worker.

### Tasks to Implement:

#### 1. Wasm Runtime Deployment (`frontend/public/wasm/`)
* Build and package the optimized EZKL WebAssembly binaries (`ezkl_bg.wasm` / `ezkl.js`) into `frontend/public/wasm/`.
* Configure memory limits in Wasm initialization (target memory buffer allocation $\le 1.5\text{ GB}$).

#### 2. Streaming Prover Worker (`frontend/src/workers/prover.worker.ts`)
* Implement memory-efficient streaming for heavy assets (`zk-circuits/kzg.srs`, `zk-circuits/pk.key`, and `zk-circuits/model.compiled`):
  * Fetch and cache buffers via IndexedDB/Cache API to eliminate redundant network downloads.
  * Execute witness assignment and KZG SNARK synthesis inside the Web Worker.
* Define typed RPC message handlers:
  * `INIT_PROVER`: Preloads Wasm module and cached SRS/keys.
  * `GENERATE_PROOF`: Ingests normalized private property feature array, runs witness generation, synthesizes proof, and outputs `{ proof, publicInputs, duration }`.

#### 3. Frontend Proof Service Bridge (`frontend/src/services/proofService.ts`)
* Provide typed Promise-based TypeScript wrappers managing Worker instantiation, proof progress subscriptions, error recovery, and memory termination.

---

## 4. Phase 5: Security Penetration Testing & Test Phase II

**Objective:** Conduct comprehensive adversarial testing, proof mutation resistance, and memory leak profiling across the cryptographic stack.

### Tasks to Implement:

#### 1. Security & Adversarial Test Suite (`tests/zk/test_security_audit.py`)
* **Proof Tamper Resistance:** Assert that bit-flipped proof payloads ($\pi'$) are rejected by the verifier with deterministic error codes.
* **Public Input Substitution:** Verify that substituting public scalar values while keeping proof bytes unchanged causes immediate verification failure.
* **Nullifier Collision Testing:** Assert that duplicate loan submissions with identical property hashes generate identical nullifiers that the contract registry rejects.
* **Quantization Boundary Flooding:** Test feature vectors with maximum precision floats to verify deterministic integer rounding without runtime overflow.

#### 2. Prover Stress & Memory Profiling
* Benchmark $50$ consecutive proof generations in Node.js/Wasm to detect memory leaks or garbage collection stalls.
* Enforce SLA limits under load: RAM peak $\le 2.0\text{ GB}$, latency $\le 8.0\text{ s}$.

---

## 5. Phase 6: Production Key Freezing & Auditor Standalone CLI

**Objective:** Prepare immutable circuit artifacts, verification scripts, and cryptographic documentation for third-party auditing and mainnet deployment.

### Tasks to Implement:

#### 1. Standalone Verification CLI (`zk-circuits/src/verify_standalone.py`)
* Build an independent verification CLI allowing external auditors or DeFi pool operators to verify generated `proof.json` against `zk-circuits/vk.key` and `zk-circuits/settings.json` without needing the full application stack:
  ```bash
  python zk-circuits/src/verify_standalone.py --proof proof.json --vk zk-circuits/vk.key --settings zk-circuits/settings.json
  ```

#### 2. Circuit Audit Manifest (`zk-circuits/CIRCUIT_MANIFEST.md`)
* Document the complete circuit architecture:
  * Graph topology (number of linear gates, lookup arguments, total constraint count).
  * Exact SHA256 hashes of `model.onnx`, `settings.json`, `model.compiled`, and `vk.key`.
  * Public input index layout and scaling mechanics.

---

## 6. Implementation Order & Development Prompts for AI IDE

Follow this step-by-step implementation order in your AI IDE:

```
Step 1: Implement `frontend/public/wasm/` & `frontend/src/workers/prover.worker.ts`
        (Setup Wasm worker, memory caching & proof generation handlers)
   │
   ▼
Step 2: Implement `frontend/src/services/proofService.ts`
        (TypeScript RPC bridge connecting React UI to the worker)
   │
   ▼
Step 3: Enhance `zk-circuits/src/export_abi.py` & `contracts/src/AppraisalVerifier.compact`
        (Compact verification circuit and field element serializer)
   │
   ▼
Step 4: Build `tests/zk/test_security_audit.py`
        (Adversarial proof mutation, nullifier checks & memory leak tests)
   │
   ▼
Step 5: Build `zk-circuits/src/verify_standalone.py` & `zk-circuits/CIRCUIT_MANIFEST.md`
        (Auditor CLI verifier and circuit parameter freezing)
```

---

## 7. Verification Commands

Run the full verification suite to confirm completion of remaining phases:

```bash
# 1. Run full ZK tests (fidelity + security audit)
pytest tests/zk/ -v -s

# 2. Test standalone verifier CLI
python zk-circuits/src/verify_standalone.py --test-mock

# 3. Test frontend TypeScript compilation
cd frontend && npm run build
```
