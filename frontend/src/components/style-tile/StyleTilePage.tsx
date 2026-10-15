import React, { useState, useEffect, useRef } from 'react';
import { HudNavTile } from './HudNavTile';
import { TypewriterTitle } from './TypewriterTitle';
import { ChamferCard } from './ChamferCard';
import { StatFrame } from './StatFrame';
import { MagneticButton } from './MagneticButton';
import { SideDocksTile } from './SideDocksTile';
import { CustomCursor } from './CustomCursor';
import { MonochromeCosmicCanvas } from '../space/MonochromeCosmicCanvas';
import { HeroMissionControl } from '../hero/HeroMissionControl';
import { SceneTransitionCurtain, TransitionType } from '../transitions/SceneTransitionCurtain';
import { Zap, ArrowRight, Play, Eye, Compass, Layers, ShieldCheck, Orbit, Activity, Sparkles, Wind } from 'lucide-react';

interface StyleTilePageProps {
  onSwitchToFullDashboard?: () => void;
}

export function StyleTilePage({ onSwitchToFullDashboard }: StyleTilePageProps) {
  const [activeTab, setActiveTab] = useState('flood');
  const [language, setLanguage] = useState<'en' | 'ne'>('en');
  const [isLite, setIsLite] = useState(false);
  const [titleKey, setTitleKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Parallax and Scroll tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const contentSectionRef = useRef<HTMLDivElement>(null);

  // Phase 3: FPS measurement & Transition States
  const [fps, setFps] = useState<number>(60);
  const [isFPSFallbackActive, setIsFPSFallbackActive] = useState(false);
  const [activeTransition, setActiveTransition] = useState<TransitionType>('NONE');
  const [isTransitionActive, setIsTransitionActive] = useState(false);
  const [isHyperspaceActive, setIsHyperspaceActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to -1 ... 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleScrollToNext = () => {
    contentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Trigger one of the 3 Phase 3 GPU Transitions
  const triggerTransition = (type: TransitionType) => {
    setActiveTransition(type);
    setIsTransitionActive(true);

    if (type === 'T3_HYPERSPACE') {
      setIsHyperspaceActive(true);
      setTimeout(() => setIsHyperspaceActive(false), 550);
    }
  };

  return (
    <div
      className={`min-h-screen w-full relative bg-black text-slate-100 font-sans overflow-x-hidden selection:bg-white/20 ${
        isLite || isFPSFallbackActive ? 'lite' : ''
      }`}
    >
      {/* 1. Desktop Custom Ring Cursor */}
      <CustomCursor />

      {/* 2. Phase 3 GPU Transition Curtain (T1 Mist / T2 Stripes / T3 Flash) */}
      <SceneTransitionCurtain
        transitionType={activeTransition}
        isActive={isTransitionActive}
        onTransitionComplete={() => {
          setIsTransitionActive(false);
          showToast(`Completed ${activeTransition} transition`);
        }}
      />

      {/* 3. Black & White Space Canvas Graphics Engine (Sun, Moon, Planets, Shooting Stars, Asteroids, T3 Stretch) */}
      <MonochromeCosmicCanvas
        parallaxX={mousePos.x}
        parallaxY={mousePos.y}
        isLite={isLite}
        isHyperspaceActive={isHyperspaceActive}
        onFPSUpdate={(currentFPS) => setFps(currentFPS)}
        onFPSFallback={() => {
          setIsFPSFallbackActive(true);
          showToast('Auto-Fallback: Switched starfield to low-particle static mode (FPS < 40)');
        }}
      />

      {/* 4. Pre-rendered Subtle Film Grain Overlay */}
      <div className="fixed inset-0 bg-grain pointer-events-none z-[1]" />

      {/* 5. Toast Notifications */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 px-4 py-2 clip-chamfer-sm border border-white/60 bg-black/95 text-white font-mono text-xs shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-in fade-in slide-in-from-top-2 duration-200">
          ◈ {toastMessage}
        </div>
      )}

      {/* 6. Top Controller Bar: Mode Switching & Phase 3 Showcase Header */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-2.5 border-b border-white/15 bg-black/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-black bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]">
            PHASE 3 ACTIVE
          </span>
          <span className="font-['Michroma'] text-xs uppercase tracking-widest text-slate-200">
            Starfield Auto-Fallback & 3 Transitions
          </span>

          {/* Real-time Measured FPS Counter (Requirement P2/P3) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded font-mono text-[10px] border border-white/20 bg-white/5">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-white font-bold">{fps} FPS</span>
            <span className="text-slate-400">
              {isFPSFallbackActive ? '(FALLBACK ACTIVE)' : '(60FPS GPU)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Transition Trigger Buttons */}
          <button
            onClick={() => triggerTransition('T1_MIST')}
            className="px-2.5 py-1 clip-chamfer-sm border border-white/20 text-slate-300 hover:text-white hover:bg-white/10 font-mono text-[10px] cursor-pointer transition-colors"
            title="T1 Nebula Mist Dissolve (Hero to S1)"
          >
            T1 Mist
          </button>

          <button
            onClick={() => triggerTransition('T2_STRIPES')}
            className="px-2.5 py-1 clip-chamfer-sm border border-white/20 text-slate-300 hover:text-white hover:bg-white/10 font-mono text-[10px] cursor-pointer transition-colors"
            title="T2 Aurora Stripe Curtain (Between Data Slides)"
          >
            T2 Curtain
          </button>

          <button
            onClick={() => triggerTransition('T3_HYPERSPACE')}
            className="px-2.5 py-1 clip-chamfer-sm border border-white/30 bg-white/10 text-white hover:bg-white/20 font-mono text-[10px] cursor-pointer transition-colors"
            title="T3 Hyperspace Stretch (To Report/Validation)"
          >
            T3 Hyperspace
          </button>

          {/* Lite Mode Toggle */}
          <button
            onClick={() => {
              setIsLite(!isLite);
              showToast(isLite ? 'Switched to 60FPS Space Canvas' : 'Activated Lite GPU Fallback Mode');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 clip-chamfer-sm border font-mono text-[10px] cursor-pointer transition-colors ${
              isLite
                ? 'border-white bg-white/20 text-white'
                : 'border-white/30 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{isLite ? 'Lite: ON' : 'Lite: OFF'}</span>
          </button>

          {/* Switch to Full Operational Map Dashboard */}
          {onSwitchToFullDashboard && (
            <button
              onClick={onSwitchToFullDashboard}
              className="flex items-center gap-1.5 px-3 py-1 clip-chamfer-sm bg-white text-black hover:bg-slate-200 font-mono text-[10px] font-bold cursor-pointer transition-all shadow-[0_0_12px_rgba(255,255,255,0.3)] ml-2"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </header>

      {/* 6. Persistent Side Docks */}
      <SideDocksTile
        language={language}
        onToggleLanguage={() => {
          const next = language === 'en' ? 'ne' : 'en';
          setLanguage(next);
          showToast(`Language switched to: ${next.toUpperCase()}`);
        }}
        isLite={isLite}
        onToggleLite={() => setIsLite(!isLite)}
        onQuickAction={(action) => showToast(`Action trigger: ${action}`)}
      />

      {/* 7. PHASE 2 HERO SCENE: Full Screen Mission Control + Parallax + Scroll Dissolve */}
      <HeroMissionControl
        scrollY={scrollY}
        mousePos={mousePos}
        onRunAnalysis={(bbox, date) => showToast(`Executing SAR & Optical analysis for BBox [${bbox}] at ${date}`)}
        onLoadCaseStudy={() => showToast('Loading Trishuli August 2026 ground truth dataset')}
        onScrollToNext={handleScrollToNext}
        onInspectCard={(cardId) => showToast(`Selected Hero Card: ${cardId}`)}
      />

      {/* 8. Main Data Inspection Modules (Unveiled on Scroll) */}
      <div ref={contentSectionRef} className="relative z-20 max-w-6xl mx-auto px-6 pt-12 pb-24 space-y-16">
        {/* Top HUD Nav Showcase */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2 uppercase">
            <span>[TOP HUD NAV // ANGULAR NOTCHED ENDS & TELEMETRY BADGE]</span>
            <span>ACTIVE TAB: {activeTab.toUpperCase()}</span>
          </div>
          <HudNavTile
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              showToast(`HUD Nav Switched to: ${tab.toUpperCase()}`);
            }}
            onPillClick={() => showToast('Run Trishuli Live triggered')}
          />
        </section>

        {/* Typewriter Sticky Title */}
        <section className="pt-4 pb-2 border-b border-white/15">
          <div className="text-xs font-mono text-slate-400 mb-4 uppercase text-center">
            [ZERO-CLS TYPEWRITER SECTION TITLE WITH CELESTIAL DIAMONDS]
          </div>
          <TypewriterTitle
            key={titleKey}
            title={
              language === 'en'
                ? 'FLOOD DAMAGE TELEMETRY'
                : 'बाढी क्षति मापन प्रणाली'
            }
            subtitle={
              language === 'en'
                ? 'HIGH-CONTRAST SATELLITE RADAR DAMAGE MAPPING · AUGUST 2026 TRISHULI'
                : 'उपग्रह राडार क्षति नक्साङ्कन · अगस्ट २०२६ त्रिशूली'
            }
            speedMs={26}
          />
        </section>

        {/* Stat Frames Section: Strict Color Code & Count-up Animation */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Michroma'] text-sm tracking-wider uppercase text-white flex items-center gap-2">
              <span className="text-white">◈</span>
              <span>[CHAMFERED NUMERIC STAT FRAMES (EASED COUNT-UP + STRICT COLOR CODING)]</span>
            </h3>
            <span className="font-mono text-xs text-slate-400">
              STRICT: RED (CONFIRMED) | AMBER (CUT-OFF) | WHITE/GREY (TELEMETRY)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatFrame
              label="Bridge Failures"
              targetValue={4}
              suffix="CRITICAL"
              status="confirmed"
              subtitle="Confirmed structural severance via Sentinel-1 SAR coherence drop"
            />
            <StatFrame
              label="Cut-off Settlements"
              targetValue={7}
              suffix="ISOLATED"
              status="likely"
              subtitle="No remaining road traversal to Level-3 medical or district HQ"
            />
            <StatFrame
              label="Debris Candidates"
              targetValue={14}
              suffix="CELLS"
              status="uncertain"
              subtitle="Slope > 18° shadow anomaly requiring ground UAV check"
            />
            <StatFrame
              label="Sentinel-1 Orbit Pair"
              targetValue={100}
              suffix="% SYNC"
              status="nominal"
              subtitle="Relative orbit 085 ascending match; baseline 38m"
            />
          </div>
        </section>

        {/* 3D Chamfered Cards Showcase: Tilt, Crest, Sliding Overlay, Conic Border */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Michroma'] text-sm tracking-wider uppercase text-white flex items-center gap-2">
              <span className="text-white">◈</span>
              <span>[3D TILT CHAMFERED CARDS WITH ROTATING SHIMMER & CRESTS]</span>
            </h3>
            <span className="font-mono text-xs text-slate-400">
              HOVER TO TEST 6° TILT + CONIC ROTATING SHIMMER + SLIDE OVERLAY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            {/* Card 1: SAR Coherence */}
            <ChamferCard
              title="SAR Coherence"
              tag="COPERNICUS S1"
              tagType="ice"
              geometricCrestType="constellation"
              metric="0.84 IoU"
              metricLabel="EMSR927 Verification Score"
              description="Sentinel-1 IW VV/VH interferometric pair processed with RTC and 15-degree radar shadow mask."
              statusText="NOMINAL COHERENCE"
              isLite={isLite}
              onInspect={() => showToast('Inspecting Sentinel-1 SAR Coherence Layer')}
              onFlyTo={() => showToast('Flying camera to Trishuli Gorge S1 BBox')}
            />

            {/* Card 2: Trishuli Bridge B4 */}
            <ChamferCard
              title="Trishuli B4 Bridge"
              tag="CONFIRMED SEVERED"
              tagType="red"
              geometricCrestType="crystal"
              metric="48.5m"
              metricLabel="Span Submerged in Surge"
              description="Primary steel truss bridge at Bhetrawati connecting 7 highland villages. Flow velocity exceeded 4.2 m/s."
              statusText="STRUCTURAL FAILURE"
              isLite={isLite}
              onInspect={() => showToast('Opening Sub-Pixel Evidence Lens for Bridge B4')}
              onFlyTo={() => showToast('Flying camera to Bhetrawati Bridge coordinates')}
            />

            {/* Card 3: Isolation Graph Analysis */}
            <ChamferCard
              title="Highland Corridor"
              tag="WARNING ISOLATION"
              tagType="amber"
              geometricCrestType="orbital"
              metric="7 Settlements"
              metricLabel="Cut Off from Hospital"
              description="Network reachability graph traversed downstream. Alternative footpaths obstructed by debris deposits."
              statusText="GRAPH CUT DETECTED"
              isLite={isLite}
              onInspect={() => showToast('Inspecting Network Topology Breakdown')}
              onFlyTo={() => showToast('Flying camera to Mailung-Syabrubesi Chokepoint')}
            />
          </div>
        </section>

        {/* Magnetic Buttons & Interactive Controls Gallery */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Michroma'] text-sm tracking-wider uppercase text-white flex items-center gap-2">
              <span className="text-white">◈</span>
              <span>[MAGNETIC BUTTONS (6PX CURSOR ATTRACTION + CHAMFERED HIGHLIGHTS)]</span>
            </h3>
            <span className="font-mono text-xs text-slate-400">
              MOVE CURSOR NEAR BUTTONS TO TEST MAGNETIC PULL
            </span>
          </div>

          <div className="p-6 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md flex flex-wrap items-center justify-around gap-4">
            <div className="flex flex-col items-center gap-2">
              <MagneticButton
                variant="inspect"
                icon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => showToast('Clicked Inspect Magnetic Button')}
              >
                Inspect Layer
              </MagneticButton>
              <span className="font-mono text-[10px] text-slate-400">Variant: Inspect</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <MagneticButton
                variant="flyto"
                icon={<Compass className="w-3.5 h-3.5" />}
                onClick={() => showToast('Clicked Fly To Magnetic Button')}
              >
                Fly to Feature
              </MagneticButton>
              <span className="font-mono text-[10px] text-slate-300">Variant: Fly To</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <MagneticButton
                variant="action"
                icon={<Layers className="w-3.5 h-3.5" />}
                onClick={() => showToast('Clicked Analysis Trigger Button')}
              >
                Compute Graph Cut
              </MagneticButton>
              <span className="font-mono text-[10px] text-slate-400">Variant: Action</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <MagneticButton
                variant="flyto"
                icon={<Play className="w-3.5 h-3.5" />}
                onClick={() => showToast('Triggering Mission Replay')}
              >
                Replay Surge
              </MagneticButton>
              <span className="font-mono text-[10px] text-slate-300">Variant: Replay</span>
            </div>
          </div>
        </section>

        {/* Phase 3 GPU Transition Engine Showcase */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Michroma'] text-sm tracking-wider uppercase text-white flex items-center gap-2">
              <span className="text-white">◈</span>
              <span>[PHASE 3: GPU TRANSITION SHADERS & STARFIELD ENGINE]</span>
            </h3>
            <span className="font-mono text-xs text-slate-400">
              CUBIC-BEZIER(0.22, 1, 0.36, 1) · MAX 700MS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* T1 Mist Dissolve */}
            <div className="p-5 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="font-mono text-[10px] text-slate-400">T1 SHADER</span>
                  <Wind className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-['Michroma'] text-xs font-bold uppercase text-white mb-1">
                  Nebula Mist Dissolve
                </h4>
                <p className="font-mono text-[11px] text-slate-300 leading-relaxed">
                  Two layered radial-gradient mist layers fade and scale in while the outgoing scene dissolves; incoming scene fades in with a 20px upward translate. Pre-rendered gradients only.
                </p>
              </div>
              <MagneticButton
                variant="inspect"
                onClick={() => triggerTransition('T1_MIST')}
                className="w-full"
              >
                Trigger T1 Mist
              </MagneticButton>
            </div>

            {/* T2 Aurora Stripe Curtain */}
            <div className="p-5 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="font-mono text-[10px] text-slate-400">T2 SHADER</span>
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-['Michroma'] text-xs font-bold uppercase text-white mb-1">
                  Stripe Curtain Wipe
                </h4>
                <p className="font-mono text-[11px] text-slate-300 leading-relaxed">
                  10 vertical monochromatic stripes sweep with translateY, staggered by 28ms, covering for 280ms then smoothly revealing without empty card frames.
                </p>
              </div>
              <MagneticButton
                variant="inspect"
                onClick={() => triggerTransition('T2_STRIPES')}
                className="w-full"
              >
                Trigger T2 Curtain
              </MagneticButton>
            </div>

            {/* T3 Hyperspace Stretch */}
            <div className="p-5 clip-chamfer-md border border-white/20 bg-black/85 backdrop-blur-md flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="font-mono text-[10px] text-slate-400">T3 SHADER</span>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-['Michroma'] text-xs font-bold uppercase text-white mb-1">
                  Hyperspace Radial Stretch
                </h4>
                <p className="font-mono text-[11px] text-slate-300 leading-relaxed">
                  Starfield points elongate along the radial motion axis for 400ms inside the existing canvas with zero extra DOM elements or video overhead.
                </p>
              </div>
              <MagneticButton
                variant="flyto"
                onClick={() => triggerTransition('T3_HYPERSPACE')}
                className="w-full"
              >
                Trigger T3 Hyperspace
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* Footer Strip */}
        <footer className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4 font-mono text-[11px] text-slate-400">
          <div>
            <div className="font-['Michroma'] text-xs text-white font-bold">
              FLOODSAT RESCUE CONSOLE // TEAM RESCUEGRAPH
            </div>
            <div>
              Multimodal AI Hackathon 2026 — Track B: Flood Damage from Satellite Data
            </div>
            <div className="text-[10px] text-slate-400">
              Reference checking: Copernicus Emergency Management Service data (EMSR927)
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 clip-badge border border-white/30 text-white bg-white/10">
              60 FPS MONOCHROME COSMIC ENGINE
            </span>
            <span className="px-2.5 py-1 clip-badge border border-white/30 text-slate-200 bg-white/5">
              ZERO-LAG MOTION
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
