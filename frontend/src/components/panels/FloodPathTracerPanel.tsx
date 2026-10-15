import React from 'react';
import { FloodPathResult } from '../../types';
import { X, GitFork, ArrowDownRight, ShieldAlert, Mountain } from 'lucide-react';

interface FloodPathTracerPanelProps {
  floodPath: FloodPathResult | null;
  onClose: () => void;
  language: 'en' | 'ne';
}

export const FloodPathTracerPanel: React.FC<FloodPathTracerPanelProps> = ({
  floodPath,
  onClose,
  language,
}) => {
  if (!floodPath) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090e1a] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <GitFork className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              {language === 'ne' ? 'बाढी बहाव मार्ग विश्लेषण (FLOOD PATH SCENARIO)' : 'DOWNSTREAM FLOOD PATH SCENARIO (BONUS)'}
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
          <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-cyan-200">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>TERRAIN D8 DESCENT MODEL:</strong> Traces downstream steepest gravity descent using Copernicus DEM 30m gradient from upstream coordinate. Labeled as a terrain scenario, not a hydrodynamic guarantee.
            </p>
          </div>

          {/* Overview Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Corridor Length</span>
              <div className="text-lg font-black text-cyan-300 mt-1">{floodPath.total_flow_length_km} km</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Elevation Drop</span>
              <div className="text-lg font-black text-emerald-400 mt-1">{floodPath.elevation_drop_m} m</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Flow Vector</span>
              <div className="text-xs font-bold text-slate-200 mt-2">South / S-Bend</div>
            </div>
          </div>

          {/* Elevation Profile Visualization */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-cyan-400" />
                Downstream Elevation Profile (Distance vs Elevation)
              </span>
              <span className="text-[10px] font-mono text-slate-400">1,460m down to 610m</span>
            </div>

            {/* Profile Chart Bar Stack */}
            <div className="space-y-1.5 pt-1">
              {floodPath.elevation_profile.map((p, idx) => {
                const pct = Math.max(10, ((p.elevation_m - 550) / 950) * 100);
                return (
                  <div key={idx} className="flex items-center gap-2 text-[11px]">
                    <span className="w-36 text-slate-300 truncate font-medium text-left">{p.checkpoint}</span>
                    <div className="flex-1 bg-slate-950 rounded-full h-3.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-cyan-600 to-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="w-16 font-mono text-right text-cyan-300 font-bold">{p.elevation_m}m</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Impacted Settlements Along Path */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Downstream Corridor Settlements At Risk:
            </h3>
            <div className="space-y-1.5">
              {floodPath.impacted_settlements_along_path.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span className="font-bold text-white">{s.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      (Axis Distance: {s.distance_to_flow_axis_m}m)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                    {s.warning_level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
