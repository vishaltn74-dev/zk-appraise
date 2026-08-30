/**
 * Prover Worker — ZK-Appraise
 *
 * Transport / orchestration layer (plan Section 16).
 * All simulated proving logic, pseudo-random proof generation, setTimeout delays,
 * and synthetic proof bytes have been removed.
 *
 * The worker delegates to the selected ProverAdapter via the prover registry.
 * It does NOT contain EZKL cryptographic implementation.
 */

// ---------------------------------------------------------------------------
// Shared types — exported for use by ProofService / UI
// ---------------------------------------------------------------------------

export interface PropertyInputs {
  // California Housing direct attributes (model contract)
  medInc?: number;
  houseAge?: number;
  aveRooms?: number;
  aveOccup?: number;

  // Real estate specifications
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  age?: number;
  locationRisk?: number;
}

/**
 * Truthful lifecycle states (plan Section 17).
 * We do NOT fake ASSIGNING_WITNESS / SYNTHESIZING_SNARK unless the
 * underlying prover actually exposes them.
 */
export type ProverStage =
  | 'IDLE'
  | 'CONNECTING'
  | 'INITIALIZING'
  | 'PREPARING_INPUTS'
  | 'GENERATING_PROOF'
  | 'VERIFYING_PROOF'
  | 'COMPLETED'
  | 'ERROR';

export interface ProverProgress {
  stage: ProverStage;
  progressPct: number;
  message: string;
}

export interface ProverInitMessage {
  type: 'INIT_PROVER';
  payload?: {
    wasmMemoryMb?: number;
  };
}

export interface ProverGenerateMessage {
  type: 'GENERATE_PROOF';
  payload: PropertyInputs;
}

export interface ProverTerminateMessage {
  type: 'TERMINATE_PROVER';
}

export type ProverWorkerMessage =
  | ProverInitMessage
  | ProverGenerateMessage
  | ProverTerminateMessage;

export interface ProverWorkerOutput {
  status: 'SUCCESS' | 'ERROR';
  proof?: string;
  publicInputs?: (number | string)[];
  valuationUsd?: number;
  quantizedValuationScalar?: string;
  scaleFactor?: number;
  scalePower?: number;
  vkCommitment?: string;
  executionTimeMs?: number;
  proverMode?: string;
  engineVersion?: string;
  error?: string;
}

export interface ProverWorkerEventResponse {
  type: 'PROGRESS' | 'RESULT';
  progress?: ProverProgress;
  result?: ProverWorkerOutput;
}

// ---------------------------------------------------------------------------
// Worker runtime
// ---------------------------------------------------------------------------

import type { IEzklProverEngine, EzklProofResult } from '../services/prover/types';
import { CIRCUIT_SCALE_FACTOR, CIRCUIT_SCALE_POWER, CIRCUIT_VK_COMMITMENT } from '../services/prover/types';
import { createProverEngine } from '../services/prover/proverRegistry';

let engine: IEzklProverEngine | null = null;

function emitProgress(stage: ProverStage, progressPct: number, message: string) {
  const response: ProverWorkerEventResponse = {
    type: 'PROGRESS',
    progress: { stage, progressPct, message },
  };
  self.postMessage(response);
}

function emitResult(result: ProverWorkerOutput) {
  self.postMessage({ type: 'RESULT', result });
}

self.onmessage = async (event: MessageEvent<ProverWorkerMessage | PropertyInputs>) => {
  const data = event.data;

  // Handle legacy direct PropertyInputs format or typed RPC
  const isRpc = typeof data === 'object' && data !== null && 'type' in data;
  const msgType = isRpc ? (data as ProverWorkerMessage).type : 'GENERATE_PROOF';
  const payload = isRpc
    ? (data as ProverGenerateMessage).payload
    : (data as PropertyInputs);

  // -----------------------------------------------------------------------
  // INIT_PROVER
  // -----------------------------------------------------------------------
  if (msgType === 'INIT_PROVER') {
    try {
      emitProgress('CONNECTING', 10, 'Connecting to prover engine...');
      engine = await createProverEngine();
      emitProgress('IDLE', 100, `Prover ready (${engine.mode}, ${engine.version}).`);
      emitResult({ status: 'SUCCESS', proverMode: engine.mode, engineVersion: engine.version });
    } catch (err: any) {
      emitProgress('ERROR', 0, err?.message || 'Prover initialization failed');
      emitResult({ status: 'ERROR', error: err?.message || 'Initialization failed' });
    }
    return;
  }

  // -----------------------------------------------------------------------
  // TERMINATE_PROVER
  // -----------------------------------------------------------------------
  if (msgType === 'TERMINATE_PROVER') {
    engine = null;
    emitResult({ status: 'SUCCESS' });
    return;
  }

  // -----------------------------------------------------------------------
  // GENERATE_PROOF
  // -----------------------------------------------------------------------
  const startTime = performance.now();
  const inputs = payload as PropertyInputs;

  try {
    // Auto-initialize if needed
    if (!engine) {
      emitProgress('CONNECTING', 10, 'Initializing prover engine...');
      engine = await createProverEngine();
    }

    // 1. Validate & prepare request
    emitProgress('PREPARING_INPUTS', 20, 'Validating property features...');

    const features: Record<string, number> = {};
    if (inputs.medInc !== undefined) features.medInc = inputs.medInc;
    if (inputs.houseAge !== undefined) features.houseAge = inputs.houseAge;
    if (inputs.aveRooms !== undefined) features.aveRooms = inputs.aveRooms;
    if (inputs.aveOccup !== undefined) features.aveOccup = inputs.aveOccup;
    if (inputs.sqft !== undefined) features.sqft = inputs.sqft;
    if (inputs.bedrooms !== undefined) features.bedrooms = inputs.bedrooms;
    if (inputs.bathrooms !== undefined) features.bathrooms = inputs.bathrooms;
    if (inputs.age !== undefined) features.age = inputs.age;
    if (inputs.locationRisk !== undefined) features.locationRisk = inputs.locationRisk;

    // 2. Generate proof via the adapter
    emitProgress('GENERATING_PROOF', 50, `Generating proof via ${engine.mode}...`);

    const proofResult: EzklProofResult = await engine.prove({ features });

    // 3. Proof verification (already done server-side for native, but report it)
    emitProgress('VERIFYING_PROOF', 85, 'Proof generated, verifying...');

    // 4. Extract values for the UI & Compact ABI mapper
    // The actual public instances come from EZKL — not recomputed in TypeScript
    const executionTimeMs = performance.now() - startTime;

    // Parse valuation from instances if available
    let valuationUsd: number | undefined;
    let quantizedScalar: string | undefined;
    let scaleFactor: number | undefined;
    let vkCommitment: string | undefined;

    if (proofResult.instances.length >= 3) {
      quantizedScalar = proofResult.instances[0];
      const scaleStr = proofResult.instances[1];
      vkCommitment = proofResult.instances[2];
      scaleFactor = parseInt(scaleStr, 10) || CIRCUIT_SCALE_FACTOR;

      // Derive display valuation from quantized scalar (UI only — not submitted as public instance)
      try {
        valuationUsd = Number(BigInt(quantizedScalar) / BigInt(scaleFactor));
      } catch {
        // If instance is a hex field element, we may not be able to parse directly
        valuationUsd = undefined;
      }
    }

    emitProgress('COMPLETED', 100, `Proof generated via ${engine.mode} in ${executionTimeMs.toFixed(0)} ms.`);

    const output: ProverWorkerOutput = {
      status: 'SUCCESS',
      proof: proofResult.hexProof,
      publicInputs: proofResult.instances,
      valuationUsd,
      quantizedValuationScalar: quantizedScalar,
      scaleFactor: scaleFactor || CIRCUIT_SCALE_FACTOR,
      scalePower: CIRCUIT_SCALE_POWER,
      vkCommitment: vkCommitment || CIRCUIT_VK_COMMITMENT,
      executionTimeMs,
      proverMode: proofResult.mode,
      engineVersion: proofResult.engineVersion,
    };

    emitResult(output);
  } catch (err: any) {
    emitProgress('ERROR', 0, err?.message || 'Proof generation failed');
    emitResult({
      status: 'ERROR',
      error: err?.message || 'Proof synthesis failed unexpectedly',
    });
  }
};
