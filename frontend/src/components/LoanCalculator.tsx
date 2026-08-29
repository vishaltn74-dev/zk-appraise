import React from 'react';

interface LoanCalculatorProps {
  appraisalValuationUsd: number | null;
  requestedLoanUsd: number;
  onRequestedLoanChange: (amount: number) => void;
  onSubmitLoanRequest: () => void;
  isSubmitting: boolean;
  vkCommitment?: string;
  scaleFactor?: number;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  appraisalValuationUsd,
  requestedLoanUsd,
  onRequestedLoanChange,
  onSubmitLoanRequest,
  isSubmitting,
  vkCommitment,
  scaleFactor = 8192,
}) => {
  const maxLtvPct = 75;
  const maxEligibleLoan = appraisalValuationUsd ? (appraisalValuationUsd * maxLtvPct) / 100 : 0;
  const currentLtv =
    appraisalValuationUsd && appraisalValuationUsd > 0
      ? ((requestedLoanUsd / appraisalValuationUsd) * 100).toFixed(1)
      : '0.0';

  const isEligible =
    appraisalValuationUsd !== null &&
    requestedLoanUsd <= maxEligibleLoan &&
    requestedLoanUsd > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-white">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold tracking-wide">Loan Collateral & LTV Eligibility</h2>
        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded font-mono">
          Max LTV: 75%
        </span>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-slate-400 text-xs block font-medium">Verified Valuation (ZK Out)</span>
            <span className="text-2xl font-extrabold text-cyan-400">
              {appraisalValuationUsd !== null ? `$${appraisalValuationUsd.toLocaleString()}` : '--'}
            </span>
          </div>
          {vkCommitment && (
            <div className="text-right">
              <span className="text-slate-500 text-[10px] block font-mono">VK Commitment</span>
              <span className="text-xs text-slate-300 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                {vkCommitment.slice(0, 10)}...{vkCommitment.slice(-6)}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Requested Loan Amount ($)</label>
          <input
            type="number"
            value={requestedLoanUsd}
            onChange={(e) => onRequestedLoanChange(parseFloat(e.target.value) || 0)}
            disabled={!appraisalValuationUsd || isSubmitting}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
            placeholder="Enter desired loan amount"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="block text-xs text-slate-400">Current LTV Ratio</span>
            <span
              className={`text-lg font-bold ${
                parseFloat(currentLtv) <= 75 && parseFloat(currentLtv) > 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {currentLtv}% / 75.0%
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="block text-xs text-slate-400">Max Credit Line</span>
            <span className="text-lg font-bold text-slate-200">
              ${maxEligibleLoan.toLocaleString()}
            </span>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border ${
            isEligible
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2 font-semibold text-sm">
            <span>{isEligible ? '✓ Collateral Eligible for Disbursement' : '✕ Loan Limit Exceeded or Invalid'}</span>
          </div>
          <p className="text-xs mt-1 text-slate-400">
            {isEligible
              ? `Multiplicative check: (y_val >= requested * ${scaleFactor}) satisfied on Midnight Compact.`
              : 'Requested loan must not exceed 75% of your zero-knowledge verified appraisal value.'}
          </p>
        </div>

        <button
          onClick={onSubmitLoanRequest}
          disabled={!isEligible || isSubmitting}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting to Midnight Contract...' : 'Submit Collateral Proof to Midnight'}
        </button>
      </div>
    </div>
  );
};
