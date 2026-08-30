/**
 * Prover Registry — deterministic adapter selection
 *
 * Selection order (plan Section 26):
 *   1. Native EZKL 23.0.5
 *   2. Browser WASM 23.0.5
 *   3. Simulator ONLY if explicitly enabled
 *
 * The requested mode is set via VITE_PROVER_MODE (default: 'native').
 * If the requested mode is unavailable, the registry fails with an actionable error.
 * It does NOT silently jump from native → simulated.
 */

import type { IEzklProverEngine, ProverMode } from './types';
import { NativeEzklAdapter } from './NativeEzklAdapter';
import { WasmEzklAdapter } from './WasmEzklAdapter';
import { SimulatedDevAdapter } from './SimulatedDevAdapter';
import { ProverUnavailableError } from './errors';

export type ProverModeConfig = 'native' | 'wasm' | 'simulated';

function getConfiguredMode(): ProverModeConfig {
  try {
    const env = import.meta.env?.VITE_PROVER_MODE;
    if (env === 'wasm') return 'wasm';
    if (env === 'simulated') return 'simulated';
    return 'native'; // default
  } catch {
    return 'native';
  }
}

/**
 * Create and initialize the appropriate prover engine.
 * Throws if the requested mode is unavailable — never silently falls back.
 */
export async function createProverEngine(): Promise<IEzklProverEngine> {
  const requestedMode = getConfiguredMode();

  let engine: IEzklProverEngine;

  switch (requestedMode) {
    case 'native':
      engine = new NativeEzklAdapter();
      break;
    case 'wasm':
      engine = new WasmEzklAdapter();
      break;
    case 'simulated':
      engine = new SimulatedDevAdapter();
      break;
    default:
      throw new ProverUnavailableError(
        `Unknown VITE_PROVER_MODE: "${requestedMode}". ` +
          'Supported values: native, wasm, simulated.'
      );
  }

  await engine.initialize();
  return engine;
}

/**
 * Return the active ProverMode label from configuration.
 */
export function getProverModeLabel(): ProverMode {
  const mode = getConfiguredMode();
  switch (mode) {
    case 'native':
      return 'NATIVE_EZKL_23';
    case 'wasm':
      return 'BROWSER_WASM';
    case 'simulated':
      return 'SIMULATED_DEV_ONLY';
  }
}

/**
 * Human-readable status string for the UI.
 */
export function getProverStatusLabel(engine: IEzklProverEngine | null, error?: string): string {
  if (error) {
    return `EZKL Prover Unavailable\n\nReason:\n${error}`;
  }
  if (!engine) {
    return 'EZKL Prover Not Initialized';
  }
  switch (engine.mode) {
    case 'NATIVE_EZKL_23':
      return `EZKL ${engine.version}\nNative Halo2 Prover\nVerified`;
    case 'BROWSER_WASM':
      return `EZKL ${engine.version}\nBrowser WASM Prover\nVerified`;
    case 'SIMULATED_DEV_ONLY':
      return 'SIMULATION — NOT CRYPTOGRAPHICALLY VALID\nDevelopment Only';
  }
}
