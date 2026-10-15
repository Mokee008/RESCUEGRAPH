import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import {
  DamageSummary,
  ConnectivityResult,
  SegmentationLayers,
  SensorStatus,
  FloodPathResult,
  InfrastructureEvidence,
  Settlement,
} from './types';
import { HeaderBar } from './components/dashboard/HeaderBar';
import { NavRail } from './components/navigation/NavRail';
import { ProfessionalSatelliteMap } from './components/map/ProfessionalSatelliteMap';
import { ContextIntelligencePanel } from './components/panels/ContextIntelligencePanel';
import { EvidenceLensModal } from './components/panels/EvidenceLensModal';
import { WhatIfSimulatorModal } from './components/panels/WhatIfSimulatorModal';
import { FloodPathTracerPanel } from './components/panels/FloodPathTracerPanel';
import { RescueRoutePlannerModal } from './components/panels/RescueRoutePlannerModal';
import { CopilotDrawer } from './components/panels/CopilotDrawer';
import { DisasterReplayBar } from './components/panels/DisasterReplayBar';
import { ValidationModal } from './components/panels/ValidationModal';
import { SituationReportModal } from './components/panels/SituationReportModal';
import { DemoTourModal } from './components/panels/DemoTourModal';
import { StartupSequence } from './components/startup/StartupSequence';
import { StyleTilePage } from './components/style-tile/StyleTilePage';
import { SlideDeckOrchestrator } from './components/slides/SlideDeckOrchestrator';

export function App() {
  // View mode: Default to 'slides' for Phase 4 slide deck presentation
  const [viewMode, setViewMode] = useState<'slides' | 'style-tile' | 'dashboard'>('slides');

  // Domain analytical state
  const [damage, setDamage] = useState<DamageSummary | null>(null);
  const [connectivity, setConnectivity] = useState<ConnectivityResult | null>(null);
  const [segmentation, setSegmentation] = useState<SegmentationLayers | null>(null);
  const [sensors, setSensors] = useState<SensorStatus | null>(null);
  const [floodPath, setFloodPath] = useState<FloodPathResult | null>(null);
  const [activeRescueRoute, setActiveRescueRoute] = useState<any | null>(null);

  // UI state
  const [activeNavTab, setActiveNavTab] = useState<string>('map');
  const [language, setLanguage] = useState<'en' | 'ne'>('en');
  const [is3D, setIs3D] = useState(false);
  const [mapMode, setMapMode] = useState<'NORMAL' | 'DISASTER' | 'ANALYSIS'>('DISASTER');

  // Selected object for context panel and evidence lens
  const [selectedFeature, setSelectedFeature] = useState<{
    type: string;
    data: any;
    evidence: InfrastructureEvidence;
  } | null>(null);

  // Modals & Panels
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);
  const [isFloodTracerOpen, setIsFloodTracerOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [hasStartedUp, setHasStartedUp] = useState(false);

  // Fetch initial analytical data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [damageData, connData, segData, sensorData] = await Promise.all([
          api.getDamageSummary(),
          api.getGraphConnectivity(),
          api.getSegmentationLayers(),
          api.getSensorStatus(),
        ]);
        setDamage(damageData);
        setConnectivity(connData);
        setSegmentation(segData);
        setSensors(sensorData);
      } catch (err) {
        console.error('Failed to load initial disaster intelligence state:', err);
      }
    };
    fetchData();
  }, []);

  // Handle Simulation Result
  const handleApplySimulation = (simData: any) => {
    if (simData.simulated_settlements) {
      setConnectivity((prev) =>
        prev
          ? {
              ...prev,
              summary: simData.simulated_summary,
              settlements: simData.simulated_settlements,
              network_edges: simData.simulated_network_edges,
            }
          : prev
      );
    }
  };

  // Handle Copilot Action Triggers
  const handleCopilotAction = async (action: string) => {
    if (action === 'HIGHLIGHT_CUT_OFF') {
      setMapMode('DISASTER');
    } else if (action === 'HIGHLIGHT_BRIDGES') {
      setMapMode('DISASTER');
    } else if (action === 'DRAW_FLOOD_PATH') {
      try {
        const pathData = await api.traceFloodPath();
        setFloodPath(pathData);
        setIsFloodTracerOpen(true);
      } catch (e) {
        console.error(e);
      }
    } else if (action === 'TRIGGER_SIMULATION') {
      setIsSimulationOpen(true);
    }
  };

  // Handle 3-Minute Demo Pitch Step Triggers
  const handleDemoStepTrigger = async (stepIdx: number) => {
    switch (stepIdx) {
      case 0: // Normal baseline
        setMapMode('NORMAL');
        setIs3D(false);
        break;
      case 1: // Flood surge
        setMapMode('DISASTER');
        break;
      case 2: // AI Segmentation
        setMapMode('ANALYSIS');
        break;
      case 3: // Damage
      case 4: // Graph Connectivity
      case 5: // Isolation Radar
        setMapMode('DISASTER');
        break;
      case 6: // Evidence Lens on Bridge B4
        if (damage) {
          const b4 = damage.bridges.find((b) => b.id === 'bridge_B4');
          if (b4) {
            setSelectedFeature({
              type: 'Bridge',
              data: b4,
              evidence: b4.evidence,
            });
            setIsEvidenceOpen(true);
          }
        }
        break;
      case 7: // Simulate Bridge B4 Failure
      case 8: // Simulate Restoration
        setIsEvidenceOpen(false);
        setIsSimulationOpen(true);
        break;
      case 9: // AI Copilot
        setIsSimulationOpen(false);
        setIsCopilotOpen(true);
        break;
      case 10: // Situation Report
        setIsCopilotOpen(false);
        setIsReportOpen(true);
        break;
      case 11: // 3D Disaster Twin
        setIsReportOpen(false);
        setIs3D(true);
        break;
      default:
        break;
    }
  };

  const settlementsList = connectivity?.settlements || damage?.settlements || [];
  const roadsList = damage?.roads || [];
  const bridgesList = damage?.bridges || [];

  // Phase 4: Slide Deck Experience (S0 through S6)
  if (viewMode === 'slides') {
    return (
      <SlideDeckOrchestrator
        onSwitchToClassicConsole={() => setViewMode('dashboard')}
      />
    );
  }

  // Phase 1 Style Tile Showcase View
  if (viewMode === 'style-tile') {
    return (
      <StyleTilePage
        onSwitchToFullDashboard={() => setViewMode('slides')}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#070b14] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 1. Cinematic Startup Sequence (1.5s) */}
      {!hasStartedUp && <StartupSequence onComplete={() => setHasStartedUp(true)} />}

      {/* 2. Top Global Header Bar */}
      <HeaderBar
        sensors={sensors}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenValidation={() => setIsValidationOpen(true)}
        onStartDemoTour={() => setIsDemoTourOpen(true)}
        language={language}
        onSwitchToStyleTile={() => setViewMode('style-tile')}
      />

      {/* 3. Main Operational Command Center Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Minimal Vertical Navigation Rail */}
        <NavRail
          activeTab={activeNavTab}
          setActiveTab={(tab) => {
            setActiveNavTab(tab);
            if (tab === 'simulation') setIsSimulationOpen(true);
            else if (tab === 'routes') setIsRoutePlannerOpen(true);
            else if (tab === 'damage') setMapMode('DISASTER');
            else if (tab === 'isolation') setMapMode('DISASTER');
            else if (tab === 'overview') setMapMode('NORMAL');
          }}
          language={language}
          setLanguage={setLanguage}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenValidation={() => setIsValidationOpen(true)}
          onStartDemoTour={() => setIsDemoTourOpen(true)}
          onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
          isCopilotOpen={isCopilotOpen}
        />

        {/* Center: Professional Satellite Map Engine (The Hero) */}
        <main className="flex-1 relative h-full">
          <ProfessionalSatelliteMap
            settlements={settlementsList}
            roads={roadsList}
            bridges={bridgesList}
            floodPath={floodPath}
            activeRescueRoute={activeRescueRoute}
            is3D={is3D}
            setIs3D={setIs3D}
            onSelectFeature={(feat) => setSelectedFeature(feat)}
            language={language}
            mapMode={mapMode}
            setMapMode={setMapMode}
            selectedFeatureId={selectedFeature?.data?.id}
            onTraceTrigger={async () => {
              try {
                const pathData = await api.traceFloodPath();
                setFloodPath(pathData);
                setIsFloodTracerOpen(true);
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </main>

        {/* Right: Context-Sensitive Intelligence Panel (Progressive Disclosure) */}
        <ContextIntelligencePanel
          selectedFeature={selectedFeature}
          onClearSelection={() => setSelectedFeature(null)}
          damage={damage}
          connectivity={connectivity}
          segmentation={segmentation}
          onOpenEvidence={() => setIsEvidenceOpen(true)}
          onOpenSimulation={() => setIsSimulationOpen(true)}
          onOpenRoutePlanner={() => setIsRoutePlannerOpen(true)}
          onOpenFloodTracer={async () => {
            try {
              const pathData = await api.traceFloodPath();
              setFloodPath(pathData);
              setIsFloodTracerOpen(true);
            } catch (e) {
              console.error(e);
            }
          }}
          language={language}
        />
      </div>

      {/* 4. Bottom Cinematic Disaster Replay Timeline Strip */}
      <DisasterReplayBar
        onStageChange={(stage) => {
          if (stage === 'BEFORE') setMapMode('NORMAL');
          else if (stage === 'EVENT') setMapMode('DISASTER');
          else if (stage === 'AFTER') setMapMode('ANALYSIS');
          else if (stage === 'DAMAGE') setMapMode('DISASTER');
          else if (stage === 'ISOLATION') setMapMode('DISASTER');
          else if (stage === 'SCENARIO') setIsSimulationOpen(true);
        }}
        language={language}
      />

      {/* MODALS & DRAWERS */}

      {/* Sub-Pixel Evidence Lens */}
      {isEvidenceOpen && selectedFeature && (
        <EvidenceLensModal
          feature={selectedFeature}
          onClose={() => setIsEvidenceOpen(false)}
          language={language}
        />
      )}

      {/* What-If Rescue Simulator */}
      {isSimulationOpen && (
        <WhatIfSimulatorModal
          onClose={() => setIsSimulationOpen(false)}
          onApplySimulation={handleApplySimulation}
          language={language}
        />
      )}

      {/* Downstream Flood Path Tracer (Bonus) */}
      {isFloodTracerOpen && (
        <FloodPathTracerPanel
          floodPath={floodPath}
          onClose={() => setIsFloodTracerOpen(false)}
          language={language}
        />
      )}

      {/* Rescue Route Planner */}
      {isRoutePlannerOpen && (
        <RescueRoutePlannerModal
          settlements={settlementsList}
          onClose={() => setIsRoutePlannerOpen(false)}
          onApplyRoute={(routeData) => {
            setActiveRescueRoute(routeData);
            setIsRoutePlannerOpen(false);
          }}
          language={language}
        />
      )}

      {/* Bilingual AI Rescue Copilot */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        language={language}
        onActionTrigger={handleCopilotAction}
      />

      {/* Copernicus EMSR927 Air-Gapped Validation Modal */}
      {isValidationOpen && (
        <ValidationModal
          onClose={() => setIsValidationOpen(false)}
          language={language}
        />
      )}

      {/* One-Page Situation Report SITREP */}
      {isReportOpen && (
        <SituationReportModal
          onClose={() => setIsReportOpen(false)}
          language={language}
        />
      )}

      {/* 3-Minute Hackathon Demo Pitch Tour */}
      {isDemoTourOpen && (
        <DemoTourModal
          onClose={() => setIsDemoTourOpen(false)}
          onStepTrigger={handleDemoStepTrigger}
          language={language}
        />
      )}
    </div>
  );
}

export default App;
