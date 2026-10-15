import React from 'react';
import {
  Compass,
  Map,
  AlertTriangle,
  Users,
  Navigation,
  Zap,
  Layers,
  Clock,
  FileText,
  Bot,
  Play,
  ShieldCheck,
  Languages,
} from 'lucide-react';

interface NavRailProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: 'en' | 'ne';
  setLanguage: (lang: 'en' | 'ne') => void;
  onOpenReport: () => void;
  onOpenValidation: () => void;
  onStartDemoTour: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
}

export const NavRail: React.FC<NavRailProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenReport,
  onOpenValidation,
  onStartDemoTour,
  onToggleCopilot,
  isCopilotOpen,
}) => {
  const navItems = [
    { id: 'overview', icon: Compass, label: language === 'ne' ? 'सिंहावलोकन' : 'Mission' },
    { id: 'map', icon: Map, label: language === 'ne' ? 'नक्सा' : 'Satellite Map' },
    { id: 'damage', icon: AlertTriangle, label: language === 'ne' ? 'क्षति विश्लेषण' : 'Damage' },
    { id: 'isolation', icon: Users, label: language === 'ne' ? 'सम्पर्कविहीन' : 'Isolation Radar' },
    { id: 'routes', icon: Navigation, label: language === 'ne' ? 'उद्धार मार्ग' : 'Rescue Routes' },
    { id: 'simulation', icon: Zap, label: language === 'ne' ? 'अनुकरण' : 'What-If Simulator' },
    { id: 'timeline', icon: Clock, label: language === 'ne' ? 'समयरेखा' : 'Disaster Replay' },
  ];

  return (
    <aside className="w-14 hover:w-48 bg-[#090e17] border-r border-slate-800 flex flex-col justify-between py-3 z-30 transition-all duration-300 ease-in-out group shadow-2xl shrink-0 select-none overflow-hidden">
      {/* Top Brand Logo */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-3.5">
          <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-400/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          </div>
          <span className="font-mono font-bold tracking-wider text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            RESCUEGRAPH
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action Controls */}
      <div className="flex flex-col gap-1 px-2 border-t border-slate-800/80 pt-3">
        {/* Copilot Trigger */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isCopilotOpen
              ? 'bg-purple-900/60 border border-purple-400/60 text-purple-200'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
          }`}
          title="AI Rescue Copilot"
        >
          <Bot className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Rescue Copilot
          </span>
        </button>

        {/* 3-Min Presentation Tour */}
        <button
          onClick={onStartDemoTour}
          className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          title="3-Minute Pitch Presentation Tour"
        >
          <Play className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            3-Min Pitch Tour
          </span>
        </button>

        {/* EMSR927 Audit */}
        <button
          onClick={onOpenValidation}
          className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          title="Copernicus EMSR927 Air-Gapped Validation Benchmark"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            EMSR927 Audit
          </span>
        </button>

        {/* Situation Report */}
        <button
          onClick={onOpenReport}
          className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          title="One-Page Situation Report"
        >
          <FileText className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            SITREP Report
          </span>
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
          className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          title="Toggle English / Nepali"
        >
          <Languages className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-bold">
            {language === 'en' ? 'नेपाली' : 'English'}
          </span>
        </button>
      </div>
    </aside>
  );
};
