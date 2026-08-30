You are a senior ZKML engineer working on ZK-Appraise. We are implementing Phase 1 (Circuit Compilation & Setup) and Phase 2 (Test Phase I: Fidelity & Resource Profiling) under the Person 2 workstream.

Please implement the full pipeline across the following directory structure:

### Target File Structure

src/
├── model_gen.py        # PyTorch model definition, ONNX export, calibration dataset generation
├── circuit_builder.py  # EZKL settings generation, auto-calibration, compilation, SRS fetching, PK/VK setup
└── export_abi.py       # Serialization helper for vk.key and public input schema (for Midnight Compact/Wasm)
tests/
└── test_fidelity.py    # Batched MAPE validation (<= 0.5%), mock soundness tests, RAM/latency profiling

---

### Implementation Requirements & Specifications

1. **`src/model_gen.py`:**
   * Build a lightweight, ZK-friendly real estate valuation neural network in PyTorch (`Linear`/`Dense` layers with `ReLU` activations; no unsupported non-linearities).
   * Include feature normalization/clamping (e.g., Square Footage $[300, 15000]$, Bedrooms $[1, 10]$, Bathrooms $[1, 8]$, Age $[0, 120]$, Location Risk Score $[1, 100]$).
   * Export the model to `artifacts/model.onnx`.
   * Generate `artifacts/input_calibration.json` ($50+$ representative samples) and a sample `artifacts/input.json`.

2. **`src/circuit_builder.py`:**
   * Use the `ezkl` Python SDK to configure `settings.json` with:
     * `input_visibility: "private"`
     * `param_visibility: "fixed"`
     * `output_visibility: "public"`
   * Execute automated calibration via `ezkl.calibrate_settings()` against `artifacts/input_calibration.json` to optimize scale ($S$) and lookup bit-width without manual guesswork.
   * Compile the ONNX model to `artifacts/model.compiled`.
   * Automatically fetch the matching KZG SRS file (`artifacts/kzg.srs`) based on circuit size $k = \log_2(\text{rows})$ (target $k \le 17$).
   * Run `ezkl.setup()` to output `artifacts/pk.key` and `artifacts/vk.key`.

3. **`src/export_abi.py`:**
   * Export the verification parameters and public input schema to `artifacts/verifier_abi.json`.
   * Ensure the output format clearly defines the serialized field element layouts required downstream by Midnight Compact smart contracts (Person 3) and the React Wasm Web Worker (Person 4).

4. **`tests/test_fidelity.py`:**
   * **Batched Fidelity Verification:** Validate model inference numerical fidelity over $15,000$ generated feature vectors. Compare PyTorch float32 evaluations against quantized fixed-point outputs and assert $\text{MAPE} \le 0.5\%$.
   * **Mock Proving & Soundness:** Run `ezkl.mock()` across a focused subset of edge-case and boundary vectors (minimum values, maximum values, clamped outliers) to verify constraint satisfaction.
   * **Adversarial Assertion:** Ensure altered witnesses deliberately fail circuit constraint checks.
   * **Resource Profiling:** Measure memory allocation ($\le 2\text{ GB}$) and proof generation runtime ($\le 8\text{ s}$) and output the benchmark results to `reports/test_phase1_report.md`.

---

Please generate production-grade, modular Python code for each file, including robust error handling and CLI execution entry points. Let's start with `src/model_gen.py` and `src/circuit_builder.py`.
