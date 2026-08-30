import React from 'react';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  AlertTriangle,
  FileCheck2,
  KeyRound,
} from 'lucide-react';
import { AppraisalTier, TIER_DEFINITIONS } from '../services/contractBridge';

interface LoanCalculatorProps {
  appraisalValuationUsd: number | null;
  requestedLoanUsd: number;
  onRequestedLoanChange: (amount: number) => void;
  secretPin: number;
  onSecretPinChange: (pin: number) => void;
  onSubmitLoanRequest: () => void;
  isSubmitting: boolean;
  vkCommitment?: string;
  scaleFactor?: number;
  workflowState?: string;
  tier?: AppraisalTier | null;
}

function currency(n: number) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  appraisalValuationUsd,
  requestedLoanUsd,
  onRequestedLoanChange,
  secretPin,
  onSecretPinChange,
  onSubmitLoanRequest,
  isSubmitting,
  vkCommitment,
  scaleFactor = 8192,
  workflowState = 'idle',
  tier,
}) => {
  const currentTier: AppraisalTier =
    tier ||
    (appraisalValuationUsd
      ? appraisalValuationUsd >= 750000
        ? 'Platinum'
        : appraisalValuationUsd >= 500000
        ? 'Gold'
        : appraisalValuationUsd >= 300000
        ? 'Silver'
        : appraisalValuationUsd >= 100000
        ? 'Bronze'
        : 'Ineligible'
      : 'Ineligible');

  const tierConfig = TIER_DEFINITIONS[currentTier];
  const maxLtvPct = tierConfig.maxLtv * 100;
  const maxEligibleLoan = appraisalValuationUsd
    ? Math.min((appraisalValuationUsd * maxLtvPct) / 100, tierConfig.maxLoanCap)
    : 0;

  const currentLtvNum =
    appraisalValuationUsd && appraisalValuationUsd > 0
      ? (requestedLoanUsd / appraisalValuationUsd) * 100
      : 0;

  const isEligible =
    appraisalValuationUsd !== null &&
    requestedLoanUsd <= maxEligibleLoan &&
    requestedLoanUsd > 0 &&
    currentTier !== 'Ineligible';

  // LTV Visual Bar percentage capped at 100%
  const barPct = appraisalValuationUsd
    ? Math.min(100, Math.max(0, currentLtvNum))
    : 0;

  const tierBadgeColors: Record<AppraisalTier, { bg: string; text: string; border: string }> = {
    Platinum: { bg: 'bg-indigo-950/80', text: 'text-indigo-300', border: 'border-indigo-700/60' },
    Gold: { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-700/60' },
    Silver: { bg: 'bg-slate-800/80', text: 'text-slate-200', border: 'border-slate-600/60' },
    Bronze: { bg: 'bg-orange-950/80', text: 'text-orange-300', border: 'border-orange-700/60' },
    Ineligible: { bg: 'bg-rose-950/80', text: 'text-rose-400', border: 'border-rose-800/60' },
  };

  const currentBadge = tierBadgeColors[currentTier];

  return (
    <div className="rounded-3xl glass-strong p-6 sm:p-8 shadow-2xl border border-white/10 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent border border-accent/25">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                LTV Collateral Breakdown
              </h2>
              <p className="text-xs text-muted-foreground">
                Enforced by Midnight Compact protocol constraints
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {appraisalValuationUsd !== null && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-mono border ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}>
                {tierConfig.name}
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.05] text-secondary-foreground border border-white/10">
              Cap: {appraisalValuationUsd !== null ? `${maxLtvPct}%` : '--'}
            </span>
          </div>
        </div>

        {/* Valuation Display */}
        <div className="rounded-2xl glass p-5 mb-5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Appraised Valuation (ZK Output)</p>
            <p className="mt-1 font-display text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-foreground">
              {appraisalValuationUsd !== null ? currency(appraisalValuationUsd) : '--'}
            </p>
          </div>

          {vkCommitment && (
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-muted-foreground font-mono block">VK Commitment Hash</span>
              <span className="text-xs font-mono text-accent bg-black/40 px-2 py-1 rounded border border-white/10">
                {vkCommitment.slice(0, 8)}...{vkCommitment.slice(-6)}
              </span>
            </div>
          )}
        </div>

        {/* LTV Progress Visualizer */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Requested LTV Ratio</span>
            <span className={`font-semibold ${currentLtvNum <= maxLtvPct && currentLtvNum > 0 ? 'text-accent' : 'text-rose-400'}`}>
              {currentLtvNum.toFixed(1)}% / {maxLtvPct.toFixed(0)}% protocol cap
            </span>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-black/40 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                currentLtvNum <= maxLtvPct
                  ? 'bg-gradient-to-r from-indigo via-violet to-accent'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, barPct)}%` }}
            />
            <div
              className="absolute inset-y-0 w-0.5 bg-white/60"
              style={{ left: `${maxLtvPct}%` }}
              title="75% LTV Cap Limit"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            White indicator marks the hard protocol collateral limit for {tierConfig.name}.
          </p>
        </div>

        {/* Loan Request Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-secondary-foreground mb-1.5">
              Requested Loan Amount ($)
            </label>
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] px-3 focus-within:border-accent focus-within:bg-white/[0.04]">
              <span className="text-xs text-muted-foreground font-mono mr-1">$</span>
              <input
                type="number"
                min={0}
                value={requestedLoanUsd}
                onChange={(e) => onRequestedLoanChange(Math.max(0, parseFloat(e.target.value) || 0))}
                disabled={!appraisalValuationUsd || isSubmitting}
                className="w-full bg-transparent py-2.5 font-mono text-sm tabular-nums text-foreground outline-none disabled:opacity-50"
                placeholder="Loan amount"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-secondary-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo" />
                Secret PIN (Witness)
              </label>
              <span className="text-[10px] text-muted-foreground font-mono">Unlinkable PK</span>
            </div>
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] px-3 focus-within:border-accent focus-within:bg-white/[0.04]">
              <input
                type="number"
                min={1000}
                max={9999}
                value={secretPin || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onSecretPinChange(isNaN(val) ? 0 : Math.max(0, Math.min(9999, val)));
                }}
                disabled={isSubmitting}
                className="w-full bg-transparent py-2.5 font-mono text-sm tabular-nums text-foreground outline-none disabled:opacity-50"
                placeholder="4-digit PIN (e.g. 4321)"
              />
            </div>
          </div>
        </div>

        {/* Breakdown Rows */}
        <div className="space-y-px overflow-hidden rounded-2xl border border-white/10 mb-5">
          <BreakdownRow
            label="Max Eligible Collateral"
            value={appraisalValuationUsd !== null ? currency(maxEligibleLoan) : '--'}
          />
          <BreakdownRow
            label="Retained Equity"
            value={appraisalValuationUsd ? currency(Math.max(0, appraisalValuationUsd - requestedLoanUsd)) : '--'}
          />
          <BreakdownRow
            label="ZK Multiplicative Constraint"
            value={
              appraisalValuationUsd
                ? `y_val ≥ ${requestedLoanUsd.toLocaleString()} × ${scaleFactor}`
                : 'Awaiting Proof'
            }
            accent={isEligible}
          />
        </div>

        {/* Eligibility Banner */}
        {appraisalValuationUsd !== null && (
          <div
            className={`p-4 rounded-2xl border mb-5 transition-colors ${
              isEligible
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2 text-xs font-semibold">
              {isEligible ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>Collateral Constraint Satisfied for Midnight Disbursement</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Requested Loan Exceeds Tier LTV Limit (${maxEligibleLoan.toLocaleString()})</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={onSubmitLoanRequest}
          disabled={!isEligible || isSubmitting || workflowState === 'submitting_to_midnight'}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting || workflowState === 'submitting_to_midnight' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
              <span>Submitting Proof to Midnight Contract&hellip;</span>
            </>
          ) : (
            <>
              <FileCheck2 className="h-4 w-4" />
              <span>Submit Collateral Proof to Midnight</span>
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-400" />
          Verifies nullifiers on-chain with zero double-collateralization.
        </p>
      </div>
    </div>
  );
};

function BreakdownRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-white/[0.02] px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`font-mono text-xs tabular-nums ${
          accent ? 'text-accent font-semibold' : 'text-foreground'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
