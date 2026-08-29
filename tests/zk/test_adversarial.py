import os
import sys
import json
import pytest
import ezkl
import torch

# Ensure HOME environment variable for Windows EZKL compatibility
if "HOME" not in os.environ and "USERPROFILE" in os.environ:
    os.environ["HOME"] = os.environ["USERPROFILE"]

sys.path.insert(0, os.path.abspath("zk-circuits"))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../zk-circuits")))

from src.model_gen import export_onnx_model, generate_calibration_and_input
from src.circuit_builder import build_circuit_pipeline

CIRCUITS_DIR = os.path.abspath("zk-circuits")

@pytest.fixture(scope="module")
def setup_adversarial_pipeline():
    os.makedirs(CIRCUITS_DIR, exist_ok=True)
    model, onnx_file = export_onnx_model(CIRCUITS_DIR)
    generate_calibration_and_input(CIRCUITS_DIR)
    pipeline_res = build_circuit_pipeline(CIRCUITS_DIR)
    return pipeline_res

def test_tampered_output_rejection(setup_adversarial_pipeline):
    pipeline_res = setup_adversarial_pipeline
    compiled_path = pipeline_res["compiled"]
    
    input_path = os.path.join(CIRCUITS_DIR, "input.json")
    valid_witness_path = os.path.join(CIRCUITS_DIR, "valid_witness_adv.json")
    tampered_witness_path = os.path.join(CIRCUITS_DIR, "tampered_witness_adv.json")
    
    ezkl.gen_witness(input_path, compiled_path, valid_witness_path)
    
    with open(valid_witness_path, "r") as f:
        witness_data = json.load(f)
        
    # Corrupt public output scalar field element to simulate forged valuation claim
    corrupted_scalar = "0x" + "f" * 64
    witness_data["outputs"][0][0] = corrupted_scalar
    
    with open(tampered_witness_path, "w") as f:
        json.dump(witness_data, f)
        
    # Assert EZKL mock verification fails on corrupted output constraint
    with pytest.raises(Exception):
        ezkl.mock(witness=tampered_witness_path, model=compiled_path)

def test_tampered_input_witness_rejection(setup_adversarial_pipeline):
    pipeline_res = setup_adversarial_pipeline
    compiled_path = pipeline_res["compiled"]
    
    input_path = os.path.join(CIRCUITS_DIR, "input.json")
    valid_witness_path = os.path.join(CIRCUITS_DIR, "valid_witness_input.json")
    tampered_witness_path = os.path.join(CIRCUITS_DIR, "tampered_witness_input.json")
    
    ezkl.gen_witness(input_path, compiled_path, valid_witness_path)
    
    with open(valid_witness_path, "r") as f:
        witness_data = json.load(f)
        
    # Modify inner witness input element
    if "inputs" in witness_data and len(witness_data["inputs"]) > 0:
        original_val = witness_data["inputs"][0][0]
        witness_data["inputs"][0][0] = "0x000000000000000000000000000000000000000000000000000000000000ffff"
        
        with open(tampered_witness_path, "w") as f:
            json.dump(witness_data, f)
            
        with pytest.raises(Exception):
            ezkl.mock(witness=tampered_witness_path, model=compiled_path)

def test_extreme_out_of_bounds_clamping(setup_adversarial_pipeline):
    pipeline_res = setup_adversarial_pipeline
    compiled_path = pipeline_res["compiled"]
    
    # Feature vector far outside normalized operational domain
    extreme_input_path = os.path.join(CIRCUITS_DIR, "extreme_input.json")
    extreme_witness_path = os.path.join(CIRCUITS_DIR, "extreme_witness.json")
    
    extreme_data = {"input_data": [[999999.0, 99.0, 99.0, 999.0, 999.0]]}
    with open(extreme_input_path, "w") as f:
        json.dump(extreme_data, f)
        
    # EZKL witness generation correctly rejects uncalibrated extreme integer overflow
    with pytest.raises(Exception):
        ezkl.gen_witness(extreme_input_path, compiled_path, extreme_witness_path)

if __name__ == "__main__":
    pytest.main(["-v", __file__])
