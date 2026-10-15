import React from 'react';
import { Waves, AlertTriangle, GitFork, Users, Eye, Zap, Compass, MessageSquareCode } from 'lucide-react';
import { DamageSummary, ConnectivityResult, SegmentationLayers } from '../../types';

interface TelemetryHUDProps {
  damage: DamageSummary | null;
  connectivity: ConnectivityResult | null;
  segmentation: SegmentationLayers | null;
  activeFilter: 'ALL' | 'FLOOD' | 'DAMAGE' | 'CUT_OFF';
  setActiveFilter: (filter: 'ALL' | 'FLOOD' | 'DAMAGE' | 'CUT_OFF') => void;
  onOpenSimulation: () => void;
  onOpenRoutePlanner: () => void;
  onOpenFloodTracer: () => void;
  onToggleCopilot: () => void;
  language: 'en' | 'ne';
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  damage,
  connectivity,
  segmentation,
  activeFilter,
  setActiveFilter,
  onOpenSimulation,
  onOpenRoutePlanner,
  onOpenFloodTracer,
  onToggleCopilot,
  language,
}) => {
  const floodArea = segmentation?.metrics.total_affected_area_sq_km || 22.27;
  const waterArea = segmentation?.metrics.flood_water_area_sq_km || 14.85;
  const debrisArea = segmentation?.metrics.debris_silt_area_sq_km || 7.42;

  const damagedRoads = damage?.summary.damaged_roads_count || 5;
  const totalRoads = damage?.summary.total_roads_analyzed || 11;

  const damagedBridges = damage?.summary.damaged_bridges_count || 3;
  const totalBridges = damage?.summary.total_bridges_analyzed || 5;

  const cutOffCount = connectivity?.summary.cut_off_settlements_count || 6;
  const totalSettlements = connectivity?.summary.total_settlements || 8;
  const isolatedPop = connectivity?.summary.isolated_population_est || 14690;

  return (
    <div className="w-full bg-[#090e1a]/85 border-b border-slate-800/80 px-4 py-3 backdrop-blur-sm z-20">
      {/* Hero Motto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
            {language === 'ne' ? 'स्थिति अवलोकन' : 'SITUATION OVERVIEW'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-300 font-medium">
            {language === 'ne'
              ? 'बाढी हेर्नुहोस्। क्षति बुझ्नुहोस्। सम्पर्कविहीन पहिचान गर्नुहोस्। उद्धार अनुकरण गर्नुहोस्।'
              : 'SEE THE FLOOD. UNDERSTAND THE DAMAGE. FIND THE ISOLATED. SIMULATE THE RESCUE.'}
          </span>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveFilter(activeFilter === 'FLOOD' ? 'ALL' : 'FLOOD')}
            className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 transition-all ${
              activeFilter === 'FLOOD'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'ne' ? 'बाढी देखाउनुहोस्' : 'SHOW FLOOD'}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'DAMAGE' ? 'ALL' : 'DAMAGE')}
            className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 transition-all ${
              activeFilter === 'DAMAGE'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ne' ? 'क्षति देखाउनुहोस्' : 'SHOW DAMAGE'}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'CUT_OFF' ? 'ALL' : 'CUT_OFF')}
            className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 transition-all ${
              activeFilter === 'CUT_OFF'
                ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === 'ne' ? 'सम्पर्कविहीन देखाउनुहोस्' : 'SHOW CUT-OFF'}</span>
          </button>

          <span className="text-slate-700 mx-1">|</span>

          <button
            onClick={onOpenRoutePlanner}
            className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 font-medium flex items-center gap-1 transition-all shadow-[0_0_8px_rgba(16,185,129,0.2)]"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ne' ? 'उद्धार मार्ग' : 'FIND ROUTE'}</span>
          </button>

          <button
            onClick={onOpenSimulation}
            className="px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 font-medium flex items-center gap-1 transition-all shadow-[0_0_8px_rgba(99,102,241,0.2)]"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'ne' ? 'अनुकरण (What-If)' : 'SIMULATE'}</span>
          </button>

          <button
            onClick={onOpenFloodTracer}
            className="px-2.5 py-1 rounded-md bg-sky-950/60 border border-sky-500/40 text-sky-300 hover:bg-sky-900/60 font-medium flex items-center gap-1 transition-all"
          >
            <GitFork className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'ne' ? 'बाढी बहाव' : 'FLOOD PATH'}</span>
          </button>

          <button
            onClick={onToggleCopilot}
            className="px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 font-medium flex items-center gap-1 transition-all"
          >
            <MessageSquareCode className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'ne' ? 'एआई कोपाइलट' : 'AI COPILOT'}</span>
          </button>
        </div>
      </div>

      {/* 4 Core Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Flood Area */}
        <div
          onClick={() => setActiveFilter('FLOOD')}
          className={`cursor-pointer rounded-xl p-3 border transition-all ${
            activeFilter === 'FLOOD'
              ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold tracking-wider text-[11px] uppercase">
              {language === 'ne' ? 'बाढी प्रभावित क्षेत्र' : 'FLOOD EXTENT'}
            </span>
            <Waves className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white tracking-tight">{floodArea}</span>
            <span className="text-xs font-mono text-cyan-300 font-semibold">km²</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between font-mono">
            <span>Water: <strong className="text-cyan-300">{waterArea}</strong></span>
            <span>Debris: <strong className="text-amber-300">{debrisArea}</strong></span>
          </div>
        </div>

        {/* Card 2: Damaged Roads */}
        <div
          onClick={() => setActiveFilter('DAMAGE')}
          className={`cursor-pointer rounded-xl p-3 border transition-all ${
            activeFilter === 'DAMAGE'
              ? 'bg-amber-950/70 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold tracking-wider text-[11px] uppercase">
              {language === 'ne' ? 'क्षतिग्रस्त सडक खण्ड' : 'DAMAGED ROADS'}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white tracking-tight">{damagedRoads}</span>
            <span className="text-xs font-mono text-slate-400">/ {totalRoads} segments</span>
          </div>
          <div className="text-[11px] text-amber-300 mt-1 font-mono font-medium">
            {language === 'ne' ? '४५.५% सडक सञ्जाल अवरुद्ध' : '45.5% road network severed'}
          </div>
        </div>

        {/* Card 3: Damaged Bridges */}
        <div
          onClick={() => setActiveFilter('DAMAGE')}
          className={`cursor-pointer rounded-xl p-3 border transition-all ${
            activeFilter === 'DAMAGE'
              ? 'bg-orange-950/70 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold tracking-wider text-[11px] uppercase">
              {language === 'ne' ? 'क्षतिग्रस्त पुलहरू' : 'DAMAGED BRIDGES'}
            </span>
            <GitFork className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-400 tracking-tight">{damagedBridges}</span>
            <span className="text-xs font-mono text-slate-400">/ {totalBridges} bridges</span>
          </div>
          <div className="text-[11px] text-rose-300 mt-1 font-mono font-medium">
            {language === 'ne' ? '३ वटा मुख्य खोंच पुल विच्छेद' : 'B2, B4, B5 gorge spans down'}
          </div>
        </div>

        {/* Card 4: Cut-Off Settlements */}
        <div
          onClick={() => setActiveFilter('CUT_OFF')}
          className={`cursor-pointer rounded-xl p-3 border transition-all ${
            activeFilter === 'CUT_OFF'
              ? 'bg-rose-950/70 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold tracking-wider text-[11px] uppercase">
              {language === 'ne' ? 'सम्पर्कविहीन बस्तीहरू' : 'CUT-OFF SETTLEMENTS'}
            </span>
            <Users className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-400 tracking-tight">{cutOffCount}</span>
            <span className="text-xs font-mono text-slate-400">/ {totalSettlements} communities</span>
          </div>
          <div className="text-[11px] text-rose-300 mt-1 font-mono font-bold">
            {isolatedPop.toLocaleString()} {language === 'ne' ? 'नागरिक विच्छेद' : 'residents isolated'}
          </div>
        </div>
      </div>
    </div>
  );
};
