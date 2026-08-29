import React from 'react';

interface LoanCalculatorProps {
  appraisalValuationUsd: number | null;
  requestedLoanUsd: number;
  onRequestedLoanChange: (amount: number) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  appraisalValuationUsd,
  requestedLoanUsd,
  onRequestedLoanChange,
}) => {
  const maxLtvPct = 75;
  const maxEligibleLoan = appraisalValuationUsd ? (appraisalValuationUsd * maxLtvPct) / 100 : 0;
  const currentLtv = appraisalValuationUsd && appraisalValuationUsd > 0
    ? ((requestedLoanUsd / appraisalValuationUsd) * 100).toFixed(1)
    : '0.0';

  const isEligible = appraisalValuationUsd !== null && requestedLoanUsd <= maxEligibleLoan && requestedLoanUsd > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-white">
      <h2 className="text-xl font-bold tracking-wide mb-4 border-b border-slate-800 pb-3">
        Loan Collateral & LTV Eligibility
      </h2>

      <div className="space-y-4">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
          <span className="text-slate-400 text-sm">Verified Valuation (ZK Out)</span>
          <span className="text-2xl font-extrabold text-cyan-400">
            {appraisalValuationUsd !== null ? `$${appraisalValuationUsd.toLocaleString()}` : '--'}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Requested Loan Amount ($)</label>
          <input
            type="number"
            value={requestedLoanUsd}
            onChange={(e) => onRequestedLoanChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            placeholder="Enter desired loan amount"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="block text-xs text-slate-400">Current LTV Ratio</span>
            <span className={`text-lg font-bold ${parseFloat(currentLtv) <= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
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

        <div className={`p-4 rounded-lg border ${isEligible ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
          <div className="flex items-center space-x-2 font-semibold">
            <span>{isEligible ? '✓ Collateral Eligible for Disbursement' : '✕ Loan Limit Exceeded or Invalid'}</span>
          </div>
          <p className="text-xs mt-1 text-slate-400">
            {isEligible
              ? 'Your property valuation proof satisfies Midnight Protocol collateral risk requirements.'
              : 'Requested loan must not exceed 75% of your zero-knowledge verified appraisal value.'}
          </p>
        </div>
      </div>
    </div>
  );
};
