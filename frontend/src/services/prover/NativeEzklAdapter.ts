/**
 * NativeEzklAdapter — connects to the local EZKL 23.0.5 prover daemon
 *
 * All cryptographic proving happens in the Python daemon.
 * This adapter is pure transport — no proof bytes are generated in TypeScript.
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
} from './types';
import {
  ProverUnavailableError,
  VersionMismatchError,
  ArtifactUnavailableError,
  ProofValidationError,
  ProverExecutionError,
} from './errors';

const DAEMON_BASE_URL = 'http://127.0.0.1:6301';
const CONNECT_TIMEOUT_MS = 5000;

interface DaemonStatusResponse {
  status: string;
  engine: string;
  version: string;
  curve: string;
  logrows: number;
  scale: number;
}

interface DaemonProveResponse {
  status: string;
  proof_hex: string;
  instances: string[];
  execution_time_ms: number;
  engine_version: string;
  verified: boolean;
  error?: string;
}

export class NativeEzklAdapter implements IEzklProverEngine {
  public readonly mode: ProverMode = 'NATIVE_EZKL_23';
  public readonly version: string = REQUIRED_EZKL_VERSION;

  private circuitMeta: CircuitMetadata | null = null;
  private ready = false;

  /**
   * Initialization sequence (plan Section 12):
   *   GET /status → reachable? → version match? → metadata valid? → READY
   * Does NOT fall back to simulation.
   */
  async initialize(): Promise<void> {
    let statusRes: Response;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);
      statusRes = await fetch(`${DAEMON_BASE_URL}/status`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch (err: any) {
      throw new ProverUnavailableError(
        `Cannot reach native EZKL daemon at ${DAEMON_BASE_URL}.\n` +
          `Error: ${err?.message || 'connection refused'}`
      );
    }

    if (!statusRes.ok) {
      throw new ProverUnavailableError(
        `Daemon responded with HTTP ${statusRes.status}.`
      );
    }

    const status: DaemonStatusResponse = await statusRes.json();

    if (status.status !== 'ready') {
      throw new ProverUnavailableError(
        `Daemon is not ready (status: ${status.status}).`
      );
    }

    // Version gate
    if (status.version !== REQUIRED_EZKL_VERSION) {
      throw new VersionMismatchError(REQUIRED_EZKL_VERSION, status.version);
    }

    // Circuit metadata validation
    if (status.logrows !== CIRCUIT_LOGROWS) {
      throw new ArtifactUnavailableError(
        `Expected logrows=${CIRCUIT_LOGROWS}, daemon reports logrows=${status.logrows}.`
      );
    }

    this.circuitMeta = {
      ezklVersion: status.version,
      curve: status.curve || CIRCUIT_CURVE,
      logrows: status.logrows,
      scale: status.scale || CIRCUIT_SCALE_POWER,
    };

    this.ready = true;
  }

  /**
   * Submit features to daemon → receive real EZKL proof.
   * The adapter does NOT generate proof bytes itself.
   */
  async prove(request: ProverRequest): Promise<EzklProofResult> {
    if (!this.ready || !this.circuitMeta) {
      throw new ProverUnavailableError(
        'NativeEzklAdapter has not been initialized. Call initialize() first.'
      );
    }

    let res: Response;
    try {
      res = await fetch(`${DAEMON_BASE_URL}/prove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: request.features }),
      });
    } catch (err: any) {
      throw new ProverExecutionError(
        `Failed to reach prover daemon: ${err?.message || 'network error'}`
      );
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new ProverExecutionError(
        `Daemon returned HTTP ${res.status}: ${body}`
      );
    }

    const data: DaemonProveResponse = await res.json();

    if (data.status !== 'success') {
      throw new ProverExecutionError(
        data.error || 'Daemon reported proof generation failure.'
      );
    }

    // Daemon must have verified the proof before returning success
    if (!data.verified) {
      throw new ProofValidationError(
        'Daemon generated a proof but local verification failed. ' +
          'The proof is NOT cryptographically valid.'
      );
    }

    // Structural validation
    if (!data.proof_hex || !data.proof_hex.startsWith('0x') || data.proof_hex.length < 10) {
      throw new ProofValidationError(
        'Returned proof_hex is missing or malformed.'
      );
    }

    if (!Array.isArray(data.instances) || data.instances.length === 0) {
      throw new ProofValidationError(
        'Returned instances array is missing or empty.'
      );
    }

    // Convert hex proof to Uint8Array
    const hexStr = data.proof_hex.startsWith('0x')
      ? data.proof_hex.slice(2)
      : data.proof_hex;
    const proofBytes = new Uint8Array(
      hexStr.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
    );

    return {
      proof: proofBytes,
      hexProof: data.proof_hex,
      instances: data.instances,
      executionTimeMs: data.execution_time_ms,
      engineVersion: data.engine_version,
      mode: this.mode,
      circuit: this.circuitMeta,
    };
  }

  /**
   * Client-side verification delegates to the daemon's /verify endpoint.
   */
  async verify(result: EzklProofResult): Promise<boolean> {
    try {
      const res = await fetch(`${DAEMON_BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof_hex: result.hexProof,
          instances: result.instances,
        }),
      });
      if (!res.ok) return false;
      const body = await res.json();
      return body.verified === true;
    } catch {
      return false;
    }
  }
}
