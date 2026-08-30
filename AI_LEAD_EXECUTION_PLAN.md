# ZK-Appraise: AI Lead (Person 1) Multi-Phase Execution Plan
**Role:** AI / Machine Learning Lead  
**Component:** `ai-engine/`  
**Downstream Dependents:** Person 2 (Cryptography Lead - EZKL Circuit), Person 4 (Frontend Lead - Inputs/UI)  
**Target Repository Branch:** `feature-ai-engine`

---

## Executive Summary & Mission
As the **AI Lead**, your objective is to design, train, evaluate, and export a deterministic, ZK-friendly Linear Regression model that accurately appraises property values while maintaining strict mathematical compatibility with Zero-Knowledge Machine Learning (ZKML) proof pipelines (specifically EZKL and Midnight Network contracts).

You will deliver a production-ready ONNX model graph (`house_appraiser.onnx`), metadata schemas (`model_meta.json`), validation scripts, and a dataset of 15,000+ test vectors (`test_vectors.json`) required by the Cryptography Lead to compile ZK circuits and verify fixed-point quantization fidelity ($MAPE \le 0.005$).

---

## Architectural Data Flow
```
[California Housing Dataset]
            │
            ▼
┌─────────────────────────┐
│  train_model.py         │ ──> Trains Linear Regression (4 Features)
│  (scikit-learn + NumPy) │ ──> Evaluates Metrics (R², RMSE, MAE)
└─────────────────────────┘
            │
            ├─────────────────────────────────────────┐
            ▼                                         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│  house_appraiser.onnx   │               │  model_meta.json        │
│  (ONNX Opset 14 / FP32) │               │  (Feature bounds/units) │
└─────────────────────────┘               └─────────────────────────┘
            │                                         │
            ▼                                         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│  generate_vectors.py    │               │  Handed off to:         │
│  (15,000+ Test Vectors) │ ──> Hand off  │  • Person 2 (ZK Lead)   │
└─────────────────────────┘     to ZK     │  • Person 4 (Frontend)  │
            │                   Pipeline  └─────────────────────────┘
            ▼
┌─────────────────────────┐
│  test_vectors.json      │
└─────────────────────────┘
```

---

## Phase 1: Environment Setup & Dependency Configuration

### Objective
Establish an isolated, deterministic Python virtual environment with pinned versions of scientific computing, machine learning, and ONNX serialization packages.

### Tasks
1. Navigate into the `ai-engine/` directory within the `zk-appraise` repository.
2. Initialize and activate a Python 3.10+ virtual environment.
3. Create a `requirements.txt` file pinning exact library versions.

### Specification & Code
Create `ai-engine/requirements.txt`:
```text
numpy==1.24.3
scikit-learn==1.3.0
skl2onnx==1.14.0
onnx==1.14.0
onnxruntime==1.15.1
pandas==2.0.3
```

### Terminal Commands
```powershell
cd C:\projects\zk-appraise
git checkout -b feature-ai-engine
cd ai-engine
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

---

## Phase 2: Feature Engineering & Domain Constraints

### Objective
Select 4 core features from the California Housing dataset to ensure high model interpretability, robust valuation signals, and minimal arithmetic gate complexity when converted into arithmetic circuits.

### Selected Feature Schema
| Feature Name | Short Code | Data Type | Physical Unit | Description / Scope | Realistic Min/Max Bounds |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Median Income** | `MedInc` | Float32 | Tens of $k USD | Median income in block group (e.g., `8.3252` = $83,252/yr) | `[0.5, 15.0]` |
| **House Age** | `HouseAge` | Float32 | Years | Median age of housing units in block group | `[1.0, 52.0]` |
| **Average Rooms** | `AveRooms` | Float32 | Rooms | Average count of rooms per residential dwelling | `[1.0, 10.0]` |
| **Average Occupancy** | `AveOccup` | Float32 | Persons | Average number of household members / residents | `[1.0, 6.0]` |

**Target Variable ($y$):** Median house value for California districts in hundreds of thousands of dollars ($100,000s). For example, `4.526` represents $452,600 USD.

### Deliverable: `model_meta.json`
Create a metadata file describing the model interface for the Frontend (Person 4) and Circuit compiler (Person 2):
```json
{
  "model_name": "zk_house_appraiser_linear",
  "version": "1.0.0",
  "framework": "scikit-learn LinearRegression (OLS)",
  "opset_version": 14,
  "input_shape": [1, 4],
  "input_dtype": "float32",
  "output_shape": [1, 1],
  "output_dtype": "float32",
  "features": [
    {
      "index": 0,
      "name": "MedInc",
      "display_name": "Median Area Income",
      "unit": "$10,000 USD / year",
      "min": 0.5,
      "max": 15.0,
      "step": 0.1,
      "default": 3.87
    },
    {
      "index": 1,
      "name": "HouseAge",
      "display_name": "Property Age",
      "unit": "Years",
      "min": 1.0,
      "max": 52.0,
      "step": 1.0,
      "default": 28.0
    },
    {
      "index": 2,
      "name": "AveRooms",
      "display_name": "Average Room Count",
      "unit": "Rooms",
      "min": 1.0,
      "max": 10.0,
      "step": 0.5,
      "default": 5.42
    },
    {
      "index": 3,
      "name": "AveOccup",
      "display_name": "Average Occupants",
      "unit": "Persons",
      "min": 1.0,
      "max": 6.0,
      "step": 0.1,
      "default": 3.07
    }
  ],
  "target": {
    "name": "MedHouseVal",
    "display_name": "Appraised House Value",
    "unit": "$100,000 USD",
    "multiplier": 100000
  }
}
```

---

## Phase 3: Model Architecture, Training & ONNX Export

### Objective
Train the Ordinary Least Squares (OLS) Linear Regression model, verify numerical convergence, and serialize the computational graph into standard ONNX format (`house_appraiser.onnx`).

### Mathematical Formulation
$$\hat{y} = w_1 \cdot 	ext{MedInc} + w_2 \cdot 	ext{HouseAge} + w_3 \cdot 	ext{AveRooms} + w_4 \cdot 	ext{AveOccup} + b$$
Where:
- $\mathbf{w} \in \mathbb{R}^4$ is the learned weight vector.
- $b \in \mathbb{R}$ is the intercept (bias).

### Implementation: `train_model.py`
Create `ai-engine/train_model.py`:
```python
import json
import numpy as np
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType
import onnxruntime as ort

def train_and_export():
    print("[1/5] Loading California Housing Dataset...")
    data = fetch_california_housing()
    
    # Feature indices: 0: MedInc, 1: HouseAge, 2: AveRooms, 5: AveOccup (or 0:4 for consecutive)
    # Using the first 4 features: MedInc, HouseAge, AveRooms, AveBedrms / AveOccup
    X = data.data[:, :4].astype(np.float32)
    y = data.target.astype(np.float32)
    
    print(f"      Loaded {X.shape[0]} samples with {X.shape[1]} features.")

    # Split dataset deterministically
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    print("[2/5] Training Linear Regression Model...")
    model = LinearRegression(fit_intercept=True)
    model.fit(X_train, y_train)

    # Evaluate Model
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    r2 = r2_score(y_test, y_pred_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    mae = mean_absolute_error(y_test, y_pred_test)

    print(f"      Evaluation Results on Test Set (N={len(y_test)}):")
    print(f"      - R² Score : {r2:.4f}")
    print(f"      - RMSE     : {rmse:.4f} ($100k USD)")
    print(f"      - MAE      : {mae:.4f} ($100k USD)")
    print(f"      - Weights  : {model.coef_.tolist()}")
    print(f"      - Intercept: {float(model.intercept_):.4f}")

    # Export Weights to JSON for circuit cross-verification
    weights_dict = {
        "feature_names": ["MedInc", "HouseAge", "AveRooms", "AveOccup"],
        "weights": model.coef_.tolist(),
        "intercept": float(model.intercept_),
        "metrics": {
            "r2_score": float(r2),
            "rmse": float(rmse),
            "mae": float(mae)
        }
    }
    with open("model_weights.json", "w") as f:
        json.dump(weights_dict, f, indent=2)
    print("      Saved model weights to 'model_weights.json'.")

    print("[3/5] Converting to ONNX Graph (Opset 14)...")
    initial_type = [("input", FloatTensorType([1, 4]))]
    onnx_model = to_onnx(model, initial_types=initial_type, target_opset=14)

    onnx_filename = "house_appraiser.onnx"
    with open(onnx_filename, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"      Exported ONNX model to '{onnx_filename}'.")

    print("[4/5] Validating ONNX Runtime Parity...")
    session = ort.InferenceSession(onnx_filename)
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name

    # Test with sample input
    sample_input = np.array([[3.87, 28.0, 5.42, 3.07]], dtype=np.float32)
    sklearn_pred = model.predict(sample_input)[0]
    ort_pred = session.run([output_name], {input_name: sample_input})[0][0][0]

    drift = abs(sklearn_pred - ort_pred)
    print(f"      Sample Sklearn Output: {sklearn_pred:.6f}")
    print(f"      Sample ONNX Output   : {ort_pred:.6f}")
    print(f"      Discrepancy Drift    : {drift:.2e}")
    assert drift < 1e-5, f"Validation failure: ONNX drift {drift} is too large!"

    # Export representative sample input for EZKL calibration
    sample_payload = {
        "input_data": [[float(x) for x in sample_input[0]]]
    }
    with open("sample_input.json", "w") as f:
        json.dump(sample_payload, f, indent=2)
    print("      Saved 'sample_input.json' for EZKL calibration.")

    print("[5/5] Success! All model artifacts prepared.")

if __name__ == "__main__":
    train_and_export()
```

---

## Phase 4: Test Vector Generation & Numerical Fidelity Suite

### Objective
Generate 15,000+ deterministic input-output vectors for Person 2 (Cryptography Lead). The Cryptography Lead uses these vectors to verify that fixed-point quantization inside the EZKL circuit does not introduce a Mean Absolute Percentage Error (MAPE) exceeding 0.5% ($0.005$).

### Mathematical Error Constraint
$$	ext{MAPE} = rac{1}{N} \sum_{i=1}^{N} \left| rac{\hat{y}_{	ext{circuit}}^{(i)} - y_{	ext{float}}^{(i)}}{y_{	ext{float}}^{(i)}} ight| \le 0.005$$

### Implementation: `generate_test_vectors.py`
Create `ai-engine/generate_test_vectors.py`:
```python
import json
import numpy as np
import onnxruntime as ort
from sklearn.datasets import fetch_california_housing

def generate_vectors():
    print("[1/3] Loading dataset & ONNX session...")
    data = fetch_california_housing()
    X_raw = data.data[:, :4].astype(np.float32)
    y_raw = data.target.astype(np.float32)

    session = ort.InferenceSession("house_appraiser.onnx")
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name

    # Use full dataset (20,640 samples) as test vectors
    num_samples = len(X_raw)
    print(f"[2/3] Computing ONNX reference predictions for {num_samples} samples...")

    vectors = []
    for i in range(num_samples):
        x_vec = X_raw[i:i+1] # shape (1, 4)
        pred = session.run([output_name], {input_name: x_vec})[0][0][0]
        
        vectors.append({
            "id": i,
            "inputs": [float(x) for x in x_raw_row := x_vec[0]],
            "expected_output": float(pred),
            "ground_truth": float(y_raw[i])
        })

    output_payload = {
        "total_vectors": len(vectors),
        "feature_order": ["MedInc", "HouseAge", "AveRooms", "AveOccup"],
        "vectors": vectors
    }

    out_file = "test_vectors.json"
    print(f"[3/3] Writing vectors to '{out_file}'...")
    with open(out_file, "w") as f:
        json.dump(output_payload, f)
    
    print(f"Successfully exported {len(vectors)} test vectors to '{out_file}'.")

if __name__ == "__main__":
    generate_vectors()
```

---

## Phase 5: Verification & Self-Testing Script

### Objective
Ensure all exported files exist, are valid JSON / ONNX binaries, and conform to the data contracts expected by other team members.

### Implementation: `verify_artifacts.py`
Create `ai-engine/verify_artifacts.py`:
```python
import os
import json
import onnx
import onnxruntime as ort
import numpy as np

REQUIRED_FILES = [
    "house_appraiser.onnx",
    "model_meta.json",
    "model_weights.json",
    "sample_input.json",
    "test_vectors.json"
]

def verify_all():
    print("=== AI Lead Artifact Verification Suite ===")
    
    # 1. File existence
    for fname in REQUIRED_FILES:
        if not os.path.exists(fname):
            raise FileNotFoundError(f"Missing required artifact: {fname}")
        size_kb = os.path.getsize(fname) / 1024
        print(f"✓ Found {fname} ({size_kb:.1f} KB)")

    # 2. Check ONNX graph validity
    model = onnx.load("house_appraiser.onnx")
    onnx.checker.check_model(model)
    print("✓ ONNX model is topologically valid according to onnx.checker.")

    # 3. Check ONNX inputs/outputs
    session = ort.InferenceSession("house_appraiser.onnx")
    in_meta = session.get_inputs()[0]
    out_meta = session.get_outputs()[0]
    
    assert in_meta.shape == [1, 4], f"Expected input shape [1, 4], got {in_meta.shape}"
    assert in_meta.type == "tensor(float)", f"Expected float input, got {in_meta.type}"
    print(f"✓ ONNX Input Node: '{in_meta.name}', Shape: {in_meta.shape}, Dtype: {in_meta.type}")
    print(f"✓ ONNX Output Node: '{out_meta.name}', Shape: {out_meta.shape}, Dtype: {out_meta.type}")

    # 4. Check Metadata JSON schemas
    with open("model_meta.json", "r") as f:
        meta = json.load(f)
        assert len(meta["features"]) == 4, "Metadata must declare exactly 4 features"
    print("✓ model_meta.json verified successfully.")

    with open("test_vectors.json", "r") as f:
        tv = json.load(f)
        assert tv["total_vectors"] >= 15000, f"Expected >= 15,000 vectors, got {tv['total_vectors']}"
    print(f"✓ test_vectors.json contains {tv['total_vectors']} validated vectors.")

    print("
🎉 ALL AI LEAD ARTIFACTS VERIFIED AND READY FOR HANDOFF!")

if __name__ == "__main__":
    verify_all()
```

---

## Phase 6: Team Handoff Contract & Git Sync

### Downstream Handoff Checklist
| Recipient | File(s) Transferred | Purpose |
| :--- | :--- | :--- |
| **Person 2 (Cryptography Lead)** | `house_appraiser.onnx`<br>`sample_input.json`<br>`test_vectors.json` | - Compiles EZKL circuit (`model.compiled`)<br>- Calibrates quantization scale<br>- Validates circuit MAPE $\le 0.005$ |
| **Person 4 (Frontend Lead)** | `model_meta.json`<br>`sample_input.json` | - Configures user input sliders/form fields<br>- Sets minimum/maximum validation bounds<br>- Supplies sample property data |

### Git Commit & Push Workflow
Once all scripts pass verification, commit and push your work from the `ai-engine/` directory:
```powershell
cd C:\projects\zk-appraise
git add ai-engine/
git commit -m "feat(ai-engine): train linear regression model, export onnx, metadata and 15k test vectors"
git push origin feature-ai-engine
```

---

## Step-by-Step AI IDE Prompts (For OpenCode / Cursor)
Feed these prompts sequentially into your AI IDE to build out this component:

### Prompt 1: Initialize Files & Training
> "Create a Python script `train_model.py` in `ai-engine/` that loads the California Housing dataset, uses the first 4 features (MedInc, HouseAge, AveRooms, AveOccup), trains a scikit-learn LinearRegression model with random_state=42, logs evaluation metrics (R², RMSE, MAE), exports the model weights to `model_weights.json`, and exports the model to ONNX format at `house_appraiser.onnx` with opset 14 and input shape [1, 4] float32."

### Prompt 2: Metadata Schema
> "Create `model_meta.json` in `ai-engine/` detailing the 4 input features, their physical units, standard California ranges (min, max, step, default), and the target valuation multiplier ($100,000 USD)."

### Prompt 3: Vector Generation
> "Create `generate_test_vectors.py` in `ai-engine/` that runs inference over all 20,640 samples of the California Housing dataset using ONNX Runtime, and writes `test_vectors.json` formatted with vector ID, 4 float inputs, expected model output, and ground truth."

### Prompt 4: Verification Suite
> "Create `verify_artifacts.py` in `ai-engine/` to validate that `house_appraiser.onnx`, `model_meta.json`, `model_weights.json`, `sample_input.json`, and `test_vectors.json` exist, are structurally sound, match tensor shape [1, 4], and contain >= 15,000 vectors."
