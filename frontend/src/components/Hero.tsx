import React from 'react';
import { Sparkles, Gauge, ShieldCheck, EyeOff, ArrowDown } from 'lucide-react';

const stats = [
  {
    icon: Gauge,
    value: '98.6%',
    label: 'Model Accuracy',
    sub: 'Benchmarked against California Housing dataset',
    tint: 'from-indigo/20 to-transparent',
    iconColor: 'text-indigo',
  },
  {
    icon: ShieldCheck,
    value: '75%',
    label: 'LTV Cap',
    sub: 'Protocol-enforced collateral ceiling on Midnight',
    tint: 'from-violet/20 to-transparent',
    iconColor: 'text-violet',
  },
  {
    icon: EyeOff,
    value: 'Zero-Knowledge',
    label: 'Client Privacy',
    sub: 'Prove valuation without revealing the deed or address',
    tint: 'from-accent/20 to-transparent',
    iconColor: 'text-accent',
  },
];

export const Hero: React.FC = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 text-center sm:pt-16 sm:px-6">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs sm:text-sm text-secondary-foreground">
        <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
        <span>zk-Appraisal Engine v3 &bull; Midnight Compact Verified</span>
      </div>

      <h1 className="mx-auto mt-6 max-w-4xl text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
        Verifiable property value,{' '}
        <span className="text-gradient">without exposing a thing</span>
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm sm:text-base font-normal leading-relaxed text-muted-foreground">
        VeilCred turns private real estate attributes into trustless on-chain collateral.
        Synthesize client-side Halo2 ZKML proofs, unlock up to 75% LTV DeFi liquidity, and keep sensitive deed details off public ledgers.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
        <a
          href="#appraise"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo to-violet px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet/25 transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          <span>Start Appraisal & Proving</span>
          <ArrowDown className="h-4 w-4" />
        </a>

        <a
          href="#architecture-info"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full glass px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-white/10"
        >
          How It Works
        </a>
      </div>

      {/* Stats Cards */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-2xl glass p-5 sm:p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${s.tint} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] border border-white/10">
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </span>

              <p className="mt-4 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {s.value}
              </p>

              <p className="mt-1 text-sm font-semibold text-secondary-foreground">
                {s.label}
              </p>

              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
