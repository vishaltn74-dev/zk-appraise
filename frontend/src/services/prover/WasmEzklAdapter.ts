/**
 * WasmEzklAdapter — Browser WASM EZKL prover
 *
 * This adapter is NOT active until a real EZKL 23.0.5-compatible WASM engine
 * is available. It implements the version gate and fails closed.
 *
 * Do NOT create placeholder .wasm files.
 * Do NOT claim browser proving is available until the binary has been tested.
 */

import type {
  IEzklProverEngine,
  ProverRequest,
  EzklProofResult,
  ProverMode,
} from './types';
import { REQUIRED_EZKL_VERSION } from './types';
import { VersionMismatchError, ProverUnavailableError } from './errors';

/** The only known @ezkljs/engine version — incompatible with 23.0.5 artifacts */
const KNOWN_WASM_ENGINE_VERSION = '22.0.1';

export class WasmEzklAdapter implements IEzklProverEngine {
  public readonly mode: ProverMode = 'BROWSER_WASM';
  public readonly version: string = REQUIRED_EZKL_VERSION;

  /**
   * Initialization always fails until a 23.0.5-compatible WASM engine exists.
   *
   * The failure is VersionMismatchError (not a generic deserialization error)
   * so operators know exactly what to supply (plan Section 14).
   */
  async initialize(): Promise<void> {
    // Check if WASM files exist in the expected location
    try {
      const wasmCheck = await fetch('/wasm/ezkl_bg.wasm', { method: 'HEAD' });
      if (!wasmCheck.ok) {
        throw new ProverUnavailableError(
          'Browser EZKL WASM binary not found at /wasm/ezkl_bg.wasm.\n' +
            'Browser proving is unavailable.'
        );
      }
    } catch (err) {
      if (err instanceof ProverUnavailableError) throw err;
      throw new ProverUnavailableError(
        'Browser EZKL proving unavailable.\n' +
          'No compatible WASM binary is installed.'
      );
    }

    // Even if a WASM file exists, gate on version compatibility
    // The only known engine version is 22.0.1 — incompatible with 23.0.5 artifacts
    throw new VersionMismatchError(REQUIRED_EZKL_VERSION, KNOWN_WASM_ENGINE_VERSION);
  }

  async prove(_request: ProverRequest): Promise<EzklProofResult> {
    throw new ProverUnavailableError(
      'Browser WASM proving is not available. ' +
        `Circuit artifacts require EZKL ${REQUIRED_EZKL_VERSION} but no compatible WASM engine exists.`
    );
  }

  async verify(_result: EzklProofResult): Promise<boolean> {
    throw new ProverUnavailableError(
      'Browser WASM verification is not available.'
    );
  }
}
