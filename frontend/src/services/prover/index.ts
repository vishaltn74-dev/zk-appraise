/**
 * Prover module barrel export
 */
export type {
  ProverMode,
  CircuitMetadata,
  CircuitArtifacts,
  ProverRequest,
  EzklProofResult,
  IEzklProverEngine,
} from './types';

export {
  REQUIRED_EZKL_VERSION,
  CIRCUIT_CURVE,
  CIRCUIT_LOGROWS,
  CIRCUIT_SCALE_POWER,
  CIRCUIT_SCALE_FACTOR,
  CIRCUIT_VK_COMMITMENT,
} from './types';

export {
  ProverUnavailableError,
  VersionMismatchError,
  ArtifactUnavailableError,
  ProofValidationError,
  ProverExecutionError,
  SimulationDisabledError,
} from './errors';

export { NativeEzklAdapter } from './NativeEzklAdapter';
export { WasmEzklAdapter } from './WasmEzklAdapter';
export { SimulatedDevAdapter } from './SimulatedDevAdapter';
export { createProverEngine, getProverModeLabel, getProverStatusLabel } from './proverRegistry';
