import React, { useState } from 'react';
import { TypewriterTitle } from '../style-tile/TypewriterTitle';
import { MagneticButton } from '../style-tile/MagneticButton';
import { Layers, Sliders, Shield, Satellite, Eye, EyeOff, Radio } from 'lucide-react';
import { SegmentationLayers } from '../../types';
import { translations } from '../../i18n/translations';

interface S1FloodSlideProps {
  segmentation: SegmentationLayers | null;
  onToggleSwipeMode?: (enabled: boolean) => void;
  onConfidenceChange?: (level: 'nominal' | 'high') => void;
  onFlyToTrishuli?: () => void;
  language?: 'en' | 'ne';
}

export function S1_FloodSlide({
  segmentation,
  onToggleSwipeMode,
  onConfidenceChange,
  onFlyToTrishuli,
  language = 'en',
}: S1FloodSlideProps) {
  const t = translations[language];
  const [showFloodLayer, setShowFloodLayer] = useState(true);
  const [showDebrisLayer, setShowDebrisLayer] = useState(true);
  const [confidenceLevel, setConfidenceLevel] = useState<'nominal' | 'high'>('high');
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipePosition, setSwipePosition] = useState(50);

  return (
    <div className="relative w-full min-h-screen pt-20 pb-16 px-6 flex flex-col justify-between pointer-events-none">
      {/* 1. Slide Title Header */}
      <div className="relative z-20 max-w-4xl mx-auto text-center pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded clip-badge border border-white/20 bg-black/80 font-mono text-[9px] uppercase tracking-widest text-slate-300 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>SCENE 01 // SENTINEL-1 SAR INUNDATION</span>
        </div>
        <TypewriterTitle
          title={language === 'en' ? 'FLOOD & DEBRIS EXTENT' : 'बाढी तथा लेदोको फैलावट'}
          subtitle={t.subtitles.s1}
          speedMs={24}
        />
      </div>

      {/* 2. Floating Telemetry & Layer Controller Panels */}
      <div className="relative z-20 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4 pointer-events-auto my-auto">
        {/* Panel 1: Layer Controls */}
        <div className="p-4 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span className="font-['Michroma'] text-[11px] font-bold uppercase text-white flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-white" />
              <span>Layer Filters</span>
            </span>
            <span className="font-mono text-[9px] text-slate-400">SAR RTC</span>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => setShowFloodLayer(!showFloodLayer)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded clip-chamfer-sm border font-mono text-xs transition-colors cursor-pointer ${
                showFloodLayer
                  ? 'border-white/50 bg-white/15 text-white'
                  : 'border-white/15 bg-black/60 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span>Flood Surge Mask</span>
              </span>
              {showFloodLayer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowDebrisLayer(!showDebrisLayer)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded clip-chamfer-sm border font-mono text-xs transition-colors cursor-pointer ${
                showDebrisLayer
                  ? 'border-white/50 bg-white/15 text-white'
                  : 'border-white/15 bg-black/60 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Debris Candidates</span>
              </span>
              {showDebrisLayer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Panel 2: Before / After Swipe Control */}
        <div className="p-4 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span className="font-['Michroma'] text-[11px] font-bold uppercase text-white flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-white" />
              <span>Before / After Swipe</span>
            </span>
            <span className="font-mono text-[9px] text-slate-400">SPLIT-VIEW</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span>PRE-EVENT (AUG 08)</span>
              <span>POST-EVENT (AUG 14)</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={swipePosition}
              onChange={(e) => {
                setSwipePosition(Number(e.target.value));
                if (!isSwipeActive) {
                  setIsSwipeActive(true);
                  onToggleSwipeMode?.(true);
                }
              }}
              className="w-full accent-white cursor-pointer"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-[10px] text-slate-400">Position: {swipePosition}%</span>
              <button
                onClick={() => {
                  const next = !isSwipeActive;
                  setIsSwipeActive(next);
                  onToggleSwipeMode?.(next);
                }}
                className="font-mono text-[10px] uppercase underline text-slate-300 hover:text-white cursor-pointer"
              >
                {isSwipeActive ? 'Disable Split' : 'Enable Split'}
              </button>
            </div>
          </div>
        </div>

        {/* Panel 3: Confidence Filtering & Orbit Specs */}
        <div className="p-4 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span className="font-['Michroma'] text-[11px] font-bold uppercase text-white flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Confidence Threshold</span>
            </span>
            <span className="font-mono text-[9px] text-emerald-400">RTC CLEANED</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                setConfidenceLevel('nominal');
                onConfidenceChange?.('nominal');
              }}
              className={`flex-1 py-1.5 clip-chamfer-sm font-mono text-xs font-semibold cursor-pointer transition-colors ${
                confidenceLevel === 'nominal'
                  ? 'bg-white text-black'
                  : 'bg-black/60 border border-white/20 text-slate-400 hover:text-white'
              }`}
            >
              All (&gt; 0.50)
            </button>
            <button
              onClick={() => {
                setConfidenceLevel('high');
                onConfidenceChange?.('high');
              }}
              className={`flex-1 py-1.5 clip-chamfer-sm font-mono text-xs font-semibold cursor-pointer transition-colors ${
                confidenceLevel === 'high'
                  ? 'bg-white text-black'
                  : 'bg-black/60 border border-white/20 text-slate-400 hover:text-white'
              }`}
            >
              High (&gt; 0.75)
            </button>
          </div>

          <div className="font-mono text-[10px] text-slate-400 flex items-center justify-between border-t border-white/10 pt-2">
            <span>ORBIT: REL 085 ASC</span>
            <span>B_PERP: 38M</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Action Bar */}
      <div className="relative z-20 max-w-4xl mx-auto w-full flex items-center justify-between pointer-events-auto">
        <div className="font-mono text-[11px] text-slate-400">
          SURGE REACH: TRISHULI RIVER KM 12 - 48
        </div>
        <MagneticButton
          variant="flyto"
          icon={<Radio className="w-3.5 h-3.5" />}
          onClick={onFlyToTrishuli}
        >
          Fly To Trishuli Gorge
        </MagneticButton>
      </div>
    </div>
  );
}
