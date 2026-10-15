import React from 'react';
import { SensorStatus } from '../../types';
import { Satellite, ShieldAlert, FileText, Play, Activity } from 'lucide-react';

interface HeaderBarProps {
  sensors: SensorStatus | null;
  onOpenReport: () => void;
  onOpenValidation: () => void;
  onStartDemoTour: () => void;
  language: 'en' | 'ne';
  onSwitchToStyleTile?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  sensors,
  onOpenReport,
  onOpenValidation,
  onStartDemoTour,
  language,
  onSwitchToStyleTile,
}) => {
  return (
    <header className="h-12 bg-[#090e17] border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Left: Mission Operational Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-white">
            AUGUST 2026 TRISHULI DISASTER
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            RASUWA & NUWAKOT, NEPAL
          </span>
        </div>

        {/* Sensor Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> S1 SAR Active
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> S2 Cloud-Fused
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> DEM 30m
          </span>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2">
        {onSwitchToStyleTile && (
          <button
            onClick={onSwitchToStyleTile}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#3de0c5]/20 hover:bg-[#3de0c5]/30 text-[#3de0c5] border border-[#3de0c5]/50 font-mono text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>◈ Phase 1 Style Tile</span>
          </button>
        )}

        <button
          onClick={onStartDemoTour}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>3-Min Presentation Tour</span>
        </button>

        <button
          onClick={onOpenValidation}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          title="Copernicus EMSR927 Air-Gapped Validation Benchmark"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">EMSR927 Audit</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          title="One-Page Situation Report"
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">SITREP</span>
        </button>
      </div>
    </header>
  );
};
