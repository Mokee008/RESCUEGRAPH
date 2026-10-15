import React, { useState, useEffect, useRef } from 'react';
import { MonochromeCosmicCanvas } from '../space/MonochromeCosmicCanvas';
import { SceneTransitionCurtain, TransitionType } from '../transitions/SceneTransitionCurtain';
import { HudNavTile } from '../style-tile/HudNavTile';
import { SideDocksTile } from '../style-tile/SideDocksTile';
import { CustomCursor } from '../style-tile/CustomCursor';
import { ProfessionalSatelliteMap } from '../map/ProfessionalSatelliteMap';
import { api } from '../../services/api';
import {
  DamageSummary,
  ConnectivityResult,
  SegmentationLayers,
  SensorStatus,
  FloodPathResult,
} from '../../types';

// Slides
import { S0_HeroSlide } from './S0_HeroSlide';
import { S1_FloodSlide } from './S1_FloodSlide';
import { S2_DamageSlide } from './S2_DamageSlide';
import { S3_CutOffSlide } from './S3_CutOffSlide';
import { S4_FloodPathSlide } from './S4_FloodPathSlide';
import { S5_ReportSlide } from './S5_ReportSlide';
import { S6_ValidationSlide } from './S6_ValidationSlide';

// I18n & Keyboard
import { translations } from '../../i18n/translations';
import { KeyboardShortcutsModal } from '../navigation/KeyboardShortcutsModal';

interface SlideDeckOrchestratorProps {
  onSwitchToClassicConsole?: () => void;
}

export function SlideDeckOrchestrator({ onSwitchToClassicConsole }: SlideDeckOrchestratorProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [language, setLanguage] = useState<'en' | 'ne'>('en');
  const [isLite, setIsLite] = useState(false);
  const [fps, setFps] = useState(60);
  const [isFPSFallbackActive, setIsFPSFallbackActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Transitions
  const [activeTransition, setActiveTransition] = useState<TransitionType>('NONE');
  const [isTransitionActive, setIsTransitionActive] = useState(false);
  const [isHyperspaceActive, setIsHyperspaceActive] = useState(false);

  // Mouse Parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Map and Analytical State
  const [damage, setDamage] = useState<DamageSummary | null>(null);
  const [connectivity, setConnectivity] = useState<ConnectivityResult | null>(null);
  const [segmentation, setSegmentation] = useState<SegmentationLayers | null>(null);
  const [sensors, setSensors] = useState<SensorStatus | null>(null);
  const [floodPath, setFloodPath] = useState<FloodPathResult | null>(null);
  const [isMap3D, setIsMap3D] = useState(false);
  const [mapMode, setMapMode] = useState<'NORMAL' | 'DISASTER' | 'ANALYSIS'>('DISASTER');
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [flyToTarget, setFlyToTarget] = useState<{ center: [number, number]; zoom?: number; pitch?: number; bearing?: number } | null>(null);

  const t = translations[language];

  // Slide Metadata for Progress Rail
  const slideMeta = [
    { id: 0, key: 'hero', label: t.nav.hero },
    { id: 1, key: 'flood', label: t.nav.flood },
    { id: 2, key: 'damage', label: t.nav.damage },
    { id: 3, key: 'cutoff', label: t.nav.cutoff },
    { id: 4, key: 'path', label: t.nav.path },
    { id: 5, key: 'report', label: t.nav.report },
    { id: 6, key: 'validation', label: t.nav.validation },
  ];

  // Fetch Analytical Data on Initial Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [damageData, connData, segData, sensorData] = await Promise.all([
          api.getDamageSummary().catch(() => null),
          api.getGraphConnectivity().catch(() => null),
          api.getSegmentationLayers().catch(() => null),
          api.getSensorStatus().catch(() => null),
        ]);
        if (damageData) setDamage(damageData);
        if (connData) setConnectivity(connData);
        if (segData) setSegmentation(segData);
        if (sensorData) setSensors(sensorData);
      } catch (e) {
        console.error('Error fetching backend data:', e);
      }
    };
    fetchData();
  }, []);

  // Mouse move listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Navigate to slide with appropriate transition shader
  const goToSlide = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex > 6 || targetIndex === currentSlide) return;

    let transition: TransitionType = 'T2_STRIPES';
    if (currentSlide === 0 && targetIndex === 1) {
      transition = 'T1_MIST';
    } else if (targetIndex === 5 || targetIndex === 6) {
      transition = 'T3_HYPERSPACE';
      setIsHyperspaceActive(true);
      setTimeout(() => setIsHyperspaceActive(false), 550);
    }

    setActiveTransition(transition);
    setIsTransitionActive(true);
    setCurrentSlide(targetIndex);

    // Adjust map mode based on slide
    if (targetIndex === 1) setMapMode('NORMAL');
    else if (targetIndex === 2) setMapMode('DISASTER');
    else if (targetIndex === 3) setMapMode('DISASTER');
    else if (targetIndex === 4) setMapMode('ANALYSIS');
  };

  // Keyboard Navigation: Arrows, PageUp/PageDown, 0-6, L (Lite), N (Nepali), ? (Help)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keyboard inside input fields
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        goToSlide(Math.min(6, currentSlide + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        goToSlide(Math.max(0, currentSlide - 1));
      } else if (e.key >= '0' && e.key <= '6') {
        goToSlide(parseInt(e.key, 10));
      } else if (e.key >= '1' && e.key <= '7') {
        // Also support 1-indexed number keys per spec
        goToSlide(parseInt(e.key, 10) - 1);
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLite((prev) => {
          showToast(!prev ? 'Activated Lite Mode (No tilt/blur)' : 'Returned to 60FPS Mode');
          return !prev;
        });
      } else if (e.key === 'n' || e.key === 'N') {
        setLanguage((prev) => {
          const next = prev === 'en' ? 'ne' : 'en';
          showToast(`Language: ${next.toUpperCase()}`);
          return next;
        });
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setIsHelpOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsHelpOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const settlementsList = connectivity?.settlements || damage?.settlements || [];
  const roadsList = damage?.roads || [];
  const bridgesList = damage?.bridges || [];

  const handleExportGeoJSON = () => {
    const geojsonData = {
      type: 'FeatureCollection',
      name: 'FloodSat_Trishuli_Telemetry_2026',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: [
        ...(damage?.bridges || []).map((b) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: b.coordinates },
          properties: {
            id: b.id,
            name: b.name,
            status: b.status,
            length_m: b.length_m,
            confidence: b.evidence?.model_confidence,
            satellite_evidence: b.evidence?.satellite_evidence,
          },
        })),
        ...(damage?.roads || []).map((r) => ({
          type: 'Feature',
          geometry: {
            type: Array.isArray(r.coordinates[0]) ? 'LineString' : 'Point',
            coordinates: r.coordinates,
          },
          properties: { id: r.id, name: r.name, status: r.status, length_km: r.length_km },
        })),
        ...(connectivity?.settlements || damage?.settlements || []).map((s) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: s.coordinates },
          properties: {
            id: s.id,
            name: s.name,
            status: s.connectivity_status,
            population: s.population_est,
            cause: s.disconnect_cause,
          },
        })),
      ],
    };
    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floodsat_trishuli_vector_${Date.now()}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported Trishuli GeoJSON FeatureCollection');
  };

  return (
    <div
      className={`relative w-screen h-screen bg-black text-slate-100 font-sans overflow-hidden selection:bg-white/20 select-none ${
        isLite || isFPSFallbackActive ? 'lite' : ''
      }`}
    >
      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* 1. Desktop Custom Ring Cursor */}
      <CustomCursor />

      {/* 2. Phase 3 GPU Transition Curtain */}
      <SceneTransitionCurtain
        transitionType={activeTransition}
        isActive={isTransitionActive}
        onTransitionComplete={() => setIsTransitionActive(false)}
      />

      {/* 3. Black & White Cosmic Space Engine (Sun, Moon, Planets, Meteors, Asteroids, T3 Radial Stretch) */}
      <MonochromeCosmicCanvas
        parallaxX={mousePos.x}
        parallaxY={mousePos.y}
        isLite={isLite}
        isHyperspaceActive={isHyperspaceActive}
        isMapDragging={isMapDragging}
        onFPSUpdate={(currentFPS) => setFps(currentFPS)}
        onFPSFallback={() => {
          setIsFPSFallbackActive(true);
          showToast('Auto-Fallback: Lowered starfield particles (FPS < 40)');
        }}
      />

      {/* 4. Pre-rendered Subtle Film Grain Overlay */}
      <div className="fixed inset-0 bg-grain pointer-events-none z-[1]" />

      {/* 5. Persistent Single-Mount MapLibre Engine (Slides S1 - S6) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 z-[2] ${
          currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-85 pointer-events-auto'
        }`}
      >
        <ProfessionalSatelliteMap
          settlements={settlementsList}
          roads={roadsList}
          bridges={bridgesList}
          floodPath={floodPath}
          activeRescueRoute={null}
          is3D={isMap3D}
          setIs3D={setIsMap3D}
          language={language}
          mapMode={mapMode}
          setMapMode={setMapMode}
          currentSlideIndex={currentSlide}
          flyToTarget={flyToTarget}
          onMapDragStateChange={(dragging) => setIsMapDragging(dragging)}
          onSelectFeature={(feat) => showToast(`Map Focus: ${feat?.data?.name || feat?.type}`)}
          onTraceTrigger={async () => {
            try {
              const res = await api.traceFloodPath();
              setFloodPath(res);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      </div>

      {/* 6. Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-14 z-50 px-4 py-2 clip-chamfer-sm border border-white/60 bg-black/95 text-white font-mono text-xs shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-in fade-in slide-in-from-top-2 duration-200">
          ◈ {toastMessage}
        </div>
      )}

      {/* 7. Persistent Top HUD Nav Bar */}
      <div className="fixed top-3 inset-x-0 z-40 px-6 pointer-events-auto">
        <HudNavTile
          activeTab={slideMeta[currentSlide]?.key || 'hero'}
          language={language}
          onTabChange={(tabKey) => {
            const found = slideMeta.find((s) => s.key === tabKey);
            if (found) goToSlide(found.id);
          }}
          onPillClick={() => {
            goToSlide(1);
            showToast('Loading Trishuli 2026 Flood Basin');
          }}
        />
      </div>

      {/* 8. Persistent Left Navigation Dock */}
      <SideDocksTile
        language={language}
        onToggleLanguage={() => {
          const next = language === 'en' ? 'ne' : 'en';
          setLanguage(next);
          showToast(`Language: ${next.toUpperCase()}`);
        }}
        isLite={isLite}
        onToggleLite={() => setIsLite(!isLite)}
        onQuickAction={(action) => {
          if (action.startsWith('home')) goToSlide(0);
          else if (action.startsWith('layers')) goToSlide(1);
          else if (action.startsWith('report')) goToSlide(5);
          else if (action.startsWith('validation')) goToSlide(6);
          else if (action.startsWith('about')) goToSlide(6);
          else if (action === 'help') setIsHelpOpen(true);
          else if (action === 'export_geojson') handleExportGeoJSON();
          else if (action === 'fullscreen_map') showToast('Fullscreen Map mode active');
          else if (action === 'rerun_analysis') {
            goToSlide(1);
            showToast('Re-running Sentinel-1 orbital analysis');
          } else {
            showToast(`Action: ${action}`);
          }
        }}
      />

      {/* 9. Right Edge Progress Rail (Dots & Quick Jump) */}
      <aside
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 py-3 px-2 rounded-full border border-white/15 bg-black/80 backdrop-blur-md shadow-lg pointer-events-auto"
        aria-label="Slide Progress Rail"
      >
        {slideMeta.map((slide) => {
          const isActive = currentSlide === slide.id;
          return (
            <button
              key={slide.id}
              onClick={() => goToSlide(slide.id)}
              title={`${slide.label} (Press ${slide.id})`}
              className="group relative flex items-center justify-end cursor-pointer"
            >
              {/* Flyout Label on Rail Hover */}
              <span className="absolute right-6 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider text-white bg-black/90 border border-white/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {slide.label}
              </span>

              {/* Progress Dot */}
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-3 h-3 bg-white shadow-[0_0_10px_#ffffff] scale-125'
                    : 'bg-slate-600 hover:bg-slate-400'
                }`}
              />
            </button>
          );
        })}
      </aside>

      {/* 10. Main Active Slide Presentation Container */}
      <main className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden">
        {currentSlide === 0 && (
          <S0_HeroSlide
            language={language}
            onRunAnalysis={(bbox, date) => {
              showToast(`Analysis triggered for ${bbox}`);
              goToSlide(1);
            }}
            onLoadCaseStudy={() => {
              goToSlide(1);
              showToast('Loading August 2026 Trishuli Ground Truth');
            }}
            onNextSlide={() => goToSlide(1)}
            mousePos={mousePos}
          />
        )}

        {currentSlide === 1 && (
          <S1_FloodSlide
            language={language}
            segmentation={segmentation}
            onFlyToTrishuli={() => {
              setFlyToTarget({ center: [85.24, 28.05], zoom: 12.8, pitch: 42 });
              showToast('Flying camera to Trishuli Basin [85.24, 28.05]');
            }}
          />
        )}

        {currentSlide === 2 && (
          <S2_DamageSlide
            language={language}
            damage={damage}
            onSelectAsset={(asset) => showToast(`Inspecting: ${asset.name}`)}
            onFlyToAsset={(asset) => {
              setFlyToTarget({
                center: asset.coordinates as [number, number],
                zoom: 15.4,
                pitch: 52,
                bearing: 20,
              });
              showToast(`Flying camera to: ${asset.name}`);
            }}
          />
        )}

        {currentSlide === 3 && (
          <S3_CutOffSlide
            language={language}
            connectivity={connectivity}
            onHighlightBreakingPoint={(bridgeId) => {
              setFlyToTarget({ center: [85.183, 27.978], zoom: 15.8, pitch: 55, bearing: 30 });
              showToast(`Highlighted Chokepoint: ${bridgeId}`);
            }}
            onFlyToSettlement={(settlement) => {
              setFlyToTarget({
                center: settlement.coordinates as [number, number],
                zoom: 14.2,
                pitch: 45,
                bearing: -10,
              });
              showToast(`Flying to: ${settlement.name}`);
            }}
          />
        )}

        {currentSlide === 4 && (
          <S4_FloodPathSlide
            language={language}
            floodPath={floodPath}
            onTracePath={async (coords) => {
              try {
                const pathRes = await api.traceFloodPath(coords);
                setFloodPath(pathRes);
                setFlyToTarget({ center: coords, zoom: 13.5, pitch: 45, bearing: -20 });
                showToast('D8 Flow Path Trace Complete');
              } catch (e) {
                console.error(e);
              }
            }}
            onFlyToPath={() => {
              setFlyToTarget({ center: [85.31, 28.15], zoom: 13.0, pitch: 48, bearing: -25 });
              showToast('Following Flow Path descent');
            }}
          />
        )}

        {currentSlide === 5 && (
          <S5_ReportSlide
            language={language}
          />
        )}

        {currentSlide === 6 && (
          <S6_ValidationSlide
            language={language}
          />
        )}
      </main>

      {/* 11. Bottom Slide Index & Controls Banner with Contact/Team Strip */}
      <footer className="fixed bottom-3 inset-x-8 z-30 flex items-center justify-between font-mono text-[10px] text-slate-400 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className="px-2 py-0.5 rounded bg-black/80 border border-white/15 text-white">
            SLIDE {currentSlide + 1} / 7
          </span>
          <span className="hidden sm:inline">KEYBOARD: [0-6] OR [ARROWS]</span>
        </div>

        {/* Contact / Team Strip (Requirement 8) */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-[9px] text-slate-400 pointer-events-auto">
          <span className="text-slate-300">TEAM FLOODSAT // TRACK B</span>
          <span className="text-white/20">◈</span>
          <span>TRISHULI AUGUST 2026</span>
          <span className="text-white/20">◈</span>
          <span className="text-slate-300 hover:text-white transition-colors cursor-pointer" title="Contact Operations Team">OPS@FLOODSAT.SPACE</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {onSwitchToClassicConsole && (
            <button
              onClick={onSwitchToClassicConsole}
              className="px-2.5 py-1 rounded bg-black/80 border border-white/20 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            >
              {translations[language].actions.classicView}
            </button>
          )}

          <button
            onClick={() => goToSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-2 py-1 rounded bg-black/80 border border-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 cursor-pointer"
          >
            {translations[language].actions.prev}
          </button>
          <button
            onClick={() => goToSlide(Math.min(6, currentSlide + 1))}
            disabled={currentSlide === 6}
            className="px-2 py-1 rounded bg-white text-black font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 cursor-pointer"
          >
            {translations[language].actions.next}
          </button>
        </div>
      </footer>
    </div>
  );
}
