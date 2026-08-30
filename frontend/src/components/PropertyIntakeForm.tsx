import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'california_model' | 'property_specs'>('california_model');

  // California Housing Model Direct Contract Attributes
  const [modelData, setModelData] = useState({
    medInc: 3.5,     // in $10k units ($35,000)
    houseAge: 20,    // years
    aveRooms: 5.5,   // average rooms
    aveOccup: 3.0,   // average occupancy
  });

  // Intuitive Property Specs
  const [specsData, setSpecsData] = useState({
    sqft: 2200,
    bedrooms: 3,
    bathrooms: 2,
    age: 20,
    locationRisk: 25,
  });

  // Synchronize from Model to Specs
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = parseFloat(value) || 0;
    const nextModel = { ...modelData, [name]: val };
    setModelData(nextModel);

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
    }
  };

  // Synchronize from Specs to Model
  const handleSpecsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = parseFloat(value) || 0;
    const nextSpecs = { ...specsData, [name]: val };
    setSpecsData(nextSpecs);

    // Sync model
    if (name === 'age') {
      setModelData((prev) => ({ ...prev, houseAge: val }));
    } else if (name === 'sqft' || name === 'bedrooms' || name === 'bathrooms') {
      const calculatedRooms = Number((nextSpecs.bedrooms + nextSpecs.bathrooms + (nextSpecs.sqft / 500)).toFixed(2));
      const calculatedIncome = Number((2.0 + (nextSpecs.sqft / 1000) * 0.8).toFixed(2));
      setModelData((prev) => ({
        ...prev,
        aveRooms: calculatedRooms,
        medInc: calculatedIncome,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'california_model') {
      onSubmit({
        medInc: modelData.medInc,
        houseAge: modelData.houseAge,
        aveRooms: modelData.aveRooms,
        aveOccup: modelData.aveOccup,
        sqft: specsData.sqft,
        bedrooms: specsData.bedrooms,
        bathrooms: specsData.bathrooms,
        age: specsData.age,
        locationRisk: specsData.locationRisk,
      });
    } else {
      onSubmit({
        sqft: specsData.sqft,
        bedrooms: specsData.bedrooms,
        bathrooms: specsData.bathrooms,
        age: specsData.age,
        locationRisk: specsData.locationRisk,
        medInc: modelData.medInc,
        houseAge: modelData.houseAge,
        aveRooms: modelData.aveRooms,
        aveOccup: modelData.aveOccup,
      });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-white">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          <h2 className="text-xl font-bold tracking-wide">Property Intake & Valuation</h2>
        </div>
        <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full font-mono">
          Zero-Knowledge Active
        </span>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-lg bg-slate-950 p-1 mb-5 border border-slate-800 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('california_model')}
          className={`flex-1 py-2 rounded-md transition-all ${
            activeTab === 'california_model'
              ? 'bg-cyan-600 text-white font-semibold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Model Contract Attributes (California AI)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('property_specs')}
          className={`flex-1 py-2 rounded-md transition-all ${
            activeTab === 'property_specs'
              ? 'bg-cyan-600 text-white font-semibold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Detailed Property Specs
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'california_model' ? (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-300">
                  Median Neighborhood Income (<span className="text-cyan-400 font-mono">MedInc</span>)
                </label>
                <span className="text-xs text-slate-500 font-mono">${(modelData.medInc * 10000).toLocaleString()}/yr</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="15.0"
                name="medInc"
                value={modelData.medInc}
                onChange={handleModelChange}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    House Age (<span className="text-cyan-400 font-mono">HouseAge</span>)
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  max="120"
                  name="houseAge"
                  value={modelData.houseAge}
                  onChange={handleModelChange}
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50 text-sm"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Avg Rooms (<span className="text-cyan-400 font-mono">AveRooms</span>)
                  </label>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="20"
                  name="aveRooms"
                  value={modelData.aveRooms}
                  onChange={handleModelChange}
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50 text-sm"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Occupancy (<span className="text-cyan-400 font-mono">AveOccup</span>)
                  </label>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  name="aveOccup"
                  value={modelData.aveOccup}
                  onChange={handleModelChange}
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50 text-sm"
                  required
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-300">Square Footage (sq ft)</label>
                <span className="text-xs text-slate-500 font-mono">300 - 15,000</span>
              </div>
              <input
                type="number"
                name="sqft"
                min="300"
                max="15000"
                value={specsData.sqft}
                onChange={handleSpecsChange}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-300">Bedrooms</label>
                  <span className="text-xs text-slate-500 font-mono">1 - 10</span>
                </div>
                <input
                  type="number"
                  name="bedrooms"
                  min="1"
                  max="10"
                  value={specsData.bedrooms}
                  onChange={handleSpecsChange}
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-300">Bathrooms</label>
                  <span className="text-xs text-slate-500 font-mono">1 - 8</span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  name="bathrooms"
                  min="1"
                  max="8"
                  value={specsData.bathrooms}
                  onChange={handleSpecsChange}
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-300">Property Age (years)</label>
                  <span className="text-xs text-slate-500 font-mono">0 - 120</span>
                </div>
                <input
                  type="number"
                  name="age"
                  min="0"
                  max="120"
                  value={specsData.age}
                  onChange={handleSpecsChange}
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-300">Location Risk (1-100)</label>
                  <span className="text-xs text-slate-500 font-mono">1 - 100</span>
                </div>
                <input
                  type="number"
                  name="locationRisk"
                  min="1"
                  max="100"
                  value={specsData.locationRisk}
                  onChange={handleSpecsChange}
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Real-time Prover Worker Streaming Progress Bar */}
        {isLoading && progress && (
          <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-cyan-900/50 space-y-2">
            <div className="flex justify-between text-xs font-mono text-cyan-400">
              <span className="truncate">{progress.message}</span>
              <span className="font-bold">{progress.progressPct}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress.progressPct}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Stage: <span className="text-slate-200">{progress.stage}</span></span>
              <span>Worker: <span className="text-emerald-400">Active (Halo2/Wasm)</span></span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Synthesizing ZK Valuation Proof...' : 'Synthesize ZK Proof & Appraise'}
        </button>
      </form>
    </div>
  );
};
