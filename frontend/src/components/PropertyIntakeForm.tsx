import React, { useState } from 'react';

export interface PropertyInputs {
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  age: number;
  locationRisk: number;
}

interface PropertyIntakeFormProps {
  onSubmit: (inputs: PropertyInputs) => void;
  isLoading: boolean;
}

export const PropertyIntakeForm: React.FC<PropertyIntakeFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PropertyInputs>({
    sqft: 2500,
    bedrooms: 3,
    bathrooms: 2.5,
    age: 15,
    locationRisk: 25,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-white">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
        <h2 className="text-xl font-bold tracking-wide">Private Property Intake Form</h2>
        <span className="ml-auto text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full font-mono">
          Zero Telemetry Active
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Square Footage (sq ft)</label>
          <input
            type="number"
            name="sqft"
            min="300"
            max="15000"
            value={formData.sqft}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              min="1"
              max="10"
              value={formData.bedrooms}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Bathrooms</label>
            <input
              type="number"
              step="0.5"
              name="bathrooms"
              min="1"
              max="8"
              value={formData.bathrooms}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Property Age (years)</label>
            <input
              type="number"
              name="age"
              min="0"
              max="120"
              value={formData.age}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Location Risk Rating (1-100)</label>
            <input
              type="number"
              name="locationRisk"
              min="1"
              max="100"
              value={formData.locationRisk}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50"
        >
          {isLoading ? 'Synthesizing Local ZK Proof...' : 'Synthesize Local ZK Valuation Proof'}
        </button>
      </form>
    </div>
  );
};
