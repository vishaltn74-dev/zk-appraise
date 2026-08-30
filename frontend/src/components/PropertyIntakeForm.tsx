import React, { useState } from 'react';
import {
  Ruler,
  BedDouble,
  Bath,
  CalendarClock,
  MapPinned,
  Fingerprint,
  Loader2,
  ShieldCheck,
  Cpu,
  Lock,
} from 'lucide-react';
import { PropertyInputs, ProverProgress } from '../workers/prover.worker';

interface PropertyIntakeFormProps {
  onSubmit: (inputs: PropertyInputs) => void;
  isLoading: boolean;
  progress?: ProverProgress | null;
}

export const PropertyIntakeForm: React.FC<PropertyIntakeFormProps> = ({
  onSubmit,
  isLoading,
  progress,
}) => {
  const [activeTab, setActiveTab] = useState<'property_specs' | 'california_model'>('property_specs');

  // California Housing Model Direct Contract Attributes (allows empty string while typing)
  const [modelData, setModelData] = useState<{
    medInc: number | string;
    houseAge: number | string;
    aveRooms: number | string;
    aveOccup: number | string;
  }>({
    medInc: 3.5,     // in $10k units ($35,000)
    houseAge: 15,    // years
    aveRooms: 5.8,   // average rooms
    aveOccup: 2.8,   // average occupancy
  });

  // Intuitive Property Specs (allows empty string while typing)
  const [specsData, setSpecsData] = useState<{
    sqft: number | string;
    bedrooms: number | string;
    bathrooms: number | string;
    age: number | string;
    locationRisk: number;
  }>({
    sqft: 2200,
    bedrooms: 4,
    bathrooms: 3,
    age: 15,
    locationRisk: 20,
  });

  // Synchronize from Model to Specs
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setModelData((prev) => ({ ...prev, [name]: value }));

    if (value === '') return;
    const val = parseFloat(value);
    if (isNaN(val)) return;

    // Sync specs
    if (name === 'houseAge') {
      setSpecsData((prev) => ({ ...prev, age: Math.round(val) }));
    } else if (name === 'aveRooms') {
      const approxBedrooms = Math.max(1, Math.round(val * 0.6));
      setSpecsData((prev) => ({
        ...prev,
        bedrooms: approxBedrooms,
        bathrooms: Math.max(1, Math.round(val * 0.35)),
        sqft: Math.round(val * 420),
      }));
    } else if (name === 'medInc') {
      // Approximate sqft if income was adjusted
      setSpecsData((prev) => ({
        ...prev,
        sqft: Math.max(500, Math.min(10000, Math.round(((val - 2.0) / 0.8) * 1000))),
      }));
    }
  };

  // Synchronize from Specs to Model
  const handleSpecsChange = (name: string, value: string) => {
    setSpecsData((prev) => ({ ...prev, [name]: value }));

    if (value === '') return;
    const val = parseFloat(value);
    if (isNaN(val)) return;

    // Sync model
    if (name === 'age') {
      setModelData((prev) => ({ ...prev, houseAge: val }));
    } else if (name === 'sqft' || name === 'bedrooms' || name === 'bathrooms') {
      const sqftVal = name === 'sqft' ? val : (Number(specsData.sqft) || 2200);
      const bedVal = name === 'bedrooms' ? val : (Number(specsData.bedrooms) || 4);
      const bathVal = name === 'bathrooms' ? val : (Number(specsData.bathrooms) || 3);
      const calculatedRooms = Number((bedVal + bathVal + (sqftVal / 500)).toFixed(2));
      const calculatedIncome = Number((2.0 + (sqftVal / 1000) * 0.8).toFixed(2));
      const calculatedOccup = Number((Math.max(1.0, bedVal * 0.7 + 0.3)).toFixed(1));
      setModelData((prev) => ({
        ...prev,
        aveRooms: calculatedRooms,
        medInc: calculatedIncome,
        aveOccup: calculatedOccup,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Fallbacks for empty inputs
    const safeSqft = specsData.sqft === '' ? 2200 : Number(specsData.sqft);
    const safeBedrooms = specsData.bedrooms === '' ? 4 : Number(specsData.bedrooms);
    const safeBathrooms = specsData.bathrooms === '' ? 3 : Number(specsData.bathrooms);
    const safeAge = specsData.age === '' ? 15 : Number(specsData.age);

    const safeMedInc = modelData.medInc === '' ? 3.5 : Number(modelData.medInc);
    const safeHouseAge = modelData.houseAge === '' ? 15 : Number(modelData.houseAge);
    const safeAveRooms = modelData.aveRooms === '' ? 5.8 : Number(modelData.aveRooms);
    const safeAveOccup = modelData.aveOccup === '' ? 2.8 : Number(modelData.aveOccup);

    if (activeTab === 'california_model') {
      onSubmit({
        medInc: safeMedInc,
        houseAge: safeHouseAge,
        aveRooms: safeAveRooms,
        aveOccup: safeAveOccup,
        sqft: safeSqft,
        bedrooms: safeBedrooms,
        bathrooms: safeBathrooms,
        age: safeAge,
        locationRisk: specsData.locationRisk,
      });
    } else {
      onSubmit({
        sqft: safeSqft,
        bedrooms: safeBedrooms,
        bathrooms: safeBathrooms,
        age: safeAge,
        locationRisk: specsData.locationRisk,
        medInc: safeMedInc,
        houseAge: safeHouseAge,
        aveRooms: safeAveRooms,
        aveOccup: safeAveOccup,
      });
    }
  };

  return (
    <div className="rounded-3xl glass-strong p-6 sm:p-8 shadow-2xl border border-white/10 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo/15 text-indigo border border-indigo/25">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Property Intake & Features
              </h2>
              <p className="text-xs text-muted-foreground">
                Evaluated privately inside client Web Worker
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
            <Lock className="w-3 h-3" />
            Private Witness
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-black/40 p-1 mb-6 border border-white/10 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('property_specs')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all font-semibold ${
              activeTab === 'property_specs'
                ? 'bg-gradient-to-r from-indigo to-violet text-white shadow-md shadow-violet/25'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Property Specifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('california_model')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all font-semibold ${
              activeTab === 'california_model'
                ? 'bg-gradient-to-r from-indigo to-violet text-white shadow-md shadow-violet/25'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            AI Linear Regression Model
          </button>
        </div>

        <form id="property-form" onSubmit={handleSubmit} className="space-y-5">
          {activeTab === 'property_specs' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                icon={Ruler}
                label="Area (Square Footage)"
                suffix="sq ft"
                value={specsData.sqft}
                placeholder="e.g. 2200"
                min={0}
                step={50}
                onChange={(v) => handleSpecsChange('sqft', v)}
                disabled={isLoading}
              />

              <Field
                icon={BedDouble}
                label="Bedrooms"
                value={specsData.bedrooms}
                placeholder="e.g. 4"
                min={0}
                step={1}
                onChange={(v) => handleSpecsChange('bedrooms', v)}
                disabled={isLoading}
              />

              <Field
                icon={Bath}
                label="Bathrooms"
                value={specsData.bathrooms}
                placeholder="e.g. 3"
                min={0}
                step={0.5}
                onChange={(v) => handleSpecsChange('bathrooms', v)}
                disabled={isLoading}
              />

              <Field
                icon={CalendarClock}
                label="Property Age"
                suffix="years"
                value={specsData.age}
                placeholder="e.g. 15"
                min={0}
                step={1}
                onChange={(v) => handleSpecsChange('age', v)}
                disabled={isLoading}
              />

              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-secondary-foreground">
                    <MapPinned className="h-3.5 w-3.5 text-muted-foreground" />
                    Location Risk Score
                  </label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {specsData.locationRisk <= 25 ? 'Low Risk (0-25)' : specsData.locationRisk <= 50 ? 'Moderate (26-50)' : 'Elevated (51+)'}
                  </span>
                </div>
                <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] px-3 focus-within:border-accent focus-within:bg-white/[0.04]">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={specsData.locationRisk}
                    onChange={(e) => handleSpecsChange('locationRisk', e.target.value)}
                    disabled={isLoading}
                    className="w-full accent-indigo cursor-pointer py-3"
                  />
                  <span className="ml-3 font-mono text-sm text-foreground w-8 text-right">
                    {specsData.locationRisk}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-secondary-foreground">
                    Median Area Income (<span className="text-indigo font-mono">MedInc</span>)
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {modelData.medInc !== '' && !isNaN(Number(modelData.medInc))
                      ? `$${(Number(modelData.medInc) * 10000).toLocaleString()}/yr`
                      : '--'}
                  </span>
                </div>
                <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] px-3 focus-within:border-accent focus-within:bg-white/[0.04]">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="medInc"
                    value={modelData.medInc}
                    onChange={handleModelChange}
                    placeholder="e.g. 3.5"
                    disabled={isLoading}
                    className="w-full bg-transparent py-2.5 font-mono text-sm tabular-nums text-foreground outline-none"
                  />
                  <span className="text-xs text-muted-foreground font-mono shrink-0">$10k units</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-foreground mb-1.5">
                    House Age (<span className="text-indigo font-mono">Age</span>)
                  </label>
                  <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] px-3">
                    <input
                      type="number"
                      min="0"
                      name="houseAge"
                      value={modelData.houseAge}
                      onChange={handleModelChange}
                      placeholder="e.g. 15"
                      disabled={isLoading}
                      className="w-full bg-transparent py-2.5 font-mono text-xs tabular-nums text-foreground outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-foreground mb-1.5">
                    Avg Rooms (<span className="text-indigo font-mono">Rooms</span>)
                  </label>
                  <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] px-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      name="aveRooms"
                      value={modelData.aveRooms}
                      onChange={handleModelChange}
                      placeholder="e.g. 5.8"
                      disabled={isLoading}
                      className="w-full bg-transparent py-2.5 font-mono text-xs tabular-nums text-foreground outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-foreground mb-1.5">
                    Occupancy (<span className="text-indigo font-mono">Occup</span>)
                  </label>
                  <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] px-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      name="aveOccup"
                      value={modelData.aveOccup}
                      onChange={handleModelChange}
                      placeholder="e.g. 2.8"
                      disabled={isLoading}
                      className="w-full bg-transparent py-2.5 font-mono text-xs tabular-nums text-foreground outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Prover Worker Streaming Progress Bar */}
          {isLoading && progress && (
            <div className="mt-5 rounded-2xl border border-indigo/30 bg-indigo/10 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-indigo">
                <span className="flex items-center gap-2 truncate">
                  <Cpu className="w-3.5 h-3.5 animate-spin text-accent" />
                  {progress.message}
                </span>
                <span className="font-bold text-accent">{progress.progressPct}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-indigo via-violet to-accent h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.progressPct}%` }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Stage: <span className="text-secondary-foreground font-mono">{progress.stage}</span></span>
                <span>Prover: <span className="text-accent font-mono">Active (Halo2/Wasm)</span></span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo to-violet px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span>Synthesizing Halo2 ZK Proof&hellip;</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Synthesize ZK Proof & Appraise</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
        <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-indigo" />
          Zero raw features or property coordinates are sent across the network.
        </p>
      </div>
    </div>
  );
};

function Field({
  icon: Icon,
  label,
  suffix,
  value,
  min,
  max,
  step,
  placeholder,
  onChange,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  suffix?: string;
  value: number | string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-secondary-foreground">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </label>

      <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] px-3 focus-within:border-accent focus-within:bg-white/[0.04]">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          className="w-full bg-transparent py-2.5 font-mono text-sm tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-50"
        />

        {suffix ? (
          <span className="ml-2 shrink-0 text-xs font-mono text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
