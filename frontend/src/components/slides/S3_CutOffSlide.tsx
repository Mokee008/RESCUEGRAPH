import React, { useState } from 'react';
import { TypewriterTitle } from '../style-tile/TypewriterTitle';
import { MagneticButton } from '../style-tile/MagneticButton';
import { ConnectivityResult } from '../../types';
import { Network, AlertTriangle, Hospital, Navigation, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { translations } from '../../i18n/translations';

interface RankedSettlementItem {
  id: string;
  name: string;
  status: string;
  population: number;
  coordinates: [number, number];
  nearest_hospital: string;
  hospital_status: string;
  alternative_hospital: string;
  detour_km: number;
  breaking_segment: string;
}

interface S3CutOffSlideProps {
  connectivity: ConnectivityResult | null;
  onHighlightBreakingPoint?: (bridgeId: string) => void;
  onFlyToSettlement?: (settlement: any) => void;
  language?: 'en' | 'ne';
}

export function S3_CutOffSlide({
  connectivity,
  onHighlightBreakingPoint,
  onFlyToSettlement,
  language = 'en',
}: S3CutOffSlideProps) {
  const t = translations[language];
  const [selectedSettlementId, setSelectedSettlementId] = useState<string>('settlement_S3');

  const defaultSettlements: RankedSettlementItem[] = [
    {
      id: 'settlement_S3',
      name: 'Mailung Village',
      status: 'CUT_OFF',
      population: 1850,
      coordinates: [85.285, 28.112],
      nearest_hospital: 'Trishuli District Hospital',
      hospital_status: 'UNREACHABLE',
      alternative_hospital: 'Dhunche Emergency Aid Post',
      detour_km: 46.5,
      breaking_segment: 'Bridge B4 (Bhetrawati)',
    },
    {
      id: 'settlement_S4',
      name: 'Haku Highland',
      status: 'CUT_OFF',
      population: 2400,
      coordinates: [85.245, 28.095],
      nearest_hospital: 'Trishuli District Hospital',
      hospital_status: 'UNREACHABLE',
      alternative_hospital: 'Dhunche Emergency Aid Post',
      detour_km: 52.0,
      breaking_segment: 'Bridge B4 (Bhetrawati)',
    },
    {
      id: 'settlement_S2',
      name: 'Syabrubesi Chokepoint',
      status: 'LONG_DETOUR',
      population: 3100,
      coordinates: [85.334, 28.161],
      nearest_hospital: 'Trishuli District Hospital',
      hospital_status: 'DETOUR_REQUIRED',
      alternative_hospital: 'Langtang Field Clinic',
      detour_km: 38.2,
      breaking_segment: 'Bridge B1 (Syabrubesi)',
    },
    {
      id: 'settlement_S1',
      name: 'Bidur District Hub',
      status: 'CONNECTED',
      population: 14200,
      coordinates: [85.155, 27.915],
      nearest_hospital: 'Trishuli District Hospital',
      hospital_status: 'CONNECTED',
      alternative_hospital: 'Kathmandu Trauma Center',
      detour_km: 0,
      breaking_segment: 'None (Nominal)',
    },
  ];

  const settlements: RankedSettlementItem[] =
    connectivity?.settlements?.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.connectivity_status || (s.connected_to_hospital ? 'CONNECTED' : 'CUT_OFF'),
      population: s.population_est || 2000,
      coordinates: s.coordinates,
      nearest_hospital: 'Trishuli District Hospital',
      hospital_status: s.connected_to_hospital ? 'CONNECTED' : 'UNREACHABLE',
      alternative_hospital: s.nearest_reachable_hub || 'Dhunche Emergency Aid Post',
      detour_km: s.alternate_route_available ? 46.5 : 0,
      breaking_segment: s.disconnect_cause || 'Bridge B4 (Bhetrawati)',
    })) || defaultSettlements;

  const activeSettlement =
    settlements.find((s) => s.id === selectedSettlementId) || settlements[0];

  return (
    <div className="relative w-full min-h-screen pt-20 pb-16 px-6 flex flex-col justify-between pointer-events-none">
      {/* 1. Slide Title Header */}
      <div className="relative z-20 max-w-4xl mx-auto text-center pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded clip-badge border border-[#f5b94a]/40 bg-black/80 font-mono text-[9px] uppercase tracking-widest text-[#f5b94a] mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f5b94a] animate-pulse" />
          <span>SCENE 03 // NETWORK REACHABILITY & GRAPH CHOKEPOINTS</span>
        </div>
        <TypewriterTitle
          title={language === 'en' ? 'CUT-OFF SETTLEMENTS' : 'विच्छेद भएका बस्तीहरू'}
          subtitle={t.subtitles.s3}
          speedMs={24}
        />
      </div>

      {/* 2. Main Dual Panel Grid */}
      <div className="relative z-20 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-4 pointer-events-auto my-auto">
        {/* Left: Ranked Settlements List (5 cols) */}
        <div className="md:col-span-5 p-4 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span className="font-['Michroma'] text-[11px] font-bold uppercase text-white flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-white" />
              <span>Ranked Settlements</span>
            </span>
            <span className="font-mono text-[9px] text-[#f5b94a]">4 ISOLATED</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {settlements.map((s) => {
              const isSelected = s.id === selectedSettlementId;
              const isCutOff = s.status === 'CUT_OFF';
              const isDetour = s.status === 'LONG_DETOUR';
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedSettlementId(s.id);
                    onFlyToSettlement?.(s);
                  }}
                  className={`p-3 rounded clip-chamfer-sm border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-white bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                      : 'border-white/10 bg-black/60 text-slate-300 hover:border-white/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCutOff ? 'bg-[#ff5a5f]' : isDetour ? 'bg-[#f5b94a]' : 'bg-emerald-400'
                        }`}
                      />
                      <span className="font-mono text-xs font-bold">{s.name}</span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-400 mt-0.5">
                      Pop: {s.population.toLocaleString()} · Chokepoint: {s.breaking_segment}
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[8px] font-bold px-1.5 py-0.5 clip-badge border ${
                      isCutOff
                        ? 'border-[#ff5a5f]/40 text-[#ff5a5f] bg-[#ff5a5f]/10'
                        : isDetour
                        ? 'border-[#f5b94a]/40 text-[#f5b94a] bg-[#f5b94a]/10'
                        : 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10'
                    }`}
                  >
                    {s.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Hospital Access & Breaking Segment Card (7 cols) */}
        <div className="md:col-span-7 p-4 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.8)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-['Michroma'] text-[11px] font-bold uppercase text-white flex items-center gap-1.5">
                <Hospital className="w-3.5 h-3.5 text-white" />
                <span>Medical Access & Route Diagnosis</span>
              </span>
              <span className="font-mono text-[9px] text-slate-400">GRAPH CUT</span>
            </div>

            <h3 className="font-['Michroma'] text-base font-bold text-white mb-1">
              {activeSettlement.name}
            </h3>
            <p className="font-mono text-xs text-slate-400 mb-3">
              Estimated Affected Civilians: {activeSettlement.population.toLocaleString()} residents
            </p>

            {/* Medical Access Breakdown */}
            <div className="space-y-2 my-2">
              <div className="p-2.5 clip-chamfer-sm bg-black/70 border border-[#ff5a5f]/30 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[9px] text-slate-400">PRIMARY HOSPITAL</div>
                  <div className="font-mono text-xs font-bold text-white">{activeSettlement.nearest_hospital}</div>
                </div>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-[#ff5a5f]/40 text-[#ff5a5f] bg-[#ff5a5f]/10 font-bold">
                  {activeSettlement.hospital_status}
                </span>
              </div>

              <div className="p-2.5 clip-chamfer-sm bg-black/70 border border-white/15 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[9px] text-slate-400">ALTERNATIVE AID POST</div>
                  <div className="font-mono text-xs font-bold text-white">{activeSettlement.alternative_hospital}</div>
                </div>
                <span className="font-mono text-[9px] text-slate-300">
                  +{activeSettlement.detour_km} km mountain detour
                </span>
              </div>
            </div>

            {/* Critical Breaking Segment Callout */}
            <div className="p-2.5 clip-chamfer-sm bg-[#12151e] border border-[#f5b94a]/30 mt-3">
              <div className="flex items-center gap-2 text-[#f5b94a] font-mono text-[10px] font-bold uppercase mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Critical Breaking Point: {activeSettlement.breaking_segment}</span>
              </div>
              <p className="font-mono text-[11px] text-slate-300 leading-snug">
                Severance of this specific bridge segment isolates the entire upstream sector from emergency vehicle transit.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <MagneticButton
              variant="inspect"
              onClick={() => onHighlightBreakingPoint?.('bridge_B4')}
            >
              Highlight Breaking Point
            </MagneticButton>

            <MagneticButton
              variant="flyto"
              icon={<Navigation className="w-3.5 h-3.5" />}
              onClick={() => onFlyToSettlement?.(activeSettlement)}
            >
              Fly to Settlement
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}
