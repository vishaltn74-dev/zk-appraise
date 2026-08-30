/**
 * Prover Errors — ZK-Appraise
 *
 * Every error carries an actionable message explaining what happened
 * and what the operator should do next.
 */

export class ProverUnavailableError extends Error {
  constructor(reason: string) {
    super(
      `EZKL prover unavailable.\n\n${reason}\n\n` +
        'Ensure the native EZKL 23.0.5 prover daemon is running on 127.0.0.1:6301.'
    );
    this.name = 'ProverUnavailableError';
  }
}

export class VersionMismatchError extends Error {
  constructor(expected: string, actual: string) {
    super(
      `EZKL version mismatch.\n\n` +
        `Circuit artifacts require EZKL ${expected}.\n` +
        `Installed engine: ${actual}.\n\n` +
        'Do not use these artifacts together.\n' +
        `Provide a compatible EZKL ${expected} runtime or regenerate the circuit ` +
        'using the exact supported toolchain.'
    );
    this.name = 'VersionMismatchError';
  }
}

export class ArtifactUnavailableError extends Error {
  constructor(detail: string) {
    super(
      `Circuit artifact unavailable or invalid.\n\n${detail}\n\n` +
        'Verify that all required circuit files (model.compiled, settings.json, ' +
        'kzg.srs, pk.key, vk.key) exist in zk-circuits/ and were generated with EZKL 23.0.5.'
    );
    this.name = 'ArtifactUnavailableError';
  }
}

export class ProofValidationError extends Error {
  constructor(detail: string) {
    super(
      `Proof validation failed.\n\n${detail}\n\n` +
        'The generated proof did not pass structural or cryptographic verification. ' +
        'This proof MUST NOT be submitted to the contract verifier.'
    );
    this.name = 'ProofValidationError';
  }
}

export class ProverExecutionError extends Error {
  constructor(detail: string) {
    super(`Prover execution error.\n\n${detail}`);
    this.name = 'ProverExecutionError';
  }
}

export class SimulationDisabledError extends Error {
  constructor() {
    super(
      'Development simulator is disabled.\n\n' +
        'Set VITE_ALLOW_DEV_SIMULATOR=true in your .env file to enable ' +
        'simulated proof generation for development purposes only.\n\n' +
        'Simulated proofs MUST NOT be used for production verification.'
    );
    this.name = 'SimulationDisabledError';
  }
}
