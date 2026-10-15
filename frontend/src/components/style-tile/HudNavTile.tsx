import { Satellite, Radio } from 'lucide-react';
import { translations } from '../../i18n/translations';

interface HudNavTileProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPillClick?: () => void;
  language?: 'en' | 'ne';
  className?: string;
}

export function HudNavTile({
  activeTab,
  onTabChange,
  onPillClick,
  language = 'en',
  className = '',
}: HudNavTileProps) {
  const t = translations[language];
  const navItems = [
    { id: 'flood', label: t.nav.flood, badge: 'LIVE' },
    { id: 'damage', label: t.nav.damage, badge: null },
    { id: 'cutoff', label: t.nav.cutoff, badge: null },
    { id: 'report', label: t.nav.report, badge: null },
  ];

  return (
    <nav
      className={`relative w-full max-w-5xl mx-auto z-40 clip-hud-bar border-t border-b border-white/20 bg-black/85 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.9)] ${className}`}
      aria-label="Mission HUD Navigation"
    >
      {/* 1px subtle glowing silver top border line */}
      <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-80" />

      <div className="flex items-center justify-between px-6 py-2.5">
        {/* Left: Brand Logo & Mission Mark */}
        <div className="flex items-center gap-3">
          <div className="relative p-1.5 rounded-sm bg-[#12151c] border border-white/30 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <Satellite className="w-5 h-5 animate-pulse text-white" />
          </div>
          <div>
            <div className="font-['Michroma'] text-xs md:text-sm font-bold tracking-widest text-white flex items-center gap-2">
              FLOODSAT
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-200 border border-white/25">
                S-BAND 2026
              </span>
            </div>
            <div className="font-mono text-[9px] text-slate-400 tracking-wider">
              TRISHULI GLACIAL VALLEY // TRACK B
            </div>
          </div>
        </div>

        {/* Center: 4 HUD Nav Items with Notched Highlights and Hover Underline */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative px-4 py-2 font-['Michroma'] text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {/* Small Badge above item if specified */}
                {item.badge && (
                  <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 font-mono text-[8px] font-bold tracking-widest text-black bg-white clip-badge shadow-[0_0_6px_rgba(255,255,255,0.8)]">
                    {item.badge}
                  </span>
                )}

                {/* Notched Highlight for Active Item */}
                {isActive && (
                  <span
                    className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent clip-chamfer-sm border-t-2 border-white pointer-events-none"
                  />
                )}

                <span className="relative z-10">{item.label}</span>

                {/* Hover underline sweep */}
                <span
                  className={`absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-300 ${
                    isActive
                      ? 'opacity-100 scale-x-100 shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                      : 'opacity-0 scale-x-0 group-hover:opacity-80 group-hover:scale-x-100'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Pill Button & Telemetry Cue */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-slate-400 border-r border-white/15 pr-3">
            <Radio className="w-3 h-3 text-white animate-pulse" />
            <span>ORBIT: 60 fps</span>
          </div>

          <button
            onClick={onPillClick}
            className="px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-slate-200 shadow-[0_0_16px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {language === 'en' ? 'Run Trishuli Live' : 'त्रिशूली विश्लेषण'}
          </button>
        </div>
      </div>
    </nav>
  );
}
