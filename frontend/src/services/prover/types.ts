/**
 * Prover Type System — ZK-Appraise Real EZKL 23.0.5 Runtime
 *
 * Canonical type definitions for the prover architecture.
 * No simulated or fake implementation details leak through this interface.
 */

// ---------------------------------------------------------------------------
// Prover Modes
// ---------------------------------------------------------------------------

export type ProverMode =
  | 'NATIVE_EZKL_23'
  | 'BROWSER_WASM'
  | 'SIMULATED_DEV_ONLY';

// ---------------------------------------------------------------------------
// Circuit Metadata
// ---------------------------------------------------------------------------

export interface CircuitMetadata {
  ezklVersion: string;
  curve: string;
  logrows: number;
  scale: number;
  compiledSha256?: string;
  provingKeySha256?: string;
  verificationKeySha256?: string;
  srsSha256?: string;
}

// ---------------------------------------------------------------------------
// Circuit Artifacts
// ---------------------------------------------------------------------------

export interface CircuitArtifacts {
  compiled: Uint8Array;
  settings: Uint8Array;
  srs: Uint8Array;
  provingKey: Uint8Array;
  verificationKey: Uint8Array;
  metadata: CircuitMetadata;
}

// ---------------------------------------------------------------------------
// Prover Request
// ---------------------------------------------------------------------------

/**
 * Callers provide only feature values.
 * Artifact paths are owned by the native adapter / daemon — never supplied by callers.
 */
export interface ProverRequest {
  features: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Proof Result
// ---------------------------------------------------------------------------

export interface EzklProofResult {
  proof: Uint8Array;
  hexProof: string;
  instances: string[];
  executionTimeMs: number;
  engineVersion: string;
  mode: ProverMode;
  circuit: CircuitMetadata;
}

// ---------------------------------------------------------------------------
// Engine Interface
// ---------------------------------------------------------------------------

export interface IEzklProverEngine {
  readonly mode: ProverMode;
  readonly version: string;

  initialize(): Promise<void>;

  prove(request: ProverRequest): Promise<EzklProofResult>;

  verify(result: EzklProofResult): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Constants derived from repository artifacts (verifier_abi.json / settings.json)
// ---------------------------------------------------------------------------

export const REQUIRED_EZKL_VERSION = '23.0.5';
export const CIRCUIT_CURVE = 'bn254';
export const CIRCUIT_LOGROWS = 15;
export const CIRCUIT_SCALE_POWER = 13;
export const CIRCUIT_SCALE_FACTOR = 8192; // 2^13
export const CIRCUIT_VK_COMMITMENT =
  '0xd24a2bd50f9dab80e646b8d358d6e1097118ddb65c9da99710c6852d9d6b0e75';
