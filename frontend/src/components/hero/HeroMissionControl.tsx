import React, { useState, useEffect, useRef } from 'react';
import { TypewriterTitle } from '../style-tile/TypewriterTitle';
import { MagneticButton } from '../style-tile/MagneticButton';
import { Play, Sparkles, Orbit, Compass, ArrowDown, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { translations } from '../../i18n/translations';

interface HeroMissionControlProps {
  onRunAnalysis: (bbox: string, date: string) => void;
  onLoadCaseStudy: () => void;
  onScrollToNext: () => void;
  onInspectCard?: (cardId: string) => void;
  scrollY?: number;
  mousePos?: { x: number; y: number };
  language?: 'en' | 'ne';
}

export function HeroMissionControl({
  onRunAnalysis,
  onLoadCaseStudy,
  onScrollToNext,
  onInspectCard,
  scrollY = 0,
  mousePos = { x: 0, y: 0 },
  language = 'en',
}: HeroMissionControlProps) {
  const t = translations[language];
  // BBox and Date State
  const [bboxInput, setBboxInput] = useState('85.12, 27.95, 85.35, 28.18');
  const [dateInput, setDateInput] = useState('2026-08-14');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Calculate scroll dissolve progress (0 to 1 over first 600px scroll)
  const dissolveProgress = Math.min(1, Math.max(0, scrollY / 600));
  const heroOpacity = Math.max(0, 1 - dissolveProgress * 1.2);
  const heroTranslateY = -dissolveProgress * 80;

  // Floating Cards Tilt based on Mouse
  const cardTiltX = mousePos.y * 6;
  const cardTiltY = -mousePos.x * 6;

  return (
    <section
      className="relative min-h-screen w-full flex flex-col justify-between items-center px-6 pt-24 pb-12 select-none overflow-hidden"
      style={{
        opacity: heroOpacity,
        transform: `translate3d(0, ${heroTranslateY}px, 0)`,
        willChange: 'transform, opacity',
      }}
    >
      {/* Background Mist Dissolve Overlay on Scroll */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-300 z-10"
        style={{
          opacity: dissolveProgress * 0.9,
          background: 'radial-gradient(circle at 50% 50%, rgba(2, 4, 10, 0.85) 0%, #000000 100%)',
        }}
      />

      {/* 1. Top Mission Classification Tag */}
      <div className="relative z-20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="px-3 py-1 clip-chamfer-sm border border-white/20 bg-black/60 text-slate-300 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>MISSION CONTROL // MULTIMODAL HACKATHON 2026</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
          <Orbit className="w-3.5 h-3.5 text-slate-300" />
          <span>S-BAND RADAR · TRACK B</span>
        </div>
      </div>

      {/* 2. Main Centered Title Block */}
      <div className="relative z-20 max-w-4xl w-full text-center my-auto space-y-6">
        <TypewriterTitle
          title={language === 'en' ? 'FLOODSAT RESCUE CONSOLE' : 'फ्लडस्याट उद्धार कन्सोल'}
          subtitle={t.subtitles.s0}
          speedMs={24}
        />

        <p className="max-w-2xl mx-auto font-sans text-sm md:text-base text-slate-300 font-normal leading-relaxed tracking-wide">
          {language === 'en'
            ? 'Near real-time synthetic aperture radar (SAR) coherence and optical fusion pipeline mapping infrastructure severance, cut-off communities, and critical rescue chokepoints in deep Himalayan gorges.'
            : 'हिमाली खोँचहरूमा पूर्वाधार विच्छेद, सम्पर्कविहीन बस्तीहरू र आपत्कालीन उद्धार अवरोधहरूको स्वचालित राडार तथा अप्टिकल उपग्रह नक्साङ्कन प्रणाली।'}
        </p>

        {/* Input Controls: BBox & Event Date (Obsidian Chamfered Bar) */}
        <div className="max-w-2xl mx-auto p-4 clip-chamfer-md border border-white/20 bg-black/80 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-slate-400 tracking-wider mb-1">
                <MapPin className="w-3 h-3 text-white" />
                <span>{language === 'en' ? 'Target BBox (Lon/Lat)' : 'लक्षित सिमाना (देशान्तर/अक्षांश)'}</span>
              </label>
              <input
                type="text"
                value={bboxInput}
                onChange={(e) => setBboxInput(e.target.value)}
                className="w-full px-3 py-1.5 clip-chamfer-sm bg-[#0a0d14] border border-white/20 font-mono text-xs text-white focus:outline-none focus:border-white transition-colors"
                placeholder="minLon, minLat, maxLon, maxLat"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-slate-400 tracking-wider mb-1">
                <Calendar className="w-3 h-3 text-white" />
                <span>{language === 'en' ? 'Flood Surge Date' : 'बाढीको मिति'}</span>
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3 py-1.5 clip-chamfer-sm bg-[#0a0d14] border border-white/20 font-mono text-xs text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[10px] text-slate-400">
              COPERNICUS EMSR927 CALIBRATED
            </span>

            <div className="flex items-center gap-3">
              <MagneticButton
                variant="inspect"
                icon={<Sparkles className="w-3.5 h-3.5 text-white" />}
                onClick={() => onRunAnalysis(bboxInput, dateInput)}
              >
                {t.actions.runAnalysis}
              </MagneticButton>

              <MagneticButton
                variant="flyto"
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
                onClick={onLoadCaseStudy}
              >
                {t.actions.loadCaseStudy}
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* 3. Three Floating Framed Cards with Mouse Parallax & Tilt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto pt-4 text-left">
          {/* Card 1: Run Analysis */}
          <div
            onClick={() => {
              setSelectedCard('analysis');
              onInspectCard?.('analysis');
            }}
            className="group relative p-4 clip-chamfer-md border border-white/15 bg-black/70 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-white hover:bg-black/90 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            style={{
              transform: `perspective(700px) rotateX(${cardTiltX.toFixed(2)}deg) rotateY(${cardTiltY.toFixed(2)}deg)`,
              transition: 'transform 0.15s ease-out, border-color 0.2s',
            }}
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
              <span className="font-mono text-[10px] text-slate-400">01 // TELEMETRY</span>
              <Compass className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors" />
            </div>
            <h4 className="font-['Michroma'] text-xs font-bold uppercase text-white mb-1">
              Custom BBox Analysis
            </h4>
            <p className="font-sans text-xs text-slate-300 leading-snug">
              Ingest arbitrary Sentinel-1 IW orbital passes, execute DEM shadow filtering, and generate flood confidence masks.
            </p>
          </div>

          {/* Card 2: Trishuli Case Study */}
          <div
            onClick={() => {
              setSelectedCard('casestudy');
              onInspectCard?.('casestudy');
            }}
            className="group relative p-4 clip-chamfer-md border border-white/15 bg-black/70 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-white hover:bg-black/90 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            style={{
              transform: `perspective(700px) rotateX(${cardTiltX.toFixed(2)}deg) rotateY(${cardTiltY.toFixed(2)}deg) translate3d(0, -6px, 0)`,
              transition: 'transform 0.15s ease-out, border-color 0.2s',
            }}
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
              <span className="font-mono text-[10px] text-white font-bold">02 // BENCHMARK</span>
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <h4 className="font-['Michroma'] text-xs font-bold uppercase text-white mb-1">
              Trishuli Case Study
            </h4>
            <p className="font-sans text-xs text-slate-300 leading-snug">
              Pre-computed 10m SAR coherence drop across Bridge B4 and Nuwakot district highway severance ground truth.
            </p>
          </div>

          {/* Card 3: How It Works */}
          <div
            onClick={() => {
              setSelectedCard('howitworks');
              onInspectCard?.('howitworks');
            }}
            className="group relative p-4 clip-chamfer-md border border-white/15 bg-black/70 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-white hover:bg-black/90 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            style={{
              transform: `perspective(700px) rotateX(${cardTiltX.toFixed(2)}deg) rotateY(${cardTiltY.toFixed(2)}deg)`,
              transition: 'transform 0.15s ease-out, border-color 0.2s',
            }}
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
              <span className="font-mono text-[10px] text-slate-400">03 // ALGORITHM</span>
              <Orbit className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors" />
            </div>
            <h4 className="font-['Michroma'] text-xs font-bold uppercase text-white mb-1">
              Topological Graph Cut
            </h4>
            <p className="font-sans text-xs text-slate-300 leading-snug">
              Combines satellite flood polygons with OpenStreetMap road networks to rank isolated highland communities.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Scroll Down Cue with Animated Glowing Line */}
      <div
        onClick={onScrollToNext}
        className="relative z-20 flex flex-col items-center gap-2 cursor-pointer group mt-6"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
          SCROLL
        </span>
        <div className="relative w-[1px] h-10 bg-white/20 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white to-transparent animate-pulse" />
        </div>
        <ArrowDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors animate-bounce" />
      </div>
    </section>
  );
}
