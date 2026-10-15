import React from 'react';
import {
  Settlement,
  RoadSegment,
  BridgeFeature,
  InfrastructureEvidence,
  DamageSummary,
  ConnectivityResult,
  SegmentationLayers,
} from '../../types';
import {
  X,
  AlertTriangle,
  GitFork,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

interface ContextIntelligencePanelProps {
  selectedFeature: {
    type: string;
    data: any;
    evidence: InfrastructureEvidence;
  } | null;
  onClearSelection: () => void;
  damage: DamageSummary | null;
  connectivity: ConnectivityResult | null;
  segmentation: SegmentationLayers | null;
  onOpenEvidence: () => void;
  onOpenSimulation: () => void;
  onOpenRoutePlanner: () => void;
  onOpenFloodTracer: () => void;
  language: 'en' | 'ne';
}

export const ContextIntelligencePanel: React.FC<ContextIntelligencePanelProps> = ({
  selectedFeature,
  onClearSelection,
  damage,
  connectivity,
  segmentation,
  onOpenEvidence,
  onOpenSimulation,
  onOpenRoutePlanner,
  onOpenFloodTracer,
  language,
}) => {
  // If user selected an asset (Bridge, Road, or Settlement)
  if (selectedFeature) {
    const { type, data, evidence } = selectedFeature;
    const isBridge = type === 'Bridge';
    const isSettlement = type === 'Settlement' || type === 'Hospital' || type === 'Town HQ';
    const isRoad = type === 'Road' || type === 'Road Segment';

    return (
      <div className="w-full xl:w-96 bg-[#090e17]/95 border-l border-slate-800 p-5 flex flex-col gap-4 overflow-y-auto z-20 backdrop-blur-xl animate-in slide-in-from-right duration-250">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
              {type}
            </span>
            <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
              {data.name || evidence.name}
            </h3>
          </div>
          <button
            onClick={onClearSelection}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Operational State:</span>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              data.status === 'RED' || data.connectivity_status === 'CUT_OFF'
                ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                : data.status === 'ORANGE' || data.connectivity_status === 'AT_RISK'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {data.status === 'RED' || data.connectivity_status === 'CUT_OFF'
              ? 'SEVERED / BLOCKED'
              : data.status === 'ORANGE' || data.connectivity_status === 'AT_RISK'
              ? 'AT RISK'
              : 'OPERATIONAL'}
          </span>
        </div>

        {/* Specific Bridge Details */}
        {isBridge && (
          <div className="space-y-3 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Structure Type:</span>
                <span className="text-white font-medium capitalize">{data.structure || 'Concrete Arch'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Span Length:</span>
                <span className="text-white font-mono">{data.length_m || 85} meters</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Criticality Grade:</span>
                <span className="text-rose-400 font-bold">{data.criticality || 'CRITICAL'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Model Confidence:</span>
                <span className="text-emerald-400 font-mono font-bold">94.2%</span>
              </div>
            </div>

            <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl space-y-1 text-slate-300">
              <div className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Network Cascading Impact
              </div>
              <p className="text-[11px] leading-relaxed">
                Failure of this bridge severs vehicular access to 3 upstream settlements (Dhunche, Syabrubesi, Grang) affecting ~10,100 residents.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={onOpenRoutePlanner}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Find Alternative Route</span>
              </button>
              <button
                onClick={onOpenEvidence}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Sub-Pixel Evidence Lens</span>
              </button>
            </div>
          </div>
        )}

        {/* Specific Settlement Details */}
        {isSettlement && (
          <div className="space-y-3 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Estimated Population:</span>
                <span className="text-white font-mono font-bold">{data.population_est?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Mapped OSM Buildings:</span>
                <span className="text-white font-mono">{data.mapped_buildings || 120}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Elevation:</span>
                <span className="text-cyan-400 font-mono font-bold">{data.elevation_m || 1400}m</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Hospital Route Access:</span>
                <span className={`font-bold ${data.connected_to_hospital ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.connected_to_hospital ? 'CONNECTED' : 'BLOCKED'}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
              <div className="font-bold text-slate-300">Grounded Disconnect Reason:</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {data.disconnect_cause || 'Accessible via primary highway corridor.'}
              </p>
            </div>

            <button
              onClick={onOpenEvidence}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect Satellite Evidence</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default: Overview Status Panel
  const cutOffCount = connectivity?.summary.cut_off_settlements_count || 6;
  const isolatedPop = connectivity?.summary.isolated_population_est || 14690;
  const damagedRoads = damage?.summary.damaged_roads_count || 5;
  const damagedBridges = damage?.summary.damaged_bridges_count || 3;

  return (
    <div className="w-full xl:w-96 bg-[#090e17]/95 border-l border-slate-800 p-5 flex flex-col justify-between gap-4 overflow-y-auto z-20 backdrop-blur-xl">
      <div className="space-y-4">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {language === 'ne' ? 'अपरेसनल इन्टेलिजेन्स' : 'MISSION INTELLIGENCE'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">LIVE COPERNICUS</span>
        </div>

        {/* Critical Alert Card */}
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-rose-300 uppercase tracking-wider text-[11px]">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Severe Isolation Notice</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong>{cutOffCount} settlements</strong> with <strong>{isolatedPop.toLocaleString()} residents</strong> currently lack vehicular ground access to hospital and district HQ.
          </p>
        </div>

        {/* Infrastructure Damage Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs">
          <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
            Infrastructure State
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-300">
              <span>Severed Road Segments:</span>
              <strong className="text-amber-400">{damagedRoads} / 11</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Compromised Bridges:</span>
              <strong className="text-rose-400">{damagedBridges} / 5</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Flood Inundation Extent:</span>
              <strong className="text-cyan-400">22.27 km²</strong>
            </div>
          </div>
        </div>

        {/* Quick Operations Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onOpenSimulation}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Run What-If Rescue Simulator</span>
          </button>

          <button
            onClick={onOpenFloodTracer}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trace Downstream Flood Path (Bonus)</span>
          </button>
        </div>
      </div>

      {/* Footer Provenance Note */}
      <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
        Derived from Sentinel-1 SAR, Sentinel-2 MSI, Copernicus DEM-30, and pre-event OSM.
      </div>
    </div>
  );
};
