'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Ruler,
  BedDouble,
  Bath,
  CalendarClock,
  MapPinned,
  Fingerprint,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Coins,
  Lock,
} from 'lucide-react'

type Risk = 'low' | 'moderate' | 'elevated' | 'high'

const riskConfig: Record<
  Risk,
  { label: string; multiplier: number; base: number }
> = {
  low: { label: 'Low', multiplier: 1, base: 520 },
  moderate: { label: 'Moderate', multiplier: 0.92, base: 430 },
  elevated: { label: 'Elevated', multiplier: 0.82, base: 350 },
  high: { label: 'High', multiplier: 0.7, base: 260 },
}

const LTV_CAP = 0.75

type Status = 'idle' | 'proving' | 'verified'

function currency(n: number) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export function AppraisalDashboard() {
  const [area, setArea] = useState(2200)
  const [bedrooms, setBedrooms] = useState(4)
  const [bathrooms, setBathrooms] = useState(3)
  const [age, setAge] = useState(12)
  const [risk, setRisk] = useState<Risk>('low')

  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [proofHash, setProofHash] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { appraised, maxCollateral } = useMemo(() => {
    const cfg = riskConfig[risk]
    const bedValue = bedrooms * 14000
    const bathValue = bathrooms * 9000
    const depreciation = Math.max(0, 1 - age * 0.006)

    const raw =
      (area * cfg.base + bedValue + bathValue) *
      cfg.multiplier *
      depreciation

    const appraised = Math.max(0, Math.round(raw))

    return {
      appraised,
      maxCollateral: Math.round(appraised * LTV_CAP),
    }
  }, [area, bedrooms, bathrooms, age, risk])

  useEffect(() => {
    setStatus('idle')
    setProgress(0)
    setProofHash(null)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }, [area, bedrooms, bathrooms, age, risk])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  function generateProof() {
    if (status === 'proving') return

    setStatus('proving')
    setProgress(0)
    setProofHash(null)

    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12 + 4

        if (next >= 100) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }

          const hex = Array.from({ length: 40 }, () =>
            Math.floor(Math.random() * 16).toString(16),
          ).join('')

          setProofHash(`0x${hex}`)
          setStatus('verified')

          return 100
        }

        return next
      })
    }, 220)
  }

  return (
    <section
      id="dashboard"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-24"
    >
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Property intake &rarr; collateral proof
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
          Enter property attributes. VeilCred appraises in real time and mints
          a zero-knowledge proof of your borrowing power.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-3xl glass-strong p-6 sm:p-8 lg:col-span-3">
          <div className="mb-6 flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-indigo" />

            <h3 className="font-display text-lg font-semibold">
              Property attributes
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              icon={Ruler}
              label="Area"
              suffix="sq ft"
              value={area}
              min={200}
              max={20000}
              step={50}
              onChange={setArea}
            />

            <Field
              icon={BedDouble}
              label="Bedrooms"
              value={bedrooms}
              min={0}
              max={12}
              step={1}
              onChange={setBedrooms}
            />

            <Field
              icon={Bath}
              label="Bathrooms"
              value={bathrooms}
              min={0}
              max={12}
              step={1}
              onChange={setBathrooms}
            />

            <Field
              icon={CalendarClock}
              label="Age"
              suffix="years"
              value={age}
              min={0}
              max={120}
              step={1}
              onChange={setAge}
            />

            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                <MapPinned className="h-4 w-4 text-muted-foreground" />
                Location Risk Rating
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(riskConfig) as Risk[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRisk(r)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                      risk === r
                        ? 'border-transparent bg-gradient-to-br from-indigo to-violet text-white shadow-lg shadow-violet/25'
                        : 'border-border bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
                    }`}
                  >
                    {riskConfig[r].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={generateProof}
            disabled={status === 'proving'}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo to-violet px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet/30 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'proving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating proof&hellip;
              </>
            ) : status === 'verified' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Regenerate appraisal proof
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Generate Appraisal Proof
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <Visualizer
            appraised={appraised}
            maxCollateral={maxCollateral}
            status={status}
            progress={progress}
            proofHash={proofHash}
          />
        </div>
      </div>
    </section>
  )
}

function Field({
  icon: Icon,
  label,
  suffix,
  value,
  min,
  max,
  step,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  suffix?: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </label>

      <div className="flex items-center rounded-xl border border-border bg-white/[0.03] px-3 focus-within:border-ring/60 focus-within:bg-white/[0.05]">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value)

            if (Number.isNaN(v)) return

            onChange(Math.min(max, Math.max(min, v)))
          }}
          className="w-full bg-transparent py-2.5 font-mono text-base tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        {suffix ? (
          <span className="ml-2 shrink-0 text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function Visualizer({
  appraised,
  maxCollateral,
  status,
  progress,
  proofHash,
}: {
  appraised: number
  maxCollateral: number
  status: Status
  progress: number
  proofHash: string | null
}) {
  const barPct = status === 'verified' ? 75 : (progress / 100) * 75

  const badge =
    status === 'verified'
      ? {
          text: 'Proof Verified',
          cls: 'bg-accent/15 text-accent border-accent/30',
          Icon: CheckCircle2,
        }
      : status === 'proving'
        ? {
            text: 'Proving zk-SNARK',
            cls: 'bg-violet/15 text-violet border-violet/30',
            Icon: Loader2,
          }
        : {
            text: 'Awaiting proof',
            cls: 'bg-white/5 text-muted-foreground border-border',
            Icon: Lock,
          }

  return (
    <div className="flex h-full flex-col rounded-3xl glass-strong p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-accent" />

          <h3 className="font-display text-lg font-semibold">
            LTV Collateral Breakdown
          </h3>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${badge.cls}`}
        >
          <badge.Icon
            className={`h-3.5 w-3.5 ${
              status === 'proving' ? 'animate-spin' : ''
            }`}
          />

          {badge.text}
        </span>
      </div>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">Appraised value</p>

        <p className="mt-1 font-display text-4xl font-bold tabular-nums tracking-tight">
          {currency(appraised)}
        </p>
      </div>

      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Collateral unlocked
          </span>

          <span className="font-mono tabular-nums text-foreground">
            {Math.round(barPct)}% / 75% cap
          </span>
        </div>

        <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo via-violet to-accent transition-[width] duration-300 ease-out"
            style={{ width: `${barPct}%` }}
          />

          <div
            className="absolute inset-y-0 w-px bg-white/40"
            style={{ left: '75%' }}
          />
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Protocol enforces a hard 75% loan-to-value ceiling.
        </p>
      </div>

      <div className="mt-6 space-y-px overflow-hidden rounded-2xl border border-border">
        <Row
          label="Max collateral (75% LTV)"
          value={currency(maxCollateral)}
        />

        <Row
          label="Retained equity (25%)"
          value={currency(appraised - maxCollateral)}
        />

        <Row
          label="Proof status"
          value={status === 'verified' ? 'On-chain verified' : 'Pending'}
          accent={status === 'verified'}
        />
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl border border-border bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Fingerprint className="h-3.5 w-3.5" />
            zk-Proof commitment
          </div>

          <p className="mt-2 break-all font-mono text-xs leading-relaxed text-secondary-foreground">
            {proofHash ??
              'Generate a proof to produce a verifiable commitment'}
          </p>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between bg-white/[0.02] px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span
        className={`font-mono text-sm tabular-nums ${
          accent ? 'text-accent' : 'text-foreground'
        }`}
      >
        {value}
      </span>
    </div>
  )
}