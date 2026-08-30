import React, { useState } from 'react';
import { GradientMesh } from './components/GradientMesh';
import { SiteNav } from './components/SiteNav';
import { Hero } from './components/Hero';
import { PropertyIntakeForm } from './components/PropertyIntakeForm';
import { LoanCalculator } from './components/LoanCalculator';
import { WalletConnector } from './components/WalletConnector';
import { useMidnightContract } from './hooks/useMidnightContract';
import { PropertyInputs } from './workers/prover.worker';
import {
  ShieldCheck,
  Cpu,
  Lock,
  AlertCircle,
  FileCode2,
} from 'lucide-react';

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
    sqft: 2200,
    bedrooms: 4,
    bathrooms: 3,
    age: 15,
    locationRisk: 20,
    medInc: 3.5,
    houseAge: 15,
    aveRooms: 5.8,
    aveOccup: 2.8,
  });

  const handleSynthesizeAndSubmit = async (inputs: PropertyInputs) => {
    setCachedInputs(inputs);
    await executeAppraisal(inputs, requestedLoanUsd, secretPin);
  };

  const handleLoanSubmitOnly = async () => {
    await executeAppraisal(cachedInputs, requestedLoanUsd, secretPin);
  };

  const stateBadges: Record<
    string,
    { label: string; color: string; ping: string }
  > = {
    idle: {
      label: 'Ready',
      color: 'text-slate-300 bg-white/[0.04] border-white/10',
      ping: 'bg-slate-400',
    },
    generating_proof: {
      label: 'Generating ZKML Proof',
      color: 'text-indigo bg-indigo/15 border-indigo/30',
      ping: 'bg-indigo',
    },
    submitting_to_midnight: {
      label: 'Submitting to Midnight',
      color: 'text-violet bg-violet/15 border-violet/30',
      ping: 'bg-violet',
    },
    verified: {
      label: 'Contract Verified',
      color: 'text-accent bg-accent/15 border-accent/30',
      ping: 'bg-accent',
    },
    rejected: {
      label: 'Contract Rejected',
      color: 'text-rose-400 bg-rose-950/80 border-rose-800',
      ping: 'bg-rose-400',
    },
    error: {
      label: 'Error',
      color: 'text-rose-400 bg-rose-950/80 border-rose-800',
      ping: 'bg-rose-400',
    },
  };

  const currentBadge = stateBadges[workflowState] || stateBadges.idle;

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-indigo/30 selection:text-white">
      {/* Background Gradient Mesh */}
      <GradientMesh />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <SiteNav
          walletAddress={walletAddress}
          isConnected={!!walletAddress}
          onConnect={() =>
            connectWallet('mn_shielded_1q9x38a72kc89zp4l56v0u30rhw85s2m8k472nd09f')
          }
          onDisconnect={disconnectWallet}
        />

        {/* Hero Section */}
        <Hero />

        {/* Main Application Container */}
        <main
          id="appraise"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full scroll-mt-20"
        >
          {/* Midnight Wallet Bar */}
          <WalletConnector
            isConnected={!!walletAddress}
            walletAddress={walletAddress}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
          />

          {/* Workflow Status Banner */}
          <div className="mb-8 p-4 rounded-2xl glass border border-white/10 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3 truncate max-w-2xl">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${
                  currentBadge.ping
                } ${
                  workflowState === 'generating_proof' ||
                  workflowState === 'submitting_to_midnight'
                    ? 'animate-ping'
                    : ''
                }`}
              />
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border shrink-0 ${currentBadge.color}`}
              >
                {currentBadge.label}
              </span>
              <span className="text-secondary-foreground truncate">
                {stageMessage}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-muted-foreground text-[11px] shrink-0 self-end sm:self-auto">
              {proofOutput?.executionTimeMs && (
                <span className="font-mono">
                  Prover: {proofOutput.executionTimeMs.toFixed(0)} ms
                </span>
              )}
              <span
                className={`px-2.5 py-0.5 rounded-full font-mono font-medium border ${
                  proofOutput?.proverMode === 'SIMULATED_DEV_ONLY'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                    : proofOutput?.proverMode === 'NATIVE_EZKL_23'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : isSimulated
                    ? 'bg-white/[0.04] text-muted-foreground border-white/10'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                }`}
              >
                {proofOutput?.proverMode === 'SIMULATED_DEV_ONLY'
                  ? '⚠️ DEV SIMULATOR'
                  : proofOutput?.proverMode === 'NATIVE_EZKL_23'
                  ? `EZKL ${proofOutput.engineVersion || '23.0.5'} Native`
                  : proofOutput?.proverMode === 'BROWSER_WASM'
                  ? `EZKL ${proofOutput.engineVersion || '23.0.5'} WASM`
                  : isSimulated
                  ? 'Local Simulator'
                  : 'Midnight Live Node'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 font-mono flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* 2-Column Responsive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Property Intake & Proof Artifact */}
            <div className="space-y-6">
              <PropertyIntakeForm
                onSubmit={handleSynthesizeAndSubmit}
                isLoading={
                  workflowState === 'generating_proof' ||
                  workflowState === 'submitting_to_midnight'
                }
                progress={proverProgress}
              />

              {/* Halo2 Proof Artifact Card */}
              {/* Simulation Warning Banner (plan Section 25) */}
              {proofOutput?.proverMode === 'SIMULATED_DEV_ONLY' && (
                <div className="mb-4 p-3 rounded-xl bg-amber-950/50 border border-amber-700/60 text-amber-200 text-[11px] font-mono">
                  <span className="font-bold">DEVELOPMENT ONLY</span> — Cryptographic proof is simulated.
                  This result has NOT been generated by EZKL.
                  This result MUST NOT be used for production verification.
                </div>
              )}

              {proofOutput && (
                <div className="rounded-3xl glass p-6 shadow-xl border border-white/10 text-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-indigo" />
                      <span className="font-display text-sm font-bold text-foreground">
                        ZK Proof Artifact (&pi;)
                      </span>
                    </div>
                    <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full border ${
                      proofOutput.proverMode === 'SIMULATED_DEV_ONLY'
                        ? 'text-amber-300 bg-amber-950/60 border-amber-700/40'
                        : 'text-accent bg-accent/10 border-accent/20'
                    }`}>
                      {proofOutput.proverMode === 'SIMULATED_DEV_ONLY'
                        ? 'SIMULATED — NOT VALID'
                        : proofOutput.proverMode === 'NATIVE_EZKL_23'
                        ? `EZKL ${proofOutput.engineVersion || '23.0.5'} Verified`
                        : proofOutput.proverMode === 'BROWSER_WASM'
                        ? `EZKL WASM Verified`
                        : `${proofOutput.proof?.length ? Math.floor((proofOutput.proof.length - 2) / 2) : '?'} Bytes Halo2 SNARK`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground font-mono block mb-1">
                      Proof Hex Payload (Evaluated by Compact Verifier)
                    </span>
                    <div className="bg-black/50 p-3 rounded-xl border border-white/10 font-mono text-[11px] text-muted-foreground break-all leading-relaxed">
                      {proofOutput.proof?.slice(0, 160)}&hellip;
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                    <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] block font-mono">
                        Quantized Scalar
                      </span>
                      <span className="text-foreground font-mono font-medium text-xs">
                        {proofOutput.quantizedValuationScalar}
                      </span>
                    </div>
                    <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] block font-mono">
                        Scale Multiplier
                      </span>
                      <span className="text-foreground font-mono font-medium text-xs">
                        {proofOutput.scaleFactor} (2^{proofOutput.scalePower})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Loan Collateral Calculator & Contract Receipt */}
            <div className="space-y-6">
              <LoanCalculator
                appraisalValuationUsd={proofOutput?.valuationUsd || null}
                requestedLoanUsd={requestedLoanUsd}
                onRequestedLoanChange={setRequestedLoanUsd}
                secretPin={secretPin}
                onSecretPinChange={setSecretPin}
                onSubmitLoanRequest={handleLoanSubmitOnly}
                isSubmitting={
                  workflowState === 'submitting_to_midnight' ||
                  workflowState === 'generating_proof'
                }
                vkCommitment={proofOutput?.vkCommitment}
                scaleFactor={proofOutput?.scaleFactor}
                workflowState={workflowState}
                tier={verificationResult?.tier}
              />

              {/* Confirmed Midnight Smart Contract Outcome Receipt */}
              {verificationResult && (
                <div
                  className={`rounded-3xl p-6 shadow-2xl space-y-4 border ${
                    verificationResult.status === 'VERIFIED'
                      ? 'glass-strong border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          verificationResult.status === 'VERIFIED'
                            ? 'bg-emerald-400 animate-pulse'
                            : 'bg-rose-400'
                        }`}
                      />
                      <span className="font-display text-sm font-bold text-foreground">
                        Midnight Contract Receipt: {verificationResult.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-accent font-semibold bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                      {verificationResult.tierName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="glass p-3 rounded-2xl border border-white/10">
                      <span className="text-muted-foreground block text-[10px]">
                        Authorized Credit Limit
                      </span>
                      <span className="text-xl font-bold font-display text-accent mt-0.5 block">
                        ${verificationResult.authorizedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="glass p-3 rounded-2xl border border-white/10">
                      <span className="text-muted-foreground block text-[10px]">
                        Block Height
                      </span>
                      <span className="text-xl font-bold font-mono text-foreground mt-0.5 block">
                        #{verificationResult.blockHeight}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-2 font-mono glass p-3.5 rounded-2xl border border-white/10 text-muted-foreground">
                    <div className="truncate">
                      <span className="text-secondary-foreground font-semibold">
                        Tx Hash:{' '}
                      </span>
                      <span className="text-indigo">
                        {verificationResult.transactionHash}
                      </span>
                    </div>
                    <div className="truncate">
                      <span className="text-secondary-foreground font-semibold">
                        Unlinkable PK:{' '}
                      </span>
                      <span className="text-secondary-foreground">
                        {verificationResult.userPublicKey}
                      </span>
                    </div>
                    <div className="truncate">
                      <span className="text-secondary-foreground font-semibold">
                        Nullifier:{' '}
                      </span>
                      <span className="text-muted-foreground">
                        {verificationResult.nullifierHash}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>
                      Contract:{' '}
                      <span className="text-foreground font-mono">
                        appraiser_verifier.compact
                      </span>
                    </span>
                    <span>
                      Gas Used:{' '}
                      <span className="text-accent font-mono">
                        {verificationResult.gasUsed?.toLocaleString()} units
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Architecture Details Section */}
          <section id="architecture-info" className="mt-20 pt-10 border-t border-white/[0.08]">
            <div className="mb-8 text-center">
              <h3 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Zero-Knowledge Valuation Architecture
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
                How VeilCred enforces trustless DeFi lending without disclosing private property data.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-3xl glass p-6 border border-white/10 space-y-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo/15 text-indigo border border-indigo/25">
                  <Lock className="h-5 w-5" />
                </div>
                <h4 className="font-display text-base font-semibold text-foreground">
                  1. Local Witness Input
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Property attributes, rooms, and square footage remain 100% on-device in Web Worker memory.
                  No sensitive coordinates or features are transmitted over the network.
                </p>
              </div>

              <div className="rounded-3xl glass p-6 border border-white/10 space-y-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet/15 text-violet border border-violet/25">
                  <Cpu className="h-5 w-5" />
                </div>
                <h4 className="font-display text-base font-semibold text-foreground">
                  2. Halo2 SNARK Proving
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The client-side EZKL/Wasm runtime evaluates the linear valuation model and synthesizes a 512-byte zero-knowledge proof with quantized fixed-point scaling (2^13).
                </p>
              </div>

              <div className="rounded-3xl glass p-6 border border-white/10 space-y-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent border border-accent/25">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="font-display text-base font-semibold text-foreground">
                  3. Midnight Compact Settlement
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Midnight Compact smart contract verifies the proof commitment, records domain-separated nullifiers to prevent double-pledging, and authorizes up to 75% LTV.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/[0.08] bg-background/50 py-8 text-center text-xs text-muted-foreground">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>
              VeilCred &bull; Powered by Midnight Compact Smart Contracts &bull; Client-Side EZKL Wasm Prover
            </p>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="text-indigo">Halo2 KZG</span>
              <span>&bull;</span>
              <span className="text-violet">Compact 0.26</span>
              <span>&bull;</span>
              <span className="text-accent">Midnight Lace</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
