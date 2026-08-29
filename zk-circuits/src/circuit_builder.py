import os
import json
import asyncio
import ezkl

# Ensure Windows compatibility by setting HOME environment variable if not present
if "HOME" not in os.environ and "USERPROFILE" in os.environ:
    os.environ["HOME"] = os.environ["USERPROFILE"]

def build_circuit_pipeline(circuits_dir: str = "zk-circuits"):
    os.makedirs(circuits_dir, exist_ok=True)
    
    model_path = os.path.abspath(os.path.join(circuits_dir, "model.onnx"))
    settings_path = os.path.abspath(os.path.join(circuits_dir, "settings.json"))
    calibration_path = os.path.abspath(os.path.join(circuits_dir, "input_calibration.json"))
    compiled_path = os.path.abspath(os.path.join(circuits_dir, "model.compiled"))
    srs_path = os.path.abspath(os.path.join(circuits_dir, "kzg.srs"))
    pk_path = os.path.abspath(os.path.join(circuits_dir, "pk.key"))
    vk_path = os.path.abspath(os.path.join(circuits_dir, "vk.key"))
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"ONNX model file not found at {model_path}. Run src/model_gen.py first.")
    if not os.path.exists(calibration_path):
        raise FileNotFoundError(f"Calibration data file not found at {calibration_path}. Run src/model_gen.py first.")

    # 1. Configure settings.json with private inputs, fixed params, public outputs
    run_args = ezkl.PyRunArgs()
    run_args.input_visibility = "private"
    run_args.param_visibility = "fixed"
    run_args.output_visibility = "public"
    
    ezkl.gen_settings(model_path, settings_path, py_run_args=run_args)
    print(f"[+] Generated initial settings -> {settings_path}")

    # 2. Calibrate scale and lookup bit-width against calibration dataset
    ezkl.calibrate_settings(calibration_path, model_path, settings_path, "resources")
    print(f"[+] Calibrated settings against dataset -> {settings_path}")

    # Read calibrated logrows size (k)
    with open(settings_path, "r") as f:
        settings_data = json.load(f)
    logrows = settings_data["run_args"]["logrows"]
    print(f"[+] Optimal circuit log2_rows (k): {logrows}")

    # 3. Compile ONNX model to EZKL arithmetic circuit representation
    ezkl.compile_circuit(model_path, compiled_path, settings_path)
    print(f"[+] Compiled circuit -> {compiled_path}")

    # 4. Generate/fetch KZG SRS for matching logrows size k
    ezkl.gen_srs(srs_path, logrows)
    print(f"[+] Instantiated KZG SRS (k={logrows}) -> {srs_path}")

    # 5. Execute setup to generate Proving Key (pk) & Verification Key (vk)
    ezkl.setup(model=compiled_path, vk_path=vk_path, pk_path=pk_path, srs_path=srs_path)
    print(f"[+] Generated Proving Key -> {pk_path}")
    print(f"[+] Generated Verification Key -> {vk_path}")

    return {
        "settings": settings_path,
        "compiled": compiled_path,
        "srs": srs_path,
        "pk": pk_path,
        "vk": vk_path,
        "logrows": logrows
    }

if __name__ == "__main__":
    circuits = os.path.abspath("zk-circuits")
    res = build_circuit_pipeline(circuits)
    print(f"[+] Circuit setup complete: {res}")
