import React, { useState } from 'react';
import { TypewriterTitle } from '../style-tile/TypewriterTitle';
import { MagneticButton } from '../style-tile/MagneticButton';
import { FloodPathResult } from '../../types';
import { Waves, Play, MapPin, Clock, AlertTriangle, Compass } from 'lucide-react';
import { translations } from '../../i18n/translations';

interface S4FloodPathSlideProps {
  floodPath: FloodPathResult | null;
  onTracePath?: (coords: [number, number]) => void;
  onFlyToPath?: () => void;
  language?: 'en' | 'ne';
}

export function S4_FloodPathSlide({
  floodPath,
  onTracePath,
  onFlyToPath,
  language = 'en',
}: S4FloodPathSlideProps) {
  const t = translations[language];
  const [selectedBreachPoint, setSelectedBreachPoint] = useState<'langtang' | 'mailung'>('langtang');
  const [isTracing, setIsTracing] = useState(false);

  const breachPoints = {
    langtang: {
      name: 'Upper Langtang Glacial Breach',
      coords: [85.385, 28.212] as [number, number],
      elevation_m: 3420,
      flow_m3_s: 1850,
    },
    mailung: {
      name: 'Mailung Hydro Gorge Chokepoint',
      coords: [85.292, 28.125] as [number, number],
      elevation_m: 1980,
      flow_m3_s: 2150,
    },
  };

  const downstreamImpacts = [
    {
      name: 'Mailung Settlement',
      distance_km: 14.2,
      time_min: 22,
      status: 'EXTREME_SURGE',
      surge_height_m: 6.8,
    },
    {
      name: 'Bhetrawati Bridge B4',
      distance_km: 28.6,
      time_min: 48,
      status: 'STRUCTURAL_COLLAPSE',
      surge_height_m: 5.4,
    },
    {
      name: 'Bidur Lower Floodplain',
      distance_km: 41.0,
      time_min: 85,
      status: 'CONTROLLED_INUNDATION',
      surge_height_m: 2.9,
    },
  ];

  const handleTriggerTrace = () => {
    setIsTracing(true);
    const pt = breachPoints[selectedBreachPoint];
    onTracePath?.(pt.coords);
    setTimeout(() => setIsTracing(false), 800);
  };

  return (
    <div className="relative w-full min-h-screen pt-20 pb-16 px-6 flex flex-col justify-between pointer-events-none">
      {/* 1. Slide Title Header */}
      <div className="relative z-20 max-w-4xl mx-auto text-center pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded clip-badge border border-white/20 bg-black/80 font-mono text-[9px] uppercase tracking-widest text-slate-300 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>SCENE 04 // BONUS: HYDRODYNAMIC FLOW PATH PROPAGATION</span>
        </div>
        <TypewriterTitle
          title={language === 'en' ? 'DOWNSTREAM FLOOD PATH' : 'तल्लो तटीय बहाव मार्ग'}
          subtitle={t.subtitles.s4}
          speedMs={24}
        />
      </div>

      {/* 2. Main Two-Column Controls Grid */}
      <div className="relative z-20 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-4 pointer-events-auto my-auto">
        {/* Left: Upstream Point Selection (5 cols) */}
        <div className="md:col-span-5 p-4 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.8)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-['Michroma'] text-[11px] font-bold uppercase text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>Upstream Breach Points</span>
              </span>
              <span className="font-mono text-[9px] text-slate-400">DEM 30M D8</span>
            </div>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => setSelectedBreachPoint('langtang')}
                className={`w-full p-3 rounded clip-chamfer-sm border text-left font-mono transition-colors cursor-pointer ${
                  selectedBreachPoint === 'langtang'
                    ? 'border-white bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                    : 'border-white/10 bg-black/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-white">Langtang Glacial Breach</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Elevation: 3,420m · Est. Peak: 1,850 m³/s
                </div>
              </button>

              <button
                onClick={() => setSelectedBreachPoint('mailung')}
                className={`w-full p-3 rounded clip-chamfer-sm border text-left font-mono transition-colors cursor-pointer ${
                  selectedBreachPoint === 'mailung'
                    ? 'border-white bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                    : 'border-white/10 bg-black/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-white">Mailung Hydro Gorge</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Elevation: 1,980m · Est. Peak: 2,150 m³/s
                </div>
              </button>
            </div>

            <div className="p-3 clip-chamfer-sm bg-[#10141e] border border-white/10 font-mono text-[11px] text-slate-300 leading-snug">
              Clicking <span className="text-white font-bold">Trace Downstream Surge</span> triggers the D8 descent algorithm down the Trishuli gorge, projecting time-to-impact across 41 km.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <MagneticButton
              variant="flyto"
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
              onClick={handleTriggerTrace}
              className="w-full"
            >
              {isTracing ? 'Computing Surge Path...' : 'Trace Downstream Surge'}
            </MagneticButton>
          </div>
        </div>

        {/* Right: Downstream Settlements at Risk (7 cols) */}
        <div className="md:col-span-7 p-4 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.8)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-['Michroma'] text-[11px] font-bold uppercase text-white flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-white" />
                <span>Downstream Settlements Impact</span>
              </span>
              <span className="font-mono text-[9px] text-slate-400">PROPAGATION TIME</span>
            </div>

            <div className="space-y-2.5">
              {downstreamImpacts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 clip-chamfer-sm border border-white/15 bg-black/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-mono text-xs font-bold text-white">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-white">{item.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">
                        Reach: {item.distance_km} km · Peak Height: {item.surge_height_m}m
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-white font-mono text-xs font-bold">
                      <Clock className="w-3 h-3" />
                      <span>+{item.time_min} MIN</span>
                    </div>
                    <span className="font-mono text-[8px] px-1.5 py-0.5 rounded clip-badge border border-white/30 text-slate-300">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-[10px] text-slate-400">
              EST. MEAN GORGE VELOCITY: 4.2 M/S
            </span>
            <MagneticButton
              variant="inspect"
              icon={<Compass className="w-3.5 h-3.5" />}
              onClick={onFlyToPath}
            >
              Follow Surge Camera
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}
