import React, { useState } from 'react';
import {
  Settlement,
  RoadSegment,
  BridgeFeature,
  InfrastructureEvidence,
  FloodPathResult,
} from '../../types';
import {
  Layers,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface DisasterMapProps {
  settlements: Settlement[];
  roads: RoadSegment[];
  bridges: BridgeFeature[];
  floodPath: FloodPathResult | null;
  activeRescueRoute: any | null;
  timelineStage: 'BEFORE' | 'EVENT' | 'AFTER';
  setTimelineStage: (stage: 'BEFORE' | 'EVENT' | 'AFTER') => void;
  is3D: boolean;
  onSelectFeature: (feature: { type: string; data: any; evidence: InfrastructureEvidence }) => void;
  language: 'en' | 'ne';
  activeFilter: 'ALL' | 'FLOOD' | 'DAMAGE' | 'CUT_OFF';
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  settlements,
  roads,
  bridges,
  floodPath,
  activeRescueRoute,
  timelineStage,
  setTimelineStage,
  is3D,
  onSelectFeature,
  language,
  activeFilter,
}) => {
  // Layer visibility toggles
  const [showFlood, setShowFlood] = useState(true);
  const [showDebris, setShowDebris] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showBridges, setShowBridges] = useState(true);
  const [showSettlements, setShowSettlements] = useState(true);
  const [showUncertainty, setShowUncertainty] = useState(false);
  const [showAIMask, setShowAIMask] = useState(false);
  const [sensorBase, setSensorBase] = useState<'SAR' | 'OPTICAL'>('SAR');

  // 3D camera controls
  const [tilt, setTilt] = useState(is3D ? 45 : 0);
  const [zoom, setZoom] = useState(1);
  const [elevationExaggeration, setElevationExaggeration] = useState(1.5);

  // Map geographic bounding box: [85.12, 27.90] to [85.26, 28.06]
  const minLon = 85.13;
  const maxLon = 85.25;
  const minLat = 27.905;
  const maxLat = 28.065;

  // Convert GPS (lon, lat) to SVG canvas coordinates (1000x900 viewport)
  const project = (coords: [number, number]): [number, number] => {
    const [lon, lat] = coords;
    const x = ((lon - minLon) / (maxLon - minLon)) * 900 + 50;
    // Invert Y because latitude increases northward
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 800 + 50;
    return [x, y];
  };

  // Convert line coordinates to SVG path string
  const toPathD = (coordList: [number, number][]): string => {
    return coordList.reduce((acc, curr, idx) => {
      const [px, py] = project(curr);
      return idx === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
    }, '');
  };

  // Flood polygon coordinates
  const floodWaterCoords: [number, number][] = [
    [85.145, 27.912], [85.152, 27.925], [85.165, 27.950],
    [85.178, 27.972], [85.183, 27.978], [85.193, 28.002],
    [85.182, 28.022], [85.170, 28.040], [85.200, 28.056],
    [85.208, 28.057], [85.178, 28.044], [85.188, 28.018],
    [85.200, 28.008], [85.186, 27.978], [85.172, 27.954],
    [85.158, 27.930], [85.149, 27.910], [85.145, 27.912]
  ];

  const debrisCoords: [number, number][] = [
    [85.176, 27.970], [85.185, 27.975], [85.198, 28.002],
    [85.218, 28.022], [85.223, 28.026], [85.216, 28.033],
    [85.208, 28.020], [85.195, 28.008], [85.182, 27.980],
    [85.176, 27.970]
  ];

  const floodWaterPath = toPathD(floodWaterCoords) + ' Z';
  const debrisPath = toPathD(debrisCoords) + ' Z';

  return (
    <div className="relative w-full h-[640px] lg:h-[720px] bg-[#060a14] overflow-hidden select-none border-b border-slate-800">
      {/* 2D/3D Transform Container */}
      <div
        className="w-full h-full flex items-center justify-center transition-all duration-700 ease-out"
        style={{
          perspective: is3D ? '1100px' : 'none',
        }}
      >
        <div
          className="relative w-[1000px] h-[900px] transition-transform duration-700 origin-center"
          style={{
            transform: is3D
              ? `scale(${0.85 * zoom}) rotateX(${tilt || 48}deg) rotateZ(-12deg) translateY(${elevationExaggeration * 20}px)`
              : `scale(${0.92 * zoom})`,
          }}
        >
          {/* Base SVG Map */}
          <svg
            viewBox="0 0 1000 900"
            className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
          >
            <defs>
              {/* Mountain Relief Gradient */}
              <linearGradient id="terrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0c1322" />
                <stop offset="50%" stopColor="#080e1b" />
                <stop offset="100%" stopColor="#050811" />
              </linearGradient>

              {/* Water Flood Gradient */}
              <linearGradient id="floodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity={timelineStage === 'BEFORE' ? '0.2' : '0.85'} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={timelineStage === 'BEFORE' ? '0.1' : '0.75'} />
              </linearGradient>

              {/* Debris Silt Pattern */}
              <pattern id="debrisPattern" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="12" height="12" fill="#d97706" fillOpacity={timelineStage === 'BEFORE' ? '0.05' : '0.4'} />
                <line x1="0" y1="0" x2="0" y2="12" stroke="#b45309" strokeWidth="2" strokeOpacity={timelineStage === 'BEFORE' ? '0.05' : '0.6'} />
              </pattern>

              {/* Uncertainty Hatching */}
              <pattern id="uncertaintyHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.5" />
              </pattern>

              {/* Glow Filters */}
              <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="glowRed" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Base Terrain Background */}
            <rect width="1000" height="900" fill="url(#terrainGrad)" rx="16" />

            {/* Subtle Elevation Contours for 3D realism */}
            <g stroke="#1e293b" strokeWidth="0.8" fill="none" opacity="0.45">
              <path d="M 50 150 Q 300 200 550 120 T 950 180" />
              <path d="M 50 280 Q 400 340 700 250 T 950 320" />
              <path d="M 50 420 Q 250 490 600 380 T 950 460" />
              <path d="M 50 560 Q 350 630 650 520 T 950 600" />
              <path d="M 50 700 Q 450 780 750 680 T 950 750" />
              {/* Trishuli Valley Centerline Trench */}
              <path
                d="M 640 120 Q 520 280 470 450 T 320 800"
                stroke="#0f172a"
                strokeWidth="28"
                opacity="0.8"
              />
            </g>

            {/* Natural Pre-Event River Course (thin baseline) */}
            <path
              d="M 640 120 Q 520 280 470 450 T 320 800"
              stroke="#0369a1"
              strokeWidth={timelineStage === 'BEFORE' ? '8' : '4'}
              fill="none"
              strokeLinecap="round"
              opacity={timelineStage === 'BEFORE' ? '0.9' : '0.5'}
            />

            {/* AI FLOOD EXTENT POLYGON (Cyan Inundation) */}
            {showFlood && timelineStage !== 'BEFORE' && (
              <g className="transition-opacity duration-700">
                <path
                  d={floodWaterPath}
                  fill="url(#floodGrad)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  filter="url(#glowCyan)"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* AI DEBRIS & SILT POLYGON (Amber Stipple) */}
            {showDebris && timelineStage !== 'BEFORE' && (
              <g className="transition-opacity duration-700">
                <path
                  d={debrisPath}
                  fill="url(#debrisPattern)"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              </g>
            )}

            {/* AI Mask Overlay (4-Class view) */}
            {showAIMask && (
              <g opacity="0.35">
                <path d={floodWaterPath} fill="#0ea5e9" />
                <path d={debrisPath} fill="#f59e0b" />
                {/* Simulated shadow / uncertain zones */}
                <circle cx="580" cy="300" r="45" fill="#64748b" />
                <circle cx="430" cy="520" r="35" fill="#64748b" />
              </g>
            )}

            {/* Downstream Flood Path Scenario (Official Bonus) */}
            {floodPath && (
              <g className="animate-pulse">
                <path
                  d={toPathD(floodPath.path_geojson.geometry.coordinates)}
                  stroke="#06b6d4"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="8 4"
                  strokeLinecap="round"
                  filter="url(#glowCyan)"
                />
                <circle
                  cx={project(floodPath.start_coordinates)[0]}
                  cy={project(floodPath.start_coordinates)[1]}
                  r="7"
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Safe Rescue Route Path (Green Polyline) */}
            {activeRescueRoute && activeRescueRoute.route_geojson && (
              <g>
                <path
                  d={toPathD(activeRescueRoute.route_geojson.geometry.coordinates)}
                  stroke="#10b981"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_12px_#10b981]"
                />
              </g>
            )}

            {/* PRE-EVENT OSM ROADS */}
            {showRoads &&
              roads.map((road) => {
                const pathD = toPathD(road.coordinates);
                const isSevered = road.status === 'RED' && timelineStage !== 'BEFORE';
                const isAtRisk = road.status === 'ORANGE' && timelineStage !== 'BEFORE';
                const isPassable = !isSevered && !isAtRisk;

                const strokeColor = isSevered
                  ? '#ef4444'
                  : isAtRisk
                  ? '#f59e0b'
                  : '#22c55e';

                return (
                  <g
                    key={road.id}
                    className="cursor-pointer group"
                    onClick={() =>
                      onSelectFeature({
                        type: 'Road',
                        data: road,
                        evidence: road.evidence,
                      })
                    }
                  >
                    {/* Hover hotspot */}
                    <path
                      d={pathD}
                      stroke="transparent"
                      strokeWidth="18"
                      fill="none"
                    />
                    {/* Main road line */}
                    <path
                      d={pathD}
                      stroke={strokeColor}
                      strokeWidth={road.highway === 'primary' ? 4.5 : 3.0}
                      strokeDasharray={isSevered ? '6 3' : 'none'}
                      fill="none"
                      strokeLinecap="round"
                      filter={isSevered ? 'url(#glowRed)' : 'none'}
                      className="transition-all duration-300 group-hover:stroke-white group-hover:stroke-[6px]"
                    />
                  </g>
                );
              })}

            {/* BRIDGES (Critical Edges) */}
            {showBridges &&
              bridges.map((bridge) => {
                const [bx, by] = project(bridge.coordinates);
                const isSevered = bridge.status === 'RED' && timelineStage !== 'BEFORE';
                const isAtRisk = bridge.status === 'ORANGE' && timelineStage !== 'BEFORE';

                const ringColor = isSevered
                  ? '#ef4444'
                  : isAtRisk
                  ? '#f59e0b'
                  : '#22c55e';

                return (
                  <g
                    key={bridge.id}
                    className="cursor-pointer group"
                    onClick={() =>
                      onSelectFeature({
                        type: 'Bridge',
                        data: bridge,
                        evidence: bridge.evidence,
                      })
                    }
                  >
                    {/* Pulsing ring if severed */}
                    {isSevered && (
                      <circle
                        cx={bx}
                        cy={by}
                        r="16"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        className="animate-ping opacity-60"
                      />
                    )}
                    {/* Bridge marker */}
                    <rect
                      x={bx - 7}
                      y={by - 7}
                      width="14"
                      height="14"
                      rx="3"
                      fill={isSevered ? '#450a0a' : '#052e16'}
                      stroke={ringColor}
                      strokeWidth="2.5"
                      className="group-hover:scale-125 transition-transform origin-center"
                    />
                    <text
                      x={bx + 11}
                      y={by + 4}
                      fill="#f8fafc"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    >
                      {bridge.id.replace('bridge_', '')}
                    </text>
                  </g>
                );
              })}

            {/* SETTLEMENTS & DESTINATION HUBS */}
            {showSettlements &&
              settlements.map((s) => {
                const [sx, sy] = project(s.coordinates);
                const isCutOff =
                  s.connectivity_status === 'CUT_OFF' && timelineStage !== 'BEFORE';
                const isAtRisk =
                  s.connectivity_status === 'AT_RISK' && timelineStage !== 'BEFORE';
                const isDest = s.is_destination;

                let markerColor = '#22c55e';
                let markerBg = '#052e16';
                if (isCutOff) {
                  markerColor = '#ef4444';
                  markerBg = '#450a0a';
                } else if (isAtRisk) {
                  markerColor = '#f59e0b';
                  markerBg = '#451a03';
                } else if (isDest) {
                  markerColor = '#38bdf8';
                  markerBg = '#082f49';
                }

                return (
                  <g
                    key={s.id}
                    className="cursor-pointer group"
                    onClick={() =>
                      onSelectFeature({
                        type: s.is_hospital ? 'Hospital' : s.is_destination ? 'Town HQ' : 'Settlement',
                        data: s,
                        evidence: {
                          feature_type: s.type,
                          id: s.id,
                          name: s.name,
                          coordinates: s.coordinates,
                          flood_proximity_m: s.flood_distance_m || 250,
                          satellite_evidence: isCutOff
                            ? 'All pre-event road edges severed in active flood zone'
                            : 'Connected via intact road corridors',
                          model_confidence: 0.94,
                          current_connectivity_effect: s.status_label || 'Connected',
                          reason_for_classification: s.disconnect_cause || 'Accessible via highway network',
                          data_source: 'Pre-event OSM + RescueGraph Connectivity Engine',
                        },
                      })
                    }
                  >
                    {/* Pulsing indicator for cut-off settlements */}
                    {isCutOff && (
                      <circle
                        cx={sx}
                        cy={sy}
                        r="18"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        className="animate-ping opacity-60"
                      />
                    )}

                    {/* Settlement Icon */}
                    <circle
                      cx={sx}
                      cy={sy}
                      r={isDest ? 9 : 6.5}
                      fill={markerBg}
                      stroke={markerColor}
                      strokeWidth={isDest ? 3 : 2}
                      className="group-hover:scale-125 transition-transform origin-center"
                    />

                    {/* Settlement Label */}
                    <text
                      x={sx}
                      y={sy - 12}
                      textAnchor="middle"
                      fill={isCutOff ? '#fca5a5' : '#f1f5f9'}
                      fontSize={isDest ? 12 : 10.5}
                      fontWeight="bold"
                      className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] select-none"
                    >
                      {language === 'ne' ? s.name_ne || s.name : s.name}
                    </text>

                    {/* Cut-off badge label */}
                    {isCutOff && (
                      <text
                        x={sx}
                        y={sy + 18}
                        textAnchor="middle"
                        fill="#ef4444"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] animate-pulse"
                      >
                        [CUT OFF]
                      </text>
                    )}
                  </g>
                );
              })}

            {/* Uncertainty Layer */}
            {showUncertainty && (
              <g opacity="0.6">
                <rect x="520" y="240" width="120" height="90" fill="url(#uncertaintyHatch)" rx="8" />
                <rect x="360" y="470" width="140" height="110" fill="url(#uncertaintyHatch)" rx="8" />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* FLOATING CONTROLS HUD */}

      {/* Top Left: Layer Selector */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-[#090e1a]/90 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md shadow-xl text-xs space-y-1.5 w-48">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800">
            <span>Layers</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>
              Flood Inundation
            </span>
            <input
              type="checkbox"
              checked={showFlood}
              onChange={(e) => setShowFlood(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
              Debris / Silt Wash
            </span>
            <input
              type="checkbox"
              checked={showDebris}
              onChange={(e) => setShowDebris(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              OSM Road Network
            </span>
            <input
              type="checkbox"
              checked={showRoads}
              onChange={(e) => setShowRoads(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
              Critical Bridges
            </span>
            <input
              type="checkbox"
              checked={showBridges}
              onChange={(e) => setShowBridges(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              Settlement Status
            </span>
            <input
              type="checkbox"
              checked={showSettlements}
              onChange={(e) => setShowSettlements(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <div className="pt-1 border-t border-slate-800 space-y-1">
            <label className="flex items-center justify-between cursor-pointer text-purple-300 hover:text-white">
              <span>Uncertainty Layer</span>
              <input
                type="checkbox"
                checked={showUncertainty}
                onChange={(e) => setShowUncertainty(e.target.checked)}
                className="accent-purple-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-cyan-300 hover:text-white">
              <span>AI 4-Class Mask</span>
              <input
                type="checkbox"
                checked={showAIMask}
                onChange={(e) => setShowAIMask(e.target.checked)}
                className="accent-cyan-500 rounded"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Top Right: 3D Camera & Sensor Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Sensor Mode Switch */}
        <div className="bg-[#090e1a]/90 border border-slate-800 rounded-xl p-1.5 backdrop-blur-md shadow-xl flex items-center gap-1 text-xs">
          <button
            onClick={() => setSensorBase('SAR')}
            className={`px-2 py-1 rounded-lg font-mono font-semibold transition-colors ${
              sensorBase === 'SAR' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            S1 SAR
          </button>
          <button
            onClick={() => setSensorBase('OPTICAL')}
            className={`px-2 py-1 rounded-lg font-mono font-semibold transition-colors ${
              sensorBase === 'OPTICAL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            S2 OPTICAL
          </button>
        </div>

        {/* 3D controls */}
        {is3D && (
          <div className="bg-[#090e1a]/90 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md shadow-xl text-xs space-y-2 w-44">
            <div className="flex items-center justify-between text-indigo-300 font-bold uppercase text-[10px]">
              <span>3D Terrain Twin</span>
              <Sliders className="w-3.5 h-3.5" />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Tilt Angle</span>
                <span>{tilt}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="65"
                value={tilt}
                onChange={(e) => setTilt(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Relief Factor</span>
                <span>{elevationExaggeration}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={elevationExaggeration}
                onChange={(e) => setElevationExaggeration(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Center: Cinematic Timeline Slider */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-lg">
        <div className="bg-[#090e1a]/95 border border-cyan-500/30 rounded-2xl p-3 backdrop-blur-md shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
              {language === 'ne' ? 'आपतकालीन समयरेखा' : 'DISASTER TIMELINE REPLAY'}
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {timelineStage === 'BEFORE'
                ? 'PRE-EVENT (2026-08-05)'
                : timelineStage === 'EVENT'
                ? 'PEAK INUNDATION (2026-08-14)'
                : 'POST-SURGE SAR (2026-08-15)'}
            </span>
          </div>

          {/* Timeline Buttons */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTimelineStage('BEFORE')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                timelineStage === 'BEFORE'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. BEFORE
            </button>
            <button
              onClick={() => setTimelineStage('EVENT')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                timelineStage === 'EVENT'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. EVENT
            </button>
            <button
              onClick={() => setTimelineStage('AFTER')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                timelineStage === 'AFTER'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. AFTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
