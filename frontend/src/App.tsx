import React, { useState, useEffect, useRef } from 'react';
import { PropertyIntakeForm } from './components/PropertyIntakeForm';
import { LoanCalculator } from './components/LoanCalculator';
import { WalletConnector } from './components/WalletConnector';
import { ProofService, CompactProofPayload } from './services/proofService';
import { MidnightWalletService, MidnightTxResult } from './services/midnightWallet';
import { PropertyInputs, ProverProgress, ProverWorkerOutput } from './workers/prover.worker';

export const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isProving, setIsProving] = useState<boolean>(false);
  const [provingProgress, setProvingProgress] = useState<ProverProgress | null>(null);
  const [proofResult, setProofResult] = useState<ProverWorkerOutput | null>(null);
  const [compactPayload, setCompactPayload] = useState<CompactProofPayload | null>(null);
  const [requestedLoanUsd, setRequestedLoanUsd] = useState<number>(350000);
  const [isSubmittingTx, setIsSubmittingTx] = useState<boolean>(false);
  const [txResult, setTxResult] = useState<MidnightTxResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const proofServiceRef = useRef<ProofService | null>(null);
  const midnightWalletRef = useRef<MidnightWalletService | null>(null);

  useEffect(() => {
    proofServiceRef.current = new ProofService();
    midnightWalletRef.current = new MidnightWalletService();

    // Preload & warm cache
    proofServiceRef.current.preloadAssets().catch(console.warn);

    return () => {
      proofServiceRef.current?.terminate();
    };
  }, []);

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    midnightWalletRef.current?.setWalletAddress(address);
    setStatusMessage('Midnight Lace Wallet connected.');
  };

  const handleWalletDisconnect = () => {
    setWalletAddress(null);
    midnightWalletRef.current?.setWalletAddress(null);
    setStatusMessage('Wallet disconnected.');
  };

  const handleSynthesizeProof = async (inputs: PropertyInputs) => {
    if (!proofServiceRef.current) return;

    setIsProving(true);
    setTxResult(null);
    setStatusMessage('Synthesizing Zero-Knowledge Real Estate Valuation Proof...');

    try {
      const output = await proofServiceRef.current.generateProof(inputs, (progress) => {
        setProvingProgress(progress);
      });

      setProofResult(output);

      // Marshal for Midnight Compact contract with required collateral threshold ($300k base)
      const marshaled = proofServiceRef.current.marshalForMidnight(output, 300000);
      setCompactPayload(marshaled);
      setStatusMessage(`Proof generated in ${(output.executionTimeMs || 0).toFixed(0)} ms! Ready for Midnight submission.`);
    } catch (err: any) {
      console.error('Prover error:', err);
      setStatusMessage(`Proof generation failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsProving(false);
    }
  };

  const handleSubmitLoan = async () => {
    if (!midnightWalletRef.current || !walletAddress) {
      alert('Please connect your Midnight Lace Wallet first.');
      return;
    }
    if (!compactPayload || !proofResult?.valuationUsd) {
      alert('Please synthesize a zero-knowledge appraisal proof first.');
      return;
    }

    setIsSubmittingTx(true);
    setStatusMessage('Submitting ZK proof and collateral commitment to Midnight Network...');

    try {
      const result = await midnightWalletRef.current.submitCollateralProofTx({
        ...compactPayload,
        requestedLoanUsd,
        valuationUsd: proofResult.valuationUsd,
      });

      setTxResult(result);
      setStatusMessage('Transaction confirmed on Midnight! Collateral successfully registered.');
    } catch (err: any) {
      console.error('Submission failed:', err);
      setStatusMessage(`Submission failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmittingTx(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-cyan-500/20">
              ZK
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">ZK-Appraise</h1>
              <p className="text-[11px] text-slate-400">Zero-Knowledge DeFi Home Equity on Midnight Network</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800 font-mono">
              Halo2 / EZKL Wasm Engine
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Wallet Bar */}
        <WalletConnector
          isConnected={!!walletAddress}
          walletAddress={walletAddress}
          onConnect={handleWalletConnect}
          onDisconnect={handleWalletDisconnect}
        />

        {/* Status Alert Bar */}
        {statusMessage && (
          <div className="mb-6 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{statusMessage}</span>
            </div>
            {proofResult?.executionTimeMs && (
              <span className="text-slate-400">Latency: {proofResult.executionTimeMs.toFixed(0)} ms</span>
            )}
          </div>
        )}

        {/* 2-Column Application Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Private Property Intake Form */}
          <div>
            <PropertyIntakeForm
              onSubmit={handleSynthesizeProof}
              isLoading={isProving}
              progress={provingProgress}
            />

            {/* Proof Details Card */}
            {proofResult && (
              <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white uppercase tracking-wider">ZK Proof Artifact (π)</span>
                  <span className="text-emerald-400 font-mono">512 Bytes Valid</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[11px] text-slate-400 break-all">
                  {proofResult.proof?.slice(0, 120)}...
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>Quantized Scalar: <span className="text-slate-200 font-mono">{proofResult.quantizedValuationScalar}</span></div>
                  <div>Scale Multiplier: <span className="text-slate-200 font-mono">{proofResult.scaleFactor} (2^{proofResult.scalePower})</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Loan Calculator & Midnight Submitter */}
          <div className="space-y-6">
            <LoanCalculator
              appraisalValuationUsd={proofResult?.valuationUsd || null}
              requestedLoanUsd={requestedLoanUsd}
              onRequestedLoanChange={setRequestedLoanUsd}
              onSubmitLoanRequest={handleSubmitLoan}
              isSubmitting={isSubmittingTx}
              vkCommitment={proofResult?.vkCommitment}
              scaleFactor={proofResult?.scaleFactor}
            />

            {/* Confirmed Transaction Receipt */}
            {txResult && (
              <div className="bg-emerald-950/30 border border-emerald-800 rounded-xl p-5 shadow-2xl space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Midnight Contract Receipt Confirmed</span>
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <div>
                    <span className="text-slate-500">Tx Hash: </span>
                    <span className="font-mono text-cyan-300">{txResult.transactionHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Block Height: </span>
                    <span className="font-mono text-slate-200">#{txResult.blockHeight}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Contract: </span>
                    <span className="font-mono text-slate-200">LoanCollateralPool.compact</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 text-center text-xs text-slate-500">
        <p>ZK-Appraise &bull; Powered by Midnight Compact Contracts &bull; Client-Side EZKL Wasm</p>
      </footer>
    </div>
  );
};

export default App;
