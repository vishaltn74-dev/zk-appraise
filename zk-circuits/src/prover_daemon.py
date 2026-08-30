#!/usr/bin/env python3
"""
EZKL 23.0.5 Native Prover Daemon — ZK-Appraise

Binds to 127.0.0.1:6301 and provides real EZKL proving using
the repository's canonical circuit artifacts.

Endpoints:
  GET  /status  — runtime status + version
  POST /prove   — generate & verify a real EZKL proof
  POST /verify  — independently verify an existing proof

Privacy requirements (plan Section 30):
  - Binds to localhost only
  - Never logs private property features
  - Never logs wallet secrets or private witness material
  - Removes temporary input files after use
  - Returns only proof + public-instance data
"""

import asyncio
import json
import os
import sys
import tempfile
import time
import traceback
from pathlib import Path

# ---------------------------------------------------------------------------
# Artifact paths — canonical repository locations only.
# Never accepted from HTTP clients.
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
ZK_CIRCUITS_DIR = SCRIPT_DIR.parent  # zk-circuits/

COMPILED_PATH = ZK_CIRCUITS_DIR / "model.compiled"
SETTINGS_PATH = ZK_CIRCUITS_DIR / "settings.json"
SRS_PATH = ZK_CIRCUITS_DIR / "kzg.srs"
PK_PATH = ZK_CIRCUITS_DIR / "pk.key"
VK_PATH = ZK_CIRCUITS_DIR / "vk.key"

REQUIRED_VERSION = "23.0.5"
LISTEN_HOST = "127.0.0.1"
LISTEN_PORT = 6301

# Allowed frontend origins for CORS
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def get_ezkl_version() -> str:
    """Get installed EZKL version. Falls back to settings.json metadata."""
    try:
        import ezkl
        if hasattr(ezkl, "__version__"):
            return ezkl.__version__
        if hasattr(ezkl, "get_version"):
            return ezkl.get_version()
    except Exception:
        pass
    # Fall back to settings.json
    try:
        with open(SETTINGS_PATH) as f:
            settings = json.load(f)
            return settings.get("version", "unknown")
    except Exception:
        return "unknown"


def load_settings() -> dict:
    """Load and validate circuit settings."""
    with open(SETTINGS_PATH) as f:
        return json.load(f)


def validate_artifacts():
    """Verify all required circuit artifacts exist."""
    required = {
        "model.compiled": COMPILED_PATH,
        "settings.json": SETTINGS_PATH,
        "kzg.srs": SRS_PATH,
        "pk.key": PK_PATH,
        "vk.key": VK_PATH,
    }
    missing = [name for name, path in required.items() if not path.exists()]
    if missing:
        print(f"FATAL: Missing circuit artifacts: {missing}", file=sys.stderr)
        sys.exit(1)


def validate_features(features: dict) -> list[str]:
    """Validate request feature schema. Returns list of error strings."""
    errors = []
    if not isinstance(features, dict):
        return ["'features' must be an object"]
    for key, val in features.items():
        if not isinstance(val, (int, float)):
            errors.append(f"Feature '{key}' must be a number, got {type(val).__name__}")
        elif val != val:  # NaN check
            errors.append(f"Feature '{key}' is NaN")
        elif val == float("inf") or val == float("-inf"):
            errors.append(f"Feature '{key}' is Infinity")
    return errors


async def run_ezkl_prove(features: dict) -> dict:
    """
    Execute the real EZKL proving pipeline:
      1. Construct temporary input
      2. Generate witness
      3. Generate proof
      4. Verify proof locally
      5. Return proof + instances
      6. Clean up temporary files
    """
    import ezkl

    tmp_dir = tempfile.mkdtemp(prefix="zk_appraise_")
    input_path = os.path.join(tmp_dir, "input.json")
    witness_path = os.path.join(tmp_dir, "witness.json")
    proof_path = os.path.join(tmp_dir, "proof.json")

    try:
        start_time = time.time()

        # 1. Construct input representation
        # The EZKL model expects a flat feature vector as input_data
        feature_values = list(features.values())
        input_data = {"input_data": [feature_values]}
        with open(input_path, "w") as f:
            json.dump(input_data, f)

        # 2. Generate witness
        await ezkl.gen_witness(
            input_path,
            str(COMPILED_PATH),
            witness_path,
            vk_path=str(VK_PATH),
            srs_path=str(SRS_PATH),
        )

        if not os.path.exists(witness_path):
            return {"status": "error", "error": "Witness generation failed — no output file."}

        # 3. Generate proof
        proof_result = ezkl.prove(
            witness_path,
            str(COMPILED_PATH),
            str(PK_PATH),
            proof_path,
            str(SRS_PATH),
            "single",
        )

        if not os.path.exists(proof_path):
            return {"status": "error", "error": "Proof generation failed — no output file."}

        # 4. Load proof
        with open(proof_path) as f:
            proof_data = json.load(f)

        # 5. Verify proof locally — MUST succeed before returning
        verified = ezkl.verify(
            proof_path,
            str(SETTINGS_PATH),
            str(VK_PATH),
            str(SRS_PATH),
        )

        execution_time_ms = (time.time() - start_time) * 1000

        if not verified:
            return {
                "status": "error",
                "error": "Proof generated but local EZKL verification FAILED. Proof is invalid.",
                "verified": False,
            }

        # 6. Extract proof hex and instances
        proof_hex = proof_data.get("hex_proof", "")
        if not proof_hex and "proof" in proof_data:
            # Convert byte array to hex if hex_proof not present
            proof_bytes = proof_data["proof"]
            proof_hex = "0x" + "".join(f"{b:02x}" for b in proof_bytes)

        instances_raw = proof_data.get("instances", [[]])
        # Flatten nested instance arrays
        instances = []
        for group in instances_raw:
            if isinstance(group, list):
                instances.extend(str(x) for x in group)
            else:
                instances.append(str(group))

        return {
            "status": "success",
            "proof_hex": proof_hex,
            "instances": instances,
            "execution_time_ms": round(execution_time_ms, 2),
            "engine_version": get_ezkl_version(),
            "verified": True,
        }

    finally:
        # 7. Remove temporary private input material
        for tmp_file in [input_path, witness_path, proof_path]:
            try:
                if os.path.exists(tmp_file):
                    os.remove(tmp_file)
            except OSError:
                pass
        try:
            os.rmdir(tmp_dir)
        except OSError:
            pass


async def run_ezkl_verify(proof_hex: str, instances: list) -> bool:
    """Independently verify a proof using the repository artifacts."""
    import ezkl

    tmp_dir = tempfile.mkdtemp(prefix="zk_appraise_verify_")
    proof_path = os.path.join(tmp_dir, "proof.json")

    try:
        # Reconstruct proof JSON
        proof_data = {
            "hex_proof": proof_hex,
            "instances": [instances] if instances and not isinstance(instances[0], list) else instances,
        }
        with open(proof_path, "w") as f:
            json.dump(proof_data, f)

        verified = ezkl.verify(
            proof_path,
            str(SETTINGS_PATH),
            str(VK_PATH),
            str(SRS_PATH),
        )
        return bool(verified)
    finally:
        try:
            if os.path.exists(proof_path):
                os.remove(proof_path)
            os.rmdir(tmp_dir)
        except OSError:
            pass


# ---------------------------------------------------------------------------
# HTTP Server (aiohttp)
# ---------------------------------------------------------------------------

def create_app():
    """Create and configure the aiohttp application."""
    from aiohttp import web

    app = web.Application()

    settings = load_settings()
    ezkl_version = get_ezkl_version()
    logrows = settings.get("run_args", {}).get("logrows", 15)
    scale = settings.get("run_args", {}).get("input_scale", 13)

    # CORS middleware
    @web.middleware
    async def cors_middleware(request, handler):
        origin = request.headers.get("Origin", "")
        response = await handler(request)
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    app.middlewares.append(cors_middleware)

    async def handle_options(request):
        """Handle CORS preflight."""
        origin = request.headers.get("Origin", "")
        headers = {}
        if origin in ALLOWED_ORIGINS:
            headers["Access-Control-Allow-Origin"] = origin
            headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            headers["Access-Control-Allow-Headers"] = "Content-Type"
        return web.Response(status=204, headers=headers)

    async def handle_status(request):
        """GET /status — report daemon state."""
        return web.json_response({
            "status": "ready",
            "engine": "ezkl",
            "version": ezkl_version,
            "curve": "bn254",
            "logrows": logrows,
            "scale": scale,
        })

    async def handle_prove(request):
        """POST /prove — generate and verify a real EZKL proof."""
        try:
            body = await request.json()
        except Exception:
            return web.json_response(
                {"status": "error", "error": "Invalid JSON request body."},
                status=400,
            )

        features = body.get("features")
        if features is None:
            return web.json_response(
                {"status": "error", "error": "Missing 'features' field."},
                status=400,
            )

        validation_errors = validate_features(features)
        if validation_errors:
            return web.json_response(
                {"status": "error", "error": f"Invalid features: {'; '.join(validation_errors)}"},
                status=400,
            )

        # Do NOT log feature values (privacy requirement)
        print(f"[prove] Received {len(features)} features, starting proof generation...")

        try:
            result = await run_ezkl_prove(features)
            status_code = 200 if result["status"] == "success" else 500
            return web.json_response(result, status=status_code)
        except Exception as e:
            traceback.print_exc()
            return web.json_response(
                {"status": "error", "error": str(e)},
                status=500,
            )

    async def handle_verify(request):
        """POST /verify — independently verify an existing proof."""
        try:
            body = await request.json()
        except Exception:
            return web.json_response(
                {"status": "error", "error": "Invalid JSON."},
                status=400,
            )

        proof_hex = body.get("proof_hex", "")
        instances = body.get("instances", [])

        if not proof_hex:
            return web.json_response(
                {"status": "error", "error": "Missing proof_hex."},
                status=400,
            )

        try:
            verified = await run_ezkl_verify(proof_hex, instances)
            return web.json_response({"verified": verified})
        except Exception as e:
            return web.json_response(
                {"status": "error", "error": str(e), "verified": False},
                status=500,
            )

    # Routes
    app.router.add_route("OPTIONS", "/status", handle_options)
    app.router.add_route("OPTIONS", "/prove", handle_options)
    app.router.add_route("OPTIONS", "/verify", handle_options)
    app.router.add_get("/status", handle_status)
    app.router.add_post("/prove", handle_prove)
    app.router.add_post("/verify", handle_verify)

    return app


def main():
    """Entry point — validate artifacts, check version, start server."""
    validate_artifacts()

    ezkl_version = get_ezkl_version()
    print(f"[prover_daemon] EZKL version: {ezkl_version}")
    print(f"[prover_daemon] Required version: {REQUIRED_VERSION}")

    if ezkl_version != REQUIRED_VERSION and ezkl_version != "unknown":
        print(
            f"FATAL: Installed EZKL version ({ezkl_version}) does not match "
            f"required circuit version ({REQUIRED_VERSION}).",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"[prover_daemon] Artifacts directory: {ZK_CIRCUITS_DIR}")
    print(f"[prover_daemon] Starting on {LISTEN_HOST}:{LISTEN_PORT}")

    from aiohttp import web

    app = create_app()
    web.run_app(app, host=LISTEN_HOST, port=LISTEN_PORT, print=print)


if __name__ == "__main__":
    main()
