import os
import sys
import json
import pytest

# Ensure Windows compatibility by setting HOME env var and adding paths
if "HOME" not in os.environ and "USERPROFILE" in os.environ:
    os.environ["HOME"] = os.environ["USERPROFILE"]

sys.path.insert(0, os.path.abspath("zk-circuits"))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../zk-circuits")))

from src.export_abi import (
    compute_vk_commitment,
    extract_scale_from_settings,
    marshal_public_inputs,
    serialize_proof_to_compact_bytes,
    export_verifier_abi
)

CIRCUITS_DIR = os.path.abspath("zk-circuits")
SETTINGS_PATH = os.path.join(CIRCUITS_DIR, "settings.json")
VK_PATH = os.path.join(CIRCUITS_DIR, "vk.key")

def test_dynamic_scale_extraction():
    assert os.path.exists(SETTINGS_PATH), "Circuit settings.json must exist"
    scale_power = extract_scale_from_settings(SETTINGS_PATH)
    assert isinstance(scale_power, int)
    assert scale_power > 0, "Extracted scale power must be positive"
    
    with open(SETTINGS_PATH, "r") as f:
        settings = json.load(f)
    expected_scale = settings.get("model_output_scales", [settings.get("run_args", {}).get("input_scale", 13)])[0]
    assert scale_power == expected_scale

def test_vk_commitment_computation():
    assert os.path.exists(VK_PATH), "Verification key vk.key must exist"
    commitment = compute_vk_commitment(VK_PATH)
    
    assert commitment.startswith("0x")
    assert len(commitment) == 66  # "0x" + 64 hex characters (32 bytes)
    
    # Deterministic consistency check
    commitment_again = compute_vk_commitment(VK_PATH)
    assert commitment == commitment_again

def test_public_input_marshaling():
    valuation_usd = 600000.0
    marshaled = marshal_public_inputs(valuation_usd, SETTINGS_PATH, VK_PATH)
    
    assert "quantized_valuation_scalar" in marshaled
    assert "scale_factor" in marshaled
    assert "vk_commitment" in marshaled
    assert "public_inputs_tuple" in marshaled
    
    scale_power = extract_scale_from_settings(SETTINGS_PATH)
    scale_factor = 2 ** scale_power
    expected_quantized = int(round(valuation_usd * scale_factor))
    
    assert marshaled["scale_factor"] == scale_factor
    assert marshaled["quantized_valuation_scalar"] == expected_quantized
    assert marshaled["vk_commitment"].startswith("0x")
    assert len(marshaled["public_inputs_tuple"]) == 3
    assert marshaled["public_inputs_tuple"][0] == expected_quantized
    assert marshaled["public_inputs_tuple"][1] == scale_factor
    assert marshaled["public_inputs_tuple"][2] == marshaled["vk_commitment"]

def test_proof_serialization_to_compact_bytes():
    # 1. Test short hex string padding
    short_proof = "0xabcd1234"
    serialized_short = serialize_proof_to_compact_bytes(short_proof)
    assert serialized_short.startswith("0x")
    assert len(serialized_short) == 1026  # '0x' + 1024 hex chars (512 bytes)
    assert serialized_short[2:10] == "abcd1234"
    assert serialized_short[10:] == "0" * (1024 - 8)
    
    # 2. Test raw bytes
    raw_bytes = b"\x01\x02\x03\x04"
    serialized_bytes = serialize_proof_to_compact_bytes(raw_bytes)
    assert serialized_bytes.startswith("0x01020304")
    assert len(serialized_bytes) == 1026
    
    # 3. Test dictionary input
    dict_proof = {"proof": "1234567890abcdef"}
    serialized_dict = serialize_proof_to_compact_bytes(dict_proof)
    assert serialized_dict.startswith("0x1234567890abcdef")
    assert len(serialized_dict) == 1026

def test_export_verifier_abi_structure():
    abi = export_verifier_abi(CIRCUITS_DIR)
    abi_path = os.path.join(CIRCUITS_DIR, "verifier_abi.json")
    
    assert os.path.exists(abi_path)
    assert "circuit_metadata" in abi
    assert "public_inputs_schema" in abi
    assert "compact_contract_bindings" in abi
    assert "downstream_handoff" in abi
    
    metadata = abi["circuit_metadata"]
    assert metadata["vk_commitment_hash"].startswith("0x")
    assert metadata["scale_power"] > 0
    assert metadata["scale_factor_multiplier"] == 2 ** metadata["scale_power"]
    
    pub_schema = abi["public_inputs_schema"]
    assert pub_schema["num_public_elements"] == 3
    assert len(pub_schema["fields"]) == 3
    assert pub_schema["fields"][0]["name"] == "quantized_valuation_scalar"
    assert pub_schema["fields"][1]["name"] == "scale_factor"
    assert pub_schema["fields"][2]["name"] == "vk_commitment"

if __name__ == "__main__":
    pytest.main(["-v", __file__])
