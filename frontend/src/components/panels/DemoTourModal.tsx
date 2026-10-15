import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Sparkles, CheckCircle2 } from 'lucide-react';

interface DemoTourModalProps {
  onClose: () => void;
  onStepTrigger: (stepIndex: number) => void;
  language: 'en' | 'ne';
}

const TOUR_STEPS = [
  {
    time: '0:00',
    title: 'Normal Satellite Scene (Pre-Event Baseline)',
    desc: 'Sentinel-2 baseline imagery captures the steep Himalayan Trishuli valley prior to the August 2026 monsoon torrential surge. All highway links are intact.',
    actionName: 'Set Baseline Timeline',
  },
  {
    time: '0:15',
    title: 'Before/After Flood Surge Comparison',
    desc: 'Penetrating Sentinel-1 C-band SAR radar imagery cuts through monsoon cloud cover to detect drastic backscatter drops (-9.4 dB) caused by torrential flooding.',
    actionName: 'Reveal Flood Inundation',
  },
  {
    time: '0:35',
    title: 'Multimodal AI Flood & Debris Segmentation',
    desc: 'Our PyTorch Multimodal Attention U-Net segments 14.85 km² of active flood waters and 7.42 km² of debris silt with 94.2% confidence, generalizing to steep mountain topography.',
    actionName: 'Activate AI Segmentation',
  },
  {
    time: '0:55',
    title: 'Pre-Event OpenStreetMap Infrastructure Damage',
    desc: 'Overlaying pre-event OpenStreetMap vectors reveals 5 severed road segments and 3 compromised bridges (B2, B4, B5) within active torrent chokepoints.',
    actionName: 'Classify Infrastructure Damage',
  },
  {
    time: '1:15',
    title: 'RescueGraph Connectivity Topology',
    desc: 'Constructing the road network graph reveals systemic network collapse: settlements are isolated from District HQ (Bidur) and Trishuli District Hospital.',
    actionName: 'Evaluate Network Graph',
  },
  {
    time: '1:30',
    title: '“Village B is CUT OFF” — Isolation Radar',
    desc: 'Isolation Radar flags 6 communities with 14,690 residents completely cut off from road access, explaining grounded causal reasons.',
    actionName: 'Highlight Cut-Off Settlements',
  },
  {
    time: '1:45',
    title: 'Sub-Pixel Evidence Lens',
    desc: 'Clicking Ramche Gorge Bridge opens the synchronized Before/After/Change/AI Mask lens, verifying the satellite evidence and grounded classification.',
    actionName: 'Open Evidence Lens',
  },
  {
    time: '2:00',
    title: 'What-If Simulation: Bridge B4 Structural Failure',
    desc: 'What-If simulator dynamically tests cascading failure: if Bridge B4 fails, 3 upstream settlements lose all ground connectivity.',
    actionName: 'Simulate Failure',
  },
  {
    time: '2:15',
    title: 'What-If Simulation: Emergency Bailey Bridge Restoration',
    desc: 'Simulating an emergency military Bailey bridge installation at Bridge B4 restores vehicular connection for 10,100 people across Dhunche and Syabrubesi.',
    actionName: 'Simulate Restoration',
  },
  {
    time: '2:30',
    title: 'Bilingual AI Rescue Copilot (English & Nepali)',
    desc: 'Natural language assistant queries backend graph engines to answer complex logistical questions without inventing numbers.',
    actionName: 'Launch AI Copilot',
  },
  {
    time: '2:40',
    title: 'Automatic One-Page Situation Report (SITREP)',
    desc: 'One-click operational PDF briefing compiling event metrics, isolated populations, rescue priorities, and mandatory Copernicus attributions.',
    actionName: 'Generate SITREP',
  },
  {
    time: '2:50',
    title: '3D Disaster Twin Command Center',
    desc: 'Interactive 3D elevation model of the Trishuli river canyon with downstream flow path tracing and safe rescue routing.',
    actionName: 'Enable 3D Disaster Twin',
  },
  {
    time: '3:00',
    title: 'RESCUEGRAPH',
    desc: 'See the Flood. Understand the Damage. Find the Isolated. Simulate the Rescue.',
    actionName: 'Complete Presentation',
  },
];

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  onClose,
  onStepTrigger,
  language,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onStepTrigger(next);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onStepTrigger(prev);
    }
  };

  return (
    <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#090e1a]/95 border-2 border-cyan-400 rounded-2xl p-4.5 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col gap-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {step.time} / 3:00
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              3-MINUTE HACKATHON PITCH TOUR (STEP {currentStep + 1} OF {TOUR_STEPS.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Details */}
        <div>
          <h3 className="text-sm font-black text-white">{step.title}</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{step.desc}</p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex gap-1">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === idx ? 'bg-cyan-400 w-4' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === TOUR_STEPS.length - 1}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            <span>Next ({step.actionName})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
