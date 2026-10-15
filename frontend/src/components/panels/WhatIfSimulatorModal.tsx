import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, Zap, RefreshCw, AlertTriangle, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';

interface WhatIfSimulatorModalProps {
  onClose: () => void;
  onApplySimulation: (simData: any) => void;
  language: 'en' | 'ne';
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({
  onClose,
  onApplySimulation,
  language,
}) => {
  const [b4Restored, setB4Restored] = useState(false);
  const [b2Restored, setB2Restored] = useState(false);
  const [r5Failed, setR5Failed] = useState(false);
  const [floodExpansion, setFloodExpansion] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const restored: string[] = [];
      const disabled: string[] = [];

      if (b4Restored) restored.push('road_R7_ramche_chasm');
      if (b2Restored) restored.push('road_R3_bridge_betrawati');
      if (r5Failed) disabled.push('road_R5_ridge');

      const data = await api.runSimulation({
        scenario_name: 'Interactive Decision Scenario',
        restored_roads: restored,
        disabled_roads: disabled,
        flood_expansion_level: floodExpansion,
      });

      setSimResult(data);
      onApplySimulation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = async () => {
    setB4Restored(false);
    setB2Restored(false);
    setR5Failed(false);
    setFloodExpansion(0);
    setLoading(true);
    try {
      const data = await api.runSimulation({
        scenario_name: 'Baseline Reality',
        restored_roads: [],
        disabled_roads: [],
        flood_expansion_level: 0,
      });
      setSimResult(data);
      onApplySimulation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090e1a] border border-indigo-500/30 rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              {language === 'ne' ? 'उद्धार अनुकरण (WHAT-IF RESCUE SIMULATOR)' : 'WHAT-IF RESCUE SIMULATOR'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Scientific Disclaimer Alert */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              <strong>SCIENTIFIC INTEGRITY NOTICE:</strong> This is a deterministic graph simulation based on user-selected infrastructure interventions. It is not an observational satellite claim.
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="space-y-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Infrastructure Interventions:
            </h3>

            {/* Toggle 1: Bridge B4 Emergency Restoration */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Simulate Temporary Bailey Bridge at Ramche Gorge (Bridge B4)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono">RESTORATION</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Rapid deployment of military Bailey bridge over severed 92m span.
                </p>
              </div>
              <input
                type="checkbox"
                checked={b4Restored}
                onChange={(e) => setB4Restored(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>

            {/* Toggle 2: Bridge B2 Restoration */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Simulate Betrawati Confluence Bridge Repair (Bridge B2)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono">RESTORATION</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Clear approach embankment and restore 64m girder bridge access.
                </p>
              </div>
              <input
                type="checkbox"
                checked={b2Restored}
                onChange={(e) => setB2Restored(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>

            {/* Toggle 3: Mountain Ridge Road Failure */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Simulate Landslide Failure on Kalikasthan Ridge Road (R5)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 font-mono">FAILURE</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Simulate severe rainfall triggering mass wasting across the bypass ridge.
                </p>
              </div>
              <input
                type="checkbox"
                checked={r5Failed}
                onChange={(e) => setR5Failed(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
            </label>

            {/* Flood Surge Expansion Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Flood Inundation Expansion Level:</span>
                <span className="font-mono text-cyan-400">
                  {floodExpansion === 0 ? 'Baseline (0m)' : floodExpansion === 1 ? '+50m Flood Surge' : '+150m Catastrophic Surge'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={floodExpansion}
                onChange={(e) => setFloodExpansion(Number(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex gap-2">
            <button
              onClick={runSimulation}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'RECALCULATING NETWORK GRAPH...' : 'EXECUTE SIMULATION & RECALCULATE'}</span>
            </button>
            <button
              onClick={resetSimulation}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Dynamic Results Display */}
          {simResult && (
            <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                <span>SIMULATION IMPACT DELTA:</span>
                <span className="text-cyan-400 font-mono">{simResult.scenario_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Reconnected */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-3">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase">
                    Restored Settlements
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    +{simResult.impact_delta.reconnected_count}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 font-mono">
                    {simResult.impact_delta.reconnected_settlements.join(', ') || 'None'}
                  </div>
                  <div className="text-[10px] text-emerald-300 mt-1">
                    {simResult.impact_delta.reconnected_population.toLocaleString()} people reconnected
                  </div>
                </div>

                {/* Newly Cut Off */}
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3">
                  <div className="text-[11px] font-bold text-rose-400 uppercase">
                    Newly Isolated Settlements
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    +{simResult.impact_delta.newly_cut_off_count}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 font-mono">
                    {simResult.impact_delta.newly_cut_off_settlements.join(', ') || 'None'}
                  </div>
                  <div className="text-[10px] text-rose-300 mt-1">
                    {simResult.impact_delta.newly_cut_off_population.toLocaleString()} people cut off
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
