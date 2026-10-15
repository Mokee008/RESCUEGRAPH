import React from 'react';
import { Satellite, ShieldAlert, FileText, CheckCircle2, Languages, Play, Layers } from 'lucide-react';
import { SensorStatus } from '../../types';

interface NavbarProps {
  sensors: SensorStatus | null;
  language: 'en' | 'ne';
  setLanguage: (lang: 'en' | 'ne') => void;
  onOpenReport: () => void;
  onOpenValidation: () => void;
  onStartDemoTour: () => void;
  is3D: boolean;
  setIs3D: (val: boolean) => void;
  caseStudyMode: 'TRISHULI' | 'CUSTOM';
  setCaseStudyMode: (mode: 'TRISHULI' | 'CUSTOM') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sensors,
  language,
  setLanguage,
  onOpenReport,
  onOpenValidation,
  onStartDemoTour,
  is3D,
  setIs3D,
  caseStudyMode,
  setCaseStudyMode,
}) => {
  return (
    <header className="w-full bg-[#070b14]/90 border-b border-cyan-500/20 backdrop-blur-md px-4 py-2.5 flex items-center justify-between z-30 sticky top-0 shadow-lg">
      {/* Brand & Track Info */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Satellite className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
              RESCUEGRAPH
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              Track B 2026
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            {language === 'ne' 
              ? 'उपग्रह विश्लेषण • बाढी क्षति • सडक सञ्जाल • सम्पर्कविहीन बस्ती पहिचान'
              : 'Satellite Sensing • Flood Damage • Road Graph • Cut-Off Detection'}
          </p>
        </div>
      </div>

      {/* Sensor Health Telemetry */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700/60 text-xs">
        <div className="flex items-center gap-1.5" title="Sentinel-1 SAR C-band All-Weather Radar">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400 font-mono">S1 SAR:</span>
          <span className="text-emerald-300 font-semibold font-mono">ONLINE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5" title="Sentinel-2 Optical 10m Multi-spectral">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="text-slate-400 font-mono">S2 OPTICAL:</span>
          <span className="text-amber-300 font-semibold font-mono">CLOUD-FUSED</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5" title="Copernicus WorldDEM 30m Global Elevation">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="text-slate-400 font-mono">DEM:</span>
          <span className="text-cyan-300 font-semibold font-mono">30m ACTIVE</span>
        </div>
      </div>

      {/* Action Controls & Navigation */}
      <div className="flex items-center gap-2">
        {/* Case Study Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs font-medium">
          <button
            onClick={() => setCaseStudyMode('TRISHULI')}
            className={`px-2 py-1 rounded transition-colors ${
              caseStudyMode === 'TRISHULI'
                ? 'bg-cyan-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Trishuli 2026
          </button>
          <button
            onClick={() => setCaseStudyMode('CUSTOM')}
            className={`px-2 py-1 rounded transition-colors ${
              caseStudyMode === 'CUSTOM'
                ? 'bg-cyan-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom AOI
          </button>
        </div>

        {/* 2D / 3D Toggle */}
        <button
          onClick={() => setIs3D(!is3D)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            is3D
              ? 'bg-indigo-900/60 border-indigo-400/80 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
          title="Toggle 3D Digital Disaster Twin"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>{is3D ? '3D TWIN' : '2D MAP'}</span>
        </button>

        {/* 3-Minute Demo Pitch Tour */}
        <button
          onClick={onStartDemoTour}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          title="3-Minute Hackathon Demo Pitch Tour"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">3-Min Pitch Tour</span>
        </button>

        {/* Air-gapped EMSR927 Validation */}
        <button
          onClick={onOpenValidation}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-cyan-300 text-xs font-medium transition-colors"
          title="View Copernicus EMSR927 Air-Gapped Validation Benchmark"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">EMSR927 Audit</span>
        </button>

        {/* Situation Report */}
        <button
          onClick={onOpenReport}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-cyan-300 text-xs font-medium transition-colors"
          title="Generate One-Page Situation Report"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">SITREP</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-300"
          title="Toggle English / Nepali Language"
        >
          <Languages className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold">{language === 'en' ? 'EN' : 'नेपाली'}</span>
        </button>
      </div>
    </header>
  );
};
