import React, { useState, useRef } from 'react';
import {
  Home,
  Layers,
  FileText,
  ShieldCheck,
  Info,
  Languages,
  Download,
  HelpCircle,
  Zap,
  Plus,
  RefreshCw,
  Maximize2,
  Share2,
} from 'lucide-react';

interface SideDocksTileProps {
  language: 'en' | 'ne';
  onToggleLanguage: () => void;
  isLite: boolean;
  onToggleLite: () => void;
  onQuickAction?: (action: string) => void;
}

export function SideDocksTile({
  language,
  onToggleLanguage,
  isLite,
  onToggleLite,
  onQuickAction,
}: SideDocksTileProps) {
  // Left dock flyout state with 120ms open / 150ms grace delay
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const openTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  // FAB menu state
  const [isFabOpen, setIsFabOpen] = useState(false);

  const leftDockItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-4 h-4" />,
      subItems: ['Mission Control', 'Trishuli Basin BBox', 'Baseline Telemetry'],
    },
    {
      id: 'layers',
      label: 'Layers',
      icon: <Layers className="w-4 h-4" />,
      subItems: ['SAR Sentinel-1 Flood', 'Optical MSI Moisture', 'OSM Infrastructure'],
    },
    {
      id: 'report',
      label: 'Report',
      icon: <FileText className="w-4 h-4" />,
      subItems: ['One-Page SITREP (EN)', 'Disaster Brief (NE)', 'PDF Export'],
    },
    {
      id: 'validation',
      label: 'Validate',
      icon: <ShieldCheck className="w-4 h-4" />,
      subItems: ['Copernicus EMSR927 Check', 'IoU & Precision Metrics', 'Known False Positives'],
    },
    {
      id: 'about',
      label: 'About',
      icon: <Info className="w-4 h-4" />,
      subItems: ['Multimodal Hackathon 2026', 'Zero-Lag Architecture', 'Team & Citation'],
    },
  ];

  const handleMouseEnterItem = (id: string) => {
    if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    // 120ms delay per specification
    openTimeoutRef.current = window.setTimeout(() => {
      setActiveFlyout(id);
    }, 120);
  };

  const handleMouseLeaveItem = () => {
    if (openTimeoutRef.current) window.clearTimeout(openTimeoutRef.current);
    // 150ms grace delay per specification
    closeTimeoutRef.current = window.setTimeout(() => {
      setActiveFlyout(null);
    }, 150);
  };

  return (
    <>
      {/* 1. Slim Left Icon Dock */}
      <aside
        className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 p-1.5 rounded-lg border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_0_24px_rgba(0,0,0,0.8)]"
        aria-label="Navigation Dock"
      >
        {leftDockItems.map((item) => {
          const isFlyoutOpen = activeFlyout === item.id;
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => handleMouseEnterItem(item.id)}
              onMouseLeave={handleMouseLeaveItem}
            >
              <button
                className={`relative w-11 h-11 flex flex-col items-center justify-center rounded clip-chamfer-sm transition-all duration-200 cursor-pointer ${
                  isFlyoutOpen
                    ? 'bg-white/20 text-white border border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                style={{
                  transform: isFlyoutOpen ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                {item.icon}
                <span className="font-mono text-[8px] uppercase tracking-tighter mt-0.5">
                  {item.label}
                </span>
              </button>

              {/* Chamfered Flyout Sub-menu (120ms open, 150ms close grace) */}
              {isFlyoutOpen && (
                <div
                  className="absolute left-full top-0 ml-3 w-52 p-3 clip-chamfer-md border border-white/30 bg-black/90 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.95)] z-50 animate-in fade-in slide-in-from-left-2 duration-150"
                  onMouseEnter={() => {
                    if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
                  }}
                  onMouseLeave={handleMouseLeaveItem}
                >
                  <div className="flex items-center gap-2 border-b border-white/15 pb-1.5 mb-2">
                    <span className="text-white text-xs">◈</span>
                    <span className="font-['Michroma'] text-[10px] uppercase tracking-wider text-white">
                      {item.label} Subsystems
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {item.subItems.map((sub, idx) => (
                      <li key={idx}>
                        <button
                          onClick={() => onQuickAction?.(`${item.id}:${sub}`)}
                          className="w-full text-left px-2 py-1.5 rounded font-mono text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between group"
                        >
                          <span>{sub}</span>
                          <span className="opacity-0 group-hover:opacity-100 text-white transition-opacity">
                            →
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </aside>

      {/* 2. Slim Right Utility Dock */}
      <aside
        className="fixed right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 p-1.5 rounded-lg border border-white/20 bg-black/85 backdrop-blur-md shadow-[0_0_24px_rgba(0,0,0,0.8)]"
        aria-label="Utility Dock"
      >
        {/* Language EN / NE */}
        <button
          onClick={onToggleLanguage}
          title={`Language: ${language.toUpperCase()} (Click to toggle)`}
          className="relative w-10 h-10 flex flex-col items-center justify-center rounded clip-chamfer-sm text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/30 transition-colors cursor-pointer group"
        >
          <Languages className="w-4 h-4" />
          <span className="font-mono text-[8px] font-bold mt-0.5">
            {language.toUpperCase()}
          </span>
        </button>

        {/* Lite Mode Toggle */}
        <button
          onClick={onToggleLite}
          title={`Lite Mode: ${isLite ? 'ON' : 'OFF'} (Low-end GPU Fallback)`}
          className={`relative w-10 h-10 flex flex-col items-center justify-center rounded clip-chamfer-sm transition-colors cursor-pointer ${
            isLite
              ? 'bg-white/20 text-white border border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="font-mono text-[8px] font-bold mt-0.5">
            {isLite ? 'LITE' : '60FPS'}
          </span>
        </button>

        {/* Export GeoJSON */}
        <button
          onClick={() => onQuickAction?.('export_geojson')}
          title="Export Geospatial GeoJSON"
          className="relative w-10 h-10 flex flex-col items-center justify-center rounded clip-chamfer-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span className="font-mono text-[8px] font-bold mt-0.5">GEO</span>
        </button>

        {/* Help / Guide */}
        <button
          onClick={() => onQuickAction?.('help')}
          title="User Manual & Keyboard Shortcuts"
          className="relative w-10 h-10 flex flex-col items-center justify-center rounded clip-chamfer-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="font-mono text-[8px] font-bold mt-0.5">HELP</span>
        </button>
      </aside>

      {/* 3. Bottom-Right Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Radial / Pop-up Action Menu */}
        {isFabOpen && (
          <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => {
                onQuickAction?.('rerun_analysis');
                setIsFabOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/90 border border-white/40 text-white hover:bg-white/20 font-mono text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run Analysis</span>
            </button>
            <button
              onClick={() => {
                onQuickAction?.('fullscreen_map');
                setIsFabOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/90 border border-white/40 text-white hover:bg-white/20 font-mono text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen Map</span>
            </button>
            <button
              onClick={() => {
                onQuickAction?.('share_intel');
                setIsFabOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/90 border border-white/40 text-white hover:bg-white/20 font-mono text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Intel Report</span>
            </button>
          </div>
        )}

        {/* Main Round Action Button */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_0_24px_rgba(255,255,255,0.35)] ${
            isFabOpen
              ? 'bg-slate-300 text-black rotate-45'
              : 'bg-white text-black hover:bg-slate-200 hover:scale-110'
          }`}
          aria-label="Quick Actions"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </>
  );
}
