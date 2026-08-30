import os
import json
import hashlib
from typing import Union, Dict, Any

def compute_vk_commitment(vk_path: str) -> str:
    """
    Computes a cryptographic SHA-256 commitment (32 bytes / 256 bits)
    over the EZKL verification key binary artifact.
    """
    if not os.path.exists(vk_path):
        raise FileNotFoundError(f"Verification key not found at {vk_path}")
        
    sha256_hash = hashlib.sha256()
    with open(vk_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256_hash.update(chunk)
            
    return f"0x{sha256_hash.hexdigest()}"

def extract_scale_from_settings(settings_path: str) -> int:
    """
    Dynamically extracts the output/input quantization scale factor S from circuit settings.
    """
    if not os.path.exists(settings_path):
        raise FileNotFoundError(f"Settings file not found at {settings_path}")
        
    with open(settings_path, "r") as f:
        settings = json.load(f)
        
    # Check model_output_scales first, then run_args input_scale / param_scale
    if "model_output_scales" in settings and len(settings["model_output_scales"]) > 0:
        return int(settings["model_output_scales"][0])
    elif "run_args" in settings:
        run_args = settings["run_args"]
        return int(run_args.get("output_scale", run_args.get("input_scale", run_args.get("scale", 7))))
    return 7

def marshal_public_inputs(
    valuation_usd: float,
    settings_path: str = "zk-circuits/settings.json",
    vk_path: str = "zk-circuits/vk.key"
) -> Dict[str, Any]:
    """
    Marshals valuation predictions and circuit parameters into the 3-element
    Midnight Compact public input tuple:
      [0] quantized_valuation_scalar (Uint<64>)
      [1] scale_factor (Uint<64>, 2^S)
      [2] vk_commitment (Bytes<32>, H(vk))
    """
    scale_power = extract_scale_from_settings(settings_path)
    scale_factor = 2 ** scale_power
    quantized_valuation_scalar = int(round(valuation_usd * scale_factor))
    vk_commitment = compute_vk_commitment(vk_path)
    
    return {
        "quantized_valuation_scalar": quantized_valuation_scalar,
        "scale_factor": scale_factor,
        "scale_power": scale_power,
        "vk_commitment": vk_commitment,
        "public_inputs_tuple": [
            quantized_valuation_scalar,
            scale_factor,
            vk_commitment
        ],
        "compact_types": {
            "quantized_valuation_scalar": "Uint<64>",
            "scale_factor": "Uint<64>",
            "vk_commitment": "Bytes<32>"
        },
        "precision_safe_formula": "quantized_valuation_scalar >= min_required_threshold_usd * scale_factor"
    }

def serialize_proof_to_compact_bytes(proof_data: Union[str, dict, bytes]) -> str:
    """
    Serializes EZKL proof payload into a 512-byte hex string (1024 hex chars with 0x prefix)
    matching Midnight Compact Bytes<512> representation.
    """
    raw_hex = ""
    if isinstance(proof_data, dict):
        # Extract proof hex from proof dictionary if present
        if "proof" in proof_data and isinstance(proof_data["proof"], str):
            raw_hex = proof_data["proof"]
        elif "hex" in proof_data and isinstance(proof_data["hex"], str):
            raw_hex = proof_data["hex"]
        else:
            raw_hex = json.dumps(proof_data).encode("utf-8").hex()
    elif isinstance(proof_data, bytes):
        raw_hex = proof_data.hex()
    elif isinstance(proof_data, str):
        raw_hex = proof_data.strip()
    else:
        raw_hex = str(proof_data)
        
    if raw_hex.startswith("0x") or raw_hex.startswith("0X"):
        raw_hex = raw_hex[2:]
        
    # Standardize to 512 bytes (1024 hex characters)
    target_hex_len = 1024
    if len(raw_hex) < target_hex_len:
        raw_hex = raw_hex.ljust(target_hex_len, "0")
    elif len(raw_hex) > target_hex_len:
        raw_hex = raw_hex[:target_hex_len]
        
    return f"0x{raw_hex}"

def export_verifier_abi(circuits_dir: str = "zk-circuits") -> Dict[str, Any]:
    os.makedirs(circuits_dir, exist_ok=True)
    
    settings_path = os.path.join(circuits_dir, "settings.json")
    vk_path = os.path.join(circuits_dir, "vk.key")
    abi_path = os.path.join(circuits_dir, "verifier_abi.json")
    
    if not os.path.exists(settings_path):
        raise FileNotFoundError(f"Circuit settings missing at {settings_path}")
    if not os.path.exists(vk_path):
        raise FileNotFoundError(f"Verification key missing at {vk_path}")
        
    with open(settings_path, "r") as f:
        settings = json.load(f)
        
    vk_size = os.path.getsize(vk_path)
    vk_commitment = compute_vk_commitment(vk_path)
    scale_power = extract_scale_from_settings(settings_path)
    scale_factor = 2 ** scale_power
    
    abi_spec = {
        "version": settings.get("version", "23.0.5"),
        "circuit_metadata": {
            "logrows": settings["run_args"]["logrows"],
            "num_rows": settings["num_rows"],
            "input_scale": settings["run_args"].get("input_scale", scale_power),
            "param_scale": settings["run_args"].get("param_scale", scale_power),
            "scale_power": scale_power,
            "scale_factor_multiplier": scale_factor,
            "input_visibility": settings["run_args"].get("input_visibility", "Private"),
            "param_visibility": settings["run_args"].get("param_visibility", "Fixed"),
            "output_visibility": settings["run_args"].get("output_visibility", "Public"),
            "vk_size_bytes": vk_size,
            "vk_commitment_hash": vk_commitment
        },
        "public_inputs_schema": {
            "tuple_format": "[quantized_valuation_scalar, scale_factor, vk_commitment]",
            "num_public_elements": 3,
            "fields": [
                {
                    "index": 0,
                    "name": "quantized_valuation_scalar",
                    "type": "Uint<64>",
                    "description": "Quantized real estate appraisal valuation output (y_val = val * 2^S)"
                },
                {
                    "index": 1,
                    "name": "scale_factor",
                    "type": "Uint<64>",
                    "description": f"Quantization multiplier factor (2^{scale_power} = {scale_factor})"
                },
                {
                    "index": 2,
                    "name": "vk_commitment",
                    "type": "Bytes<32>",
                    "description": "SHA-256 hash commitment of the frozen verification key vk.key"
                }
            ],
            "dequantization_rule": {
                "safe_multiplicative_check": "quantized_valuation_scalar >= min_required_threshold_usd * scale_factor",
                "notes": "Prevents integer truncation and division-by-zero"
            }
        },
        "private_inputs_schema": [
            {"name": "square_footage", "unit": "sqft", "range": [300, 15000]},
            {"name": "bedrooms", "unit": "count", "range": [1, 10]},
            {"name": "bathrooms", "unit": "count", "range": [1, 8]},
            {"name": "property_age", "unit": "years", "range": [0, 120]},
            {"name": "location_risk_score", "unit": "score", "range": [1, 100]}
        ],
        "compact_contract_bindings": {
            "verifier_circuit": "AppraisalVerifier.compact",
            "proof_type": "Bytes<512>",
            "nullifier_schema": "sha256(concat(DOMAIN_SEPARATOR, owner_secret_nonce, property_hash))"
        },
        "downstream_handoff": {
            "person_3_midnight_compact": {
                "verification_key_file": "zk-circuits/vk.key",
                "vk_commitment": vk_commitment,
                "public_commitment_layout": ["quantized_valuation_scalar", "scale_factor", "vk_commitment"]
            },
            "person_4_react_wasm": {
                "proving_key_file": "zk-circuits/pk.key",
                "srs_file": "zk-circuits/kzg.srs",
                "compiled_circuit": "zk-circuits/model.compiled"
            }
        }
    }
    
    with open(abi_path, "w") as f:
        json.dump(abi_spec, f, indent=2)
        
    print(f"[+] Exported verifier ABI & schema -> {abi_path}")
    print(f"    - VK Commitment: {vk_commitment}")
    print(f"    - Dynamic Scale S: {scale_power} (Multiplier: {scale_factor})")
    return abi_spec

if __name__ == "__main__":
    circuits = os.path.abspath("zk-circuits")
    abi = export_verifier_abi(circuits)
    sample_marshal = marshal_public_inputs(550000.0, os.path.join(circuits, "settings.json"), os.path.join(circuits, "vk.key"))
    print(f"[+] Sample Marshaled Public Inputs: {json.dumps(sample_marshal, indent=2)}")
