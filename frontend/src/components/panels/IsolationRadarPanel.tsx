import React, { useState } from 'react';
import { Settlement } from '../../types';
import { Users, AlertOctagon, HelpCircle, ShieldAlert, CheckCircle, Crosshair, ChevronRight } from 'lucide-react';

interface IsolationRadarPanelProps {
  settlements: Settlement[];
  onSelectSettlement: (s: Settlement) => void;
  language: 'en' | 'ne';
}

export const IsolationRadarPanel: React.FC<IsolationRadarPanelProps> = ({
  settlements,
  onSelectSettlement,
  language,
}) => {
  const [selectedWhy, setSelectedWhy] = useState<string | null>(null);

  const nonHubs = settlements.filter((s) => !s.is_destination);
  const cutOff = nonHubs.filter((s) => s.connectivity_status === 'CUT_OFF');
  const atRisk = nonHubs.filter((s) => s.connectivity_status === 'AT_RISK');
  const connected = nonHubs.filter((s) => s.connectivity_status === 'CONNECTED');

  return (
    <div className="w-full bg-[#080d1a]/95 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
          <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <span>{language === 'ne' ? 'सम्पर्कविहीन राडार' : 'ISOLATION RADAR'}</span>
          </h3>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
          {cutOff.length} {language === 'ne' ? 'बस्ती विच्छेद' : 'CUT OFF'}
        </span>
      </div>

      {/* Human Impact Headline */}
      <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-rose-200">
            {language === 'ne'
              ? '६ बस्तीहरू जिल्ला अस्पताल र बजारबाट पूर्ण रूपमा विच्छेद छन्'
              : '6 COMMUNITIES COMPLETELY CUT OFF FROM HOSPITAL & TOWN HQ'}
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5">
            {language === 'ne'
              ? 'सडक र पुलहरू बाढीले बगाएपछि जमिन मार्गबाट कुनै पनि आकस्मिक एम्बुलेन्स वा राहत सामग्री पुग्न सक्दैन।'
              : 'Severed bridges and submerged gorge roads have isolated 14,690 residents. No vehicular medical evacuation route exists.'}
          </p>
        </div>
      </div>

      {/* Settlement Breakdown List */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {/* CUT OFF SETTLEMENTS */}
        {cutOff.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelectSettlement(s)}
            className="group cursor-pointer bg-slate-900/60 hover:bg-slate-800/80 border border-rose-500/30 hover:border-rose-400 rounded-xl p-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-xs font-bold text-white group-hover:text-rose-300">
                  {language === 'ne' ? s.name_ne || s.name : s.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-400 border border-rose-600/30">
                  CUT OFF
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {s.population_est.toLocaleString()} {language === 'ne' ? 'बासिन्दा' : 'people'}
              </span>
            </div>

            <div className="mt-2 text-[11px] text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-medium">
                <span>Hospital Access: <strong>BLOCKED</strong></span>
                <span>•</span>
                <span>Town Access: <strong>BLOCKED</strong></span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWhy(selectedWhy === s.id ? null : s.id);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold border border-slate-700 transition-colors flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3 text-cyan-400" />
                <span>Why?</span>
              </button>
            </div>

            {/* Expandable Technical Explanation Popover */}
            {selectedWhy === s.id && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-black/60 border border-cyan-500/30 text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-cyan-300 flex items-center gap-1">
                  <span>Grounded Disconnect Reason:</span>
                </div>
                <p>{s.disconnect_cause || 'Pre-event road edges severed in active flood inundation zone.'}</p>
                <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                  Mapped OSM Buildings: {s.mapped_buildings} | Elevation: {s.elevation_m}m
                </div>
              </div>
            )}
          </div>
        ))}

        {/* AT RISK SETTLEMENTS */}
        {atRisk.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelectSettlement(s)}
            className="group cursor-pointer bg-slate-900/60 hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-400 rounded-xl p-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-xs font-bold text-white group-hover:text-amber-300">
                  {language === 'ne' ? s.name_ne || s.name : s.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-600/30">
                  AT RISK (1 Route)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {s.population_est.toLocaleString()} people
              </span>
            </div>
            <p className="mt-1 text-[11px] text-amber-300/90 font-medium">
              Dependent on single vulnerable bridge/road link.
            </p>
          </div>
        ))}

        {/* CONNECTED SETTLEMENTS */}
        {connected.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelectSettlement(s)}
            className="group cursor-pointer bg-slate-900/40 hover:bg-slate-800/60 border border-emerald-500/20 hover:border-emerald-400 rounded-xl p-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                  {language === 'ne' ? s.name_ne || s.name : s.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/30">
                  CONNECTED
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {s.population_est.toLocaleString()} people
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
