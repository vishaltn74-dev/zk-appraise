import os
import json

def export_verifier_abi(artifacts_dir: str):
    os.makedirs(artifacts_dir, exist_ok=True)
    
    settings_path = os.path.join(artifacts_dir, "settings.json")
    vk_path = os.path.join(artifacts_dir, "vk.key")
    abi_path = os.path.join(artifacts_dir, "verifier_abi.json")
    
    if not os.path.exists(settings_path):
        raise FileNotFoundError(f"Circuit settings missing at {settings_path}")
    if not os.path.exists(vk_path):
        raise FileNotFoundError(f"Verification key missing at {vk_path}")
        
    with open(settings_path, "r") as f:
        settings = json.load(f)
        
    vk_size = os.path.getsize(vk_path)
    
    abi_spec = {
        "version": settings.get("version", "23.0.5"),
        "circuit_metadata": {
            "logrows": settings["run_args"]["logrows"],
            "num_rows": settings["num_rows"],
            "input_scale": settings["run_args"]["input_scale"],
            "param_scale": settings["run_args"]["param_scale"],
            "input_visibility": settings["run_args"]["input_visibility"],
            "param_visibility": settings["run_args"]["param_visibility"],
            "output_visibility": settings["run_args"]["output_visibility"],
            "vk_size_bytes": vk_size
        },
        "public_inputs_schema": {
            "num_public_outputs": len(settings["model_output_scales"]),
            "field_element_encoding": "Bn256_Fr_BigEndian_256bit",
            "public_output_fields": [
                {
                    "name": "collateral_appraisal_valuation",
                    "type": "FixedPointScalar",
                    "scale": settings["model_output_scales"][0],
                    "description": "Property valuation estimate in USD 1000s"
                }
            ]
        },
        "private_inputs_schema": [
            {"name": "square_footage", "unit": "sqft", "range": [300, 15000]},
            {"name": "bedrooms", "unit": "count", "range": [1, 10]},
            {"name": "bathrooms", "unit": "count", "range": [1, 8]},
            {"name": "property_age", "unit": "years", "range": [0, 120]},
            {"name": "location_risk_score", "unit": "score", "range": [1, 100]}
        ],
        "downstream_handoff": {
            "person_3_midnight_compact": {
                "verification_key_file": "vk.key",
                "public_commitment_layout": ["output_scalar"]
            },
            "person_4_react_wasm": {
                "proving_key_file": "pk.key",
                "srs_file": "kzg.srs",
                "compiled_circuit": "model.compiled"
            }
        }
    }
    
    with open(abi_path, "w") as f:
        json.dump(abi_spec, f, indent=2)
        
    print(f"[+] Exported verifier ABI & schema -> {abi_path}")
    return abi_spec

if __name__ == "__main__":
    artifacts = os.path.abspath("artifacts")
    abi = export_verifier_abi(artifacts)
    print(f"[+] Verifier ABI ready: {json.dumps(abi['circuit_metadata'], indent=2)}")
