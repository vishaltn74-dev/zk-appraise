/**
 * SimulatedDevAdapter — Development-only proof simulator
 *
 * Requirements (plan Section 24):
 *  - Explicit adapter, explicit mode, explicit environment variable
 *  - Visible UI warning
 *  - Never selected in production
 *  - Never selected automatically when native/WASM proving fails
 */

import type {
  IEzklProverEngine,
  ProverRequest,
  EzklProofResult,
  CircuitMetadata,
  ProverMode,
} from './types';
import {
  REQUIRED_EZKL_VERSION,
  CIRCUIT_CURVE,
  CIRCUIT_LOGROWS,
  CIRCUIT_SCALE_POWER,
  CIRCUIT_SCALE_FACTOR,
  CIRCUIT_VK_COMMITMENT,
} from './types';
import { SimulationDisabledError } from './errors';

const SIM_CIRCUIT_META: CircuitMetadata = {
  ezklVersion: 'SIMULATED',
  curve: CIRCUIT_CURVE,
  logrows: CIRCUIT_LOGROWS,
  scale: CIRCUIT_SCALE_POWER,
};

/**
 * Check the environment variable gate.
 * Default is false — production builds must NOT silently enable this.
 */
function isSimulatorAllowed(): boolean {
  try {
    return import.meta.env?.VITE_ALLOW_DEV_SIMULATOR === 'true';
  } catch {
    return false;
  }
}

export class SimulatedDevAdapter implements IEzklProverEngine {
  public readonly mode: ProverMode = 'SIMULATED_DEV_ONLY';
  public readonly version: string = 'SIMULATED';

  async initialize(): Promise<void> {
    if (!isSimulatorAllowed()) {
      throw new SimulationDisabledError();
    }
    console.warn(
      '\n⚠️  DEVELOPMENT ONLY — SimulatedDevAdapter is active.\n' +
        '   Cryptographic proofs are SIMULATED.\n' +
        '   Results MUST NOT be used for production verification.\n'
    );
  }

  async prove(request: ProverRequest): Promise<EzklProofResult> {
    if (!isSimulatorAllowed()) {
      throw new SimulationDisabledError();
    }

    const startTime = performance.now();

    // Simple valuation using California Housing features or property specs
    const f = request.features;
    let valuationUsd: number;

    if (f.medInc !== undefined && f.houseAge !== undefined && f.aveRooms !== undefined && f.aveOccup !== undefined) {
      const valRaw = 0.4367 * f.medInc + 0.0094 * f.houseAge - 0.0573 * f.aveRooms - 0.0045 * f.aveOccup + 0.75;
      valuationUsd = Math.max(75000, Math.round(valRaw * 100000));
    } else {
      const sqft = f.sqft || 2200;
      const bedrooms = f.bedrooms || 3;
      const bathrooms = f.bathrooms || 2;
      const age = f.age || 20;
      const locationRisk = f.locationRisk || 25;
      const valRaw = sqft * 0.22 + bedrooms * 28.0 + bathrooms * 38.0 - age * 1.8 - locationRisk * 2.2 + 120.0;
      valuationUsd = Math.max(50000, Math.round(valRaw * 1000));
    }

    const quantizedScalar = (BigInt(valuationUsd) * BigInt(CIRCUIT_SCALE_FACTOR)).toString();

    // Generate deterministic but explicitly-fake proof bytes
    const fakeProof = new Uint8Array(752);
    // Mark first 4 bytes with 'FAKE' sentinel so this can never be confused with a real proof
    fakeProof[0] = 0x46; // F
    fakeProof[1] = 0x41; // A
    fakeProof[2] = 0x4b; // K
    fakeProof[3] = 0x45; // E

    const hexProof = '0x' + Array.from(fakeProof).map(b => b.toString(16).padStart(2, '0')).join('');

    const instances = [
      quantizedScalar,
      String(CIRCUIT_SCALE_FACTOR),
      CIRCUIT_VK_COMMITMENT,
    ];

    const executionTimeMs = performance.now() - startTime;

    return {
      proof: fakeProof,
      hexProof,
      instances,
      executionTimeMs,
      engineVersion: 'SIMULATED',
      mode: 'SIMULATED_DEV_ONLY',
      circuit: SIM_CIRCUIT_META,
    };
  }

  async verify(_result: EzklProofResult): Promise<boolean> {
    // Simulated proofs are never cryptographically valid
    console.warn('SimulatedDevAdapter.verify() — simulated proofs are NEVER cryptographically valid.');
    return false;
  }
}
