import { useState, useEffect, useRef, useCallback } from 'react';
import { ProofService, CompactProofPayload } from '../services/proofService';
import {
  MidnightContractBridge,
  ContractVerificationResult,
  globalMidnightContractBridge,
} from '../services/contractBridge';
import { PropertyInputs, ProverProgress, ProverWorkerOutput } from '../workers/prover.worker';

export type WorkflowState =
  | 'idle'
  | 'generating_proof'
  | 'submitting_to_midnight'
  | 'verified'
  | 'rejected'
  | 'error';

export interface UseMidnightContractReturn {
  workflowState: WorkflowState;
  stageMessage: string;
  proverProgress: ProverProgress | null;
  proofOutput: ProverWorkerOutput | null;
  compactPayload: CompactProofPayload | null;
  verificationResult: ContractVerificationResult | null;
  error: string | null;
  walletAddress: string | null;
  isSimulated: boolean;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  executeAppraisal: (
    inputs: PropertyInputs,
    requestedLoanUsd: number,
    secretPin?: number
  ) => Promise<ContractVerificationResult | null>;
  resetWorkflow: () => void;
}

export function useMidnightContract(): UseMidnightContractReturn {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('idle');
  const [stageMessage, setStageMessage] = useState<string>('Ready for property intake and ZK appraisal.');
  const [proverProgress, setProverProgress] = useState<ProverProgress | null>(null);
  const [proofOutput, setProofOutput] = useState<ProverWorkerOutput | null>(null);
  const [compactPayload, setCompactPayload] = useState<CompactProofPayload | null>(null);
  const [verificationResult, setVerificationResult] = useState<ContractVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);

  const proofServiceRef = useRef<ProofService | null>(null);
  const contractBridgeRef = useRef<MidnightContractBridge>(globalMidnightContractBridge);

  useEffect(() => {
    proofServiceRef.current = new ProofService();
    proofServiceRef.current.preloadAssets().catch(console.warn);

    return () => {
      proofServiceRef.current?.terminate();
    };
  }, []);

  const connectWallet = useCallback((address: string) => {
    setWalletAddress(address);
    contractBridgeRef.current.setWalletAddress(address);
    setError(null);
    setStageMessage(`Midnight Lace Wallet connected (${address.slice(0, 10)}...)`);
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    contractBridgeRef.current.setWalletAddress(null);
    setStageMessage('Wallet disconnected.');
  }, []);

  const resetWorkflow = useCallback(() => {
    setWorkflowState('idle');
    setStageMessage('Ready for property intake and ZK appraisal.');
    setProverProgress(null);
    setProofOutput(null);
    setCompactPayload(null);
    setVerificationResult(null);
    setError(null);
  }, []);

  const executeAppraisal = useCallback(
    async (
      inputs: PropertyInputs,
      requestedLoanUsd: number,
      secretPin: number = 4321
    ): Promise<ContractVerificationResult | null> => {
      if (!walletAddress) {
        const err = 'Please connect your Midnight Lace Wallet before proceeding.';
        setError(err);
        setWorkflowState('error');
        setStageMessage(err);
        return null;
      }

      setError(null);
      setVerificationResult(null);

      try {
        // Step 1: Generate ZKML Proof
        setWorkflowState('generating_proof');
        setStageMessage('Synthesizing Zero-Knowledge Real Estate Valuation Proof...');

        if (!proofServiceRef.current) {
          proofServiceRef.current = new ProofService();
        }

        const output = await proofServiceRef.current.generateProof(inputs, (progress) => {
          setProverProgress(progress);
          setStageMessage(`[Prover] ${progress.message}`);
        });

        if (output.status !== 'SUCCESS' || !output.valuationUsd) {
          throw new Error(output.error || 'Failed to synthesize ZK proof from property attributes.');
        }

        setProofOutput(output);

        // Step 2: Marshal for Midnight Compact Verifier ABI
        const marshaledPayload = proofServiceRef.current.marshalForMidnight(
          output,
          requestedLoanUsd
        );
        setCompactPayload(marshaledPayload);

        // Step 3: Submit to Midnight Smart Contract
        setWorkflowState('submitting_to_midnight');
        setStageMessage('Submitting ZK proof, nullifier & collateral verification to Midnight Compact...');

        const result = await contractBridgeRef.current.verifyAppraisalProof({
          loanThresholdUsd: requestedLoanUsd,
          secretPin,
          valuationUsd: output.valuationUsd,
          proofPayload: marshaledPayload,
        });

        setVerificationResult(result);
        setIsSimulated(result.mode === 'SIMULATED');

        if (result.status === 'VERIFIED') {
          setWorkflowState('verified');
          setStageMessage(
            `Contract Verified! Authorized $${result.authorizedAmount.toLocaleString()} under ${result.tierName}. Tx: ${result.transactionHash.slice(0, 16)}...`
          );
        } else {
          setWorkflowState('rejected');
          setStageMessage(
            `Contract Rejection: ${result.error || 'Loan threshold exceeds maximum collateral LTV limit.'}`
          );
        }

        return result;
      } catch (err: any) {
        const errorMsg = err?.message || 'An unexpected error occurred during contract verification.';
        console.error('[useMidnightContract error]:', err);
        setError(errorMsg);
        setWorkflowState('error');
        setStageMessage(`Error: ${errorMsg}`);
        return null;
      }
    },
    [walletAddress]
  );

  return {
    workflowState,
    stageMessage,
    proverProgress,
    proofOutput,
    compactPayload,
    verificationResult,
    error,
    walletAddress,
    isSimulated,
    connectWallet,
    disconnectWallet,
    executeAppraisal,
    resetWorkflow,
  };
}
