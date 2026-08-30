import { Sparkles, Gauge, ShieldCheck, EyeOff } from 'lucide-react'

const stats = [
  {
    icon: Gauge,
    value: '98.6%',
    label: 'Model Accuracy',
    sub: 'Benchmarked against 2.4M verified sales',
    tint: 'from-indigo/20 to-transparent',
    iconColor: 'text-indigo',
  },
  {
    icon: ShieldCheck,
    value: '75%',
    label: 'LTV Cap',
    sub: 'Protocol-enforced collateral ceiling',
    tint: 'from-violet/20 to-transparent',
    iconColor: 'text-violet',
  },
  {
    icon: EyeOff,
    value: 'Zero-Knowledge',
    label: 'Privacy',
    sub: 'Prove value without revealing the deed',
    tint: 'from-accent/20 to-transparent',
    iconColor: 'text-accent',
  },
]

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-14 pb-6 text-center sm:pt-20">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm text-secondary-foreground">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        <span>zk-Appraisal Engine v3 is live</span>
      </div>

      <h1 className="mx-auto mt-7 max-w-4xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
        Verifiable property value,{' '}
        <span className="text-gradient">without exposing a thing</span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-pretty text-base font-medium leading-relaxed text-slate-200 sm:text-lg">
        VeilCred turns real estate into trustless on-chain collateral. Generate
        a cryptographic appraisal proof, unlock instant LTV liquidity, and keep
        every private detail off-chain.
      </p>

      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="#dashboard"
          className="w-full rounded-full bg-gradient-to-r from-indigo to-violet px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet/25 transition-transform hover:scale-[1.03] sm:w-auto"
        >
          Generate an appraisal proof
        </a>

        <a
          href="#"
          className="w-full rounded-full glass px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-white/5 sm:w-auto"
        >
          Read the whitepaper
        </a>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-2xl glass p-6 text-left transition-transform hover:-translate-y-1"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${s.tint} opacity-0 transition-opacity group-hover:opacity-100`}
            />

            <div className="relative">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5">
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </span>

              <p className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {s.value}
              </p>

              <p className="mt-1 text-sm font-medium text-foreground">
                {s.label}
              </p>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-200">
                {s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}