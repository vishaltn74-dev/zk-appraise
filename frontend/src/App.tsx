import React, { useState } from 'react';
import { PropertyIntakeForm } from './components/PropertyIntakeForm';
import { LoanCalculator } from './components/LoanCalculator';
import { WalletConnector } from './components/WalletConnector';
import { useMidnightContract } from './hooks/useMidnightContract';
import { PropertyInputs } from './workers/prover.worker';

export const App: React.FC = () => {
  const {
    workflowState,
    stageMessage,
    proverProgress,
    proofOutput,
    verificationResult,
    error,
    walletAddress,
    isSimulated,
    connectWallet,
    disconnectWallet,
    executeAppraisal,
  } = useMidnightContract();

  const [requestedLoanUsd, setRequestedLoanUsd] = useState<number>(300000);
  const [secretPin, setSecretPin] = useState<number>(4321);
  const [cachedInputs, setCachedInputs] = useState<PropertyInputs>({
    medInc: 3.5,
    houseAge: 20,
    aveRooms: 5.5,
    aveOccup: 3.0,
    sqft: 2200,
    bedrooms: 3,
    bathrooms: 2,
    age: 20,
    locationRisk: 25,
  });

  const handleSynthesizeAndSubmit = async (inputs: PropertyInputs) => {
    setCachedInputs(inputs);
    await executeAppraisal(inputs, requestedLoanUsd, secretPin);
  };

  const handleLoanSubmitOnly = async () => {
    await executeAppraisal(cachedInputs, requestedLoanUsd, secretPin);
  };

  const stateBadges: Record<string, { label: string; color: string; ping: string }> = {
    idle: { label: 'Ready', color: 'text-slate-400 bg-slate-900 border-slate-700', ping: 'bg-slate-500' },
    generating_proof: { label: 'Generating ZKML Proof', color: 'text-cyan-400 bg-cyan-950/80 border-cyan-800', ping: 'bg-cyan-400' },
    submitting_to_midnight: { label: 'Submitting to Midnight', color: 'text-amber-400 bg-amber-950/80 border-amber-800', ping: 'bg-amber-400' },
    verified: { label: 'Contract Verified', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-800', ping: 'bg-emerald-400' },
    rejected: { label: 'Contract Rejected', color: 'text-rose-400 bg-rose-950/80 border-rose-800', ping: 'bg-rose-400' },
    error: { label: 'Error', color: 'text-rose-400 bg-rose-950/80 border-rose-800', ping: 'bg-rose-400' },
  };

  const currentBadge = stateBadges[workflowState] || stateBadges.idle;

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
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800 font-mono">
              Halo2 / EZKL Wasm Engine
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-950/80 text-purple-300 border border-purple-800 font-mono">
              Compact 0.26
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
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />

        {/* Reactive Status Bar */}
        <div className="mb-6 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2.5">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${currentBadge.ping} ${workflowState === 'generating_proof' || workflowState === 'submitting_to_midnight' ? 'animate-ping' : ''}`} />
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${currentBadge.color}`}>
              {currentBadge.label}
            </span>
            <span className="text-slate-300 truncate max-w-xl">{stageMessage}</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
            {proofOutput?.executionTimeMs && (
              <span>Prover: {proofOutput.executionTimeMs.toFixed(0)} ms</span>
            )}
            <span className={`px-2 py-0.5 rounded font-mono ${isSimulated ? 'bg-slate-800 text-slate-400' : 'bg-emerald-950 text-emerald-300'}`}>
              {isSimulated ? 'Local Simulator' : 'Midnight Live'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-mono flex items-center justify-between">
            <span>✕ {error}</span>
          </div>
        )}

        {/* 2-Column Application Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Property Intake Form */}
          <div>
            <PropertyIntakeForm
              onSubmit={handleSynthesizeAndSubmit}
              isLoading={workflowState === 'generating_proof' || workflowState === 'submitting_to_midnight'}
              progress={proverProgress}
            />

            {/* Proof Artifact Details Card */}
            {proofOutput && (
              <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white uppercase tracking-wider">ZK Proof Artifact (π)</span>
                  <span className="text-emerald-400 font-mono">512 Bytes Halo2 SNARK Valid</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[11px] text-slate-400 break-all">
                  {proofOutput.proof?.slice(0, 140)}...
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>Quantized Scalar: <span className="text-slate-200 font-mono">{proofOutput.quantizedValuationScalar}</span></div>
                  <div>Scale Multiplier: <span className="text-slate-200 font-mono">{proofOutput.scaleFactor} (2^{proofOutput.scalePower})</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Loan Calculator & Midnight Smart Contract Outcomes */}
          <div className="space-y-6">
            <LoanCalculator
              appraisalValuationUsd={proofOutput?.valuationUsd || null}
              requestedLoanUsd={requestedLoanUsd}
              onRequestedLoanChange={setRequestedLoanUsd}
              secretPin={secretPin}
              onSecretPinChange={setSecretPin}
              onSubmitLoanRequest={handleLoanSubmitOnly}
              isSubmitting={workflowState === 'submitting_to_midnight' || workflowState === 'generating_proof'}
              vkCommitment={proofOutput?.vkCommitment}
              scaleFactor={proofOutput?.scaleFactor}
              workflowState={workflowState}
              tier={verificationResult?.tier}
            />

            {/* Confirmed Contract Outcome Receipt */}
            {verificationResult && (
              <div className={`border rounded-xl p-5 shadow-2xl space-y-4 ${
                verificationResult.status === 'VERIFIED'
                  ? 'bg-emerald-950/30 border-emerald-800'
                  : 'bg-rose-950/30 border-rose-800'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${verificationResult.status === 'VERIFIED' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="font-bold text-sm text-white">
                      Midnight Smart Contract Outcome: {verificationResult.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">
                    {verificationResult.tierName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Authorized Credit</span>
                    <span className="text-lg font-bold text-emerald-400">
                      ${verificationResult.authorizedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Block Height</span>
                    <span className="text-lg font-bold text-slate-200 font-mono">
                      #{verificationResult.blockHeight}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-slate-300 font-mono bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="truncate">
                    <span className="text-slate-500">Tx Hash: </span>
                    <span className="text-cyan-300">{verificationResult.transactionHash}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Unlinkable PK: </span>
                    <span className="text-slate-300">{verificationResult.userPublicKey}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Nullifier: </span>
                    <span className="text-slate-400">{verificationResult.nullifierHash}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Contract: <span className="text-slate-200 font-mono">appraiser_verifier.compact</span></span>
                  <span>Gas Used: <span className="text-slate-200 font-mono">{verificationResult.gasUsed}</span></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 text-center text-xs text-slate-500">
        <p>ZK-Appraise &bull; Powered by Midnight Compact Smart Contracts &bull; Client-Side EZKL Wasm Prover</p>
      </footer>
    </div>
  );
};

export default App;
