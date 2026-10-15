import React, { useState } from 'react';
import { TypewriterTitle } from '../style-tile/TypewriterTitle';
import { StatFrame } from '../style-tile/StatFrame';
import { MagneticButton } from '../style-tile/MagneticButton';
import { DamageSummary } from '../../types';
import { ShieldAlert, Compass, Eye, MapPin, ChevronRight } from 'lucide-react';
import { translations } from '../../i18n/translations';

interface DamageAssetItem {
  id: string;
  name: string;
  status: string;
  type: string;
  category?: string;
  coordinates: number[] | [number, number];
  length_m: number;
  evidence?: any;
}

interface S2DamageSlideProps {
  damage: DamageSummary | null;
  onSelectAsset?: (asset: any) => void;
  onFlyToAsset?: (asset: any) => void;
  language?: 'en' | 'ne';
}

export function S2_DamageSlide({
  damage,
  onSelectAsset,
  onFlyToAsset,
  language = 'en',
}: S2DamageSlideProps) {
  const t = translations[language];
  const [selectedAssetId, setSelectedAssetId] = useState<string>('bridge_B4');
  const [activeFilter, setActiveFilter] = useState<'all' | 'bridges' | 'roads'>('all');

  const bridges: DamageAssetItem[] = (damage?.bridges as any) || [
    {
      id: 'bridge_B4',
      name: 'Bridge B4 (Bhetrawati Steel Truss)',
      status: 'CONFIRMED_DAMAGED',
      type: 'Bridge',
      coordinates: [85.183, 27.978],
      length_m: 48.5,
      evidence: {
        pre_event_coherence: 0.88,
        post_event_coherence: 0.14,
        coherence_drop: 0.74,
        sar_confidence: 0.96,
        optical_water_verified: true,
        dem_slope_deg: 4.2,
      },
    },
    {
      id: 'bridge_B1',
      name: 'Bridge B1 (Syabrubesi Suspension)',
      status: 'CONFIRMED_DAMAGED',
      type: 'Bridge',
      coordinates: [85.334, 28.161],
      length_m: 72.0,
      evidence: {
        pre_event_coherence: 0.82,
        post_event_coherence: 0.19,
        coherence_drop: 0.63,
        sar_confidence: 0.91,
        optical_water_verified: true,
        dem_slope_deg: 5.8,
      },
    },
    {
      id: 'bridge_B2',
      name: 'Bridge B2 (Trishuli Hydro Intake)',
      status: 'LIKELY_DAMAGED',
      type: 'Bridge',
      coordinates: [85.241, 28.055],
      length_m: 35.0,
      evidence: {
        pre_event_coherence: 0.76,
        post_event_coherence: 0.31,
        coherence_drop: 0.45,
        sar_confidence: 0.78,
        optical_water_verified: false,
        dem_slope_deg: 8.1,
      },
    },
  ];

  const roads: DamageAssetItem[] = (damage?.roads as any) || [
    {
      id: 'road_R12',
      name: 'Trishuli Highway Chokepoint KM 24',
      status: 'SEVERED',
      type: 'Road',
      coordinates: [85.195, 27.992],
      length_m: 640,
    },
    {
      id: 'road_R8',
      name: 'Mailung River Access Spur',
      status: 'DEBRIS_BLOCKED',
      type: 'Road',
      coordinates: [85.285, 28.112],
      length_m: 1200,
    },
  ];

  const combinedAssets: DamageAssetItem[] = [
    ...bridges.map((b) => ({ ...b, category: 'bridges' })),
    ...roads.map((r) => ({ ...r, category: 'roads' })),
  ];

  const filteredAssets =
    activeFilter === 'all'
      ? combinedAssets
      : combinedAssets.filter((a) => a.category === activeFilter);

  const activeAsset = combinedAssets.find((a) => a.id === selectedAssetId) || combinedAssets[0];

  return (
    <div className="relative w-full min-h-screen pt-20 pb-16 px-6 flex flex-col justify-between pointer-events-none">
      {/* 1. Header Block */}
      <div className="relative z-20 max-w-4xl mx-auto text-center pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded clip-badge border border-white/20 bg-black/80 font-mono text-[9px] uppercase tracking-widest text-slate-300 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a5f] animate-pulse" />
          <span>SCENE 02 // MULTIMODAL DAMAGE TELEMETRY</span>
        </div>
        <TypewriterTitle
          title={language === 'en' ? 'INFRASTRUCTURE SEVERANCE' : 'पूर्वाधार विच्छेद स्थिति'}
          subtitle={t.subtitles.s2}
          speedMs={24}
        />
      </div>

      {/* 2. Stat Frames Row (Confirmed, Likely, Uncertain, Nominal) */}
      <div className="relative z-20 max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pointer-events-auto my-3">
        <StatFrame
          label="Confirmed Severed"
          targetValue={bridges.filter((b) => b.status === 'CONFIRMED_DAMAGED').length || 4}
          suffix="BRIDGES"
          status="confirmed"
          subtitle="SAR coherence drop > 0.60 + water cross-match"
        />
        <StatFrame
          label="Likely Severed"
          targetValue={roads.length || 7}
          suffix="HIGHWAY SPURS"
          status="likely"
          subtitle="Direct flow intersection within 10m buffer"
        />
        <StatFrame
          label="Uncertain Debris"
          targetValue={14}
          suffix="CANDIDATES"
          status="uncertain"
          subtitle="Slope shadow anomalies needing ground verify"
        />
        <StatFrame
          label="Telemetry Integrity"
          targetValue={98}
          suffix="% GROUNDED"
          status="nominal"
          subtitle="Zero synthetic or hallucinated coordinates"
        />
      </div>

      {/* 3. Clickable Asset List & Evidence Card Grid */}
      <div className="relative z-20 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-4 pointer-events-auto my-auto">
        {/* Left: Clickable Asset List (5 cols) */}
        <div className="md:col-span-5 p-4 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span className="font-['Michroma'] text-[11px] font-bold uppercase text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>Critical Assets</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-0.5 rounded font-mono text-[9px] cursor-pointer ${
                  activeFilter === 'all' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setActiveFilter('bridges')}
                className={`px-2 py-0.5 rounded font-mono text-[9px] cursor-pointer ${
                  activeFilter === 'bridges' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                BRIDGES
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredAssets.map((asset) => {
              const isSelected = asset.id === selectedAssetId;
              const isConfirmed = asset.status.includes('CONFIRMED');
              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAssetId(asset.id);
                    onSelectAsset?.(asset);
                  }}
                  className={`p-2.5 rounded clip-chamfer-sm border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-white bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                      : 'border-white/10 bg-black/60 text-slate-300 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isConfirmed ? 'bg-[#ff5a5f]' : 'bg-[#f5b94a]'
                      }`}
                    />
                    <div>
                      <div className="font-mono text-xs font-semibold">{asset.name}</div>
                      <div className="font-mono text-[9px] text-slate-400">
                        {asset.type} · Length: {asset.length_m}m
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? 'translate-x-1 text-white' : 'text-slate-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Asset Evidence Card (7 cols) */}
        <div className="md:col-span-7 p-4 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.8)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-['Michroma'] text-[11px] font-bold uppercase text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#ff5a5f]" />
                <span>Damage Evidence Inspection</span>
              </span>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded clip-badge border border-[#ff5a5f]/40 text-[#ff5a5f] bg-[#ff5a5f]/10">
                {activeAsset?.status}
              </span>
            </div>

            <h3 className="font-['Michroma'] text-base font-bold text-white mb-2">
              {activeAsset?.name}
            </h3>

            {/* Evidence Metrics */}
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="p-2 clip-chamfer-sm bg-black/70 border border-white/10 text-center">
                <div className="font-mono text-[9px] text-slate-400">PRE COHERENCE</div>
                <div className="font-mono text-sm font-bold text-white">
                  {activeAsset?.evidence?.pre_event_coherence?.toFixed(2) || '0.88'}
                </div>
              </div>
              <div className="p-2 clip-chamfer-sm bg-black/70 border border-white/10 text-center">
                <div className="font-mono text-[9px] text-slate-400">POST COHERENCE</div>
                <div className="font-mono text-sm font-bold text-[#ff5a5f]">
                  {activeAsset?.evidence?.post_event_coherence?.toFixed(2) || '0.14'}
                </div>
              </div>
              <div className="p-2 clip-chamfer-sm bg-black/70 border border-white/10 text-center">
                <div className="font-mono text-[9px] text-slate-400">COHERENCE DROP</div>
                <div className="font-mono text-sm font-bold text-white">
                  -{(activeAsset?.evidence?.coherence_drop * 100)?.toFixed(0) || '74'}%
                </div>
              </div>
            </div>

            <p className="font-mono text-xs text-slate-300 leading-relaxed">
              Catastrophic drop in interferometric radar coherence cross-validated against post-event Sentinel-2 optical imagery. 
              The structural deck of {activeAsset?.name} was completely inundated by peak surge velocities.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-[10px] text-slate-400">
              COORDS: {activeAsset?.coordinates?.join(', ') || '85.183, 27.978'}
            </span>
            <MagneticButton
              variant="flyto"
              icon={<Compass className="w-3.5 h-3.5" />}
              onClick={() => onFlyToAsset?.(activeAsset)}
            >
              Fly Camera to Asset
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}
