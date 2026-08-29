import os
import sys
import json
import pytest
import ezkl

# Ensure Windows compatibility by setting HOME env var
if "HOME" not in os.environ and "USERPROFILE" in os.environ:
    os.environ["HOME"] = os.environ["USERPROFILE"]

sys.path.insert(0, os.path.abspath("zk-circuits"))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../zk-circuits")))
sys.path.insert(0, os.path.abspath("ai-engine"))

from src.model_gen import export_onnx_model, generate_calibration_and_input
from src.circuit_builder import build_circuit_pipeline
from src.export_abi import export_verifier_abi

CIRCUITS_DIR = os.path.abspath("zk-circuits")

def test_e2e_circuit_compilation_and_abi_export():
    os.makedirs(CIRCUITS_DIR, exist_ok=True)
    
    # 1. Model generation & ONNX export
    model, onnx_path = export_onnx_model(CIRCUITS_DIR)
    assert os.path.exists(onnx_path), "ONNX model file missing"
    
    # 2. Calibration data generation
    calib_tensor = generate_calibration_and_input(CIRCUITS_DIR)
    assert calib_tensor.shape == (60, 5), "Calibration tensor shape mismatch"
    
    # 3. EZKL compilation and key setup
    pipeline_res = build_circuit_pipeline(CIRCUITS_DIR)
    assert os.path.exists(pipeline_res["compiled"]), "Compiled circuit file missing"
    assert os.path.exists(pipeline_res["srs"]), "SRS file missing"
    assert os.path.exists(pipeline_res["pk"]), "Proving key file missing"
    assert os.path.exists(pipeline_res["vk"]), "Verification key file missing"
    
    # 4. Verifier ABI serialization
    abi = export_verifier_abi(CIRCUITS_DIR)
    assert abi["circuit_metadata"]["logrows"] == pipeline_res["logrows"]
    assert len(abi["private_inputs_schema"]) == 5
    assert abi["public_inputs_schema"]["num_public_outputs"] == 1
    
    # 5. Proof & witness sanity check
    input_path = os.path.join(CIRCUITS_DIR, "input.json")
    witness_path = os.path.join(CIRCUITS_DIR, "e2e_witness.json")
    ezkl.gen_witness(input_path, pipeline_res["compiled"], witness_path)
    assert os.path.exists(witness_path)
    
    mock_valid = ezkl.mock(witness=witness_path, model=pipeline_res["compiled"])
    assert mock_valid is True, "E2E mock proof verification failed"

if __name__ == "__main__":
    pytest.main(["-v", __file__])
