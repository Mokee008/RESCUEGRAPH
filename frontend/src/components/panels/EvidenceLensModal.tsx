import React, { useState } from 'react';
import { InfrastructureEvidence } from '../../types';
import { X, ShieldCheck, AlertCircle, ZoomIn, Layers, Activity } from 'lucide-react';

interface EvidenceLensModalProps {
  feature: {
    type: string;
    data: any;
    evidence: InfrastructureEvidence;
  } | null;
  onClose: () => void;
  language: 'en' | 'ne';
}

export const EvidenceLensModal: React.FC<EvidenceLensModalProps> = ({
  feature,
  onClose,
  language,
}) => {
  if (!feature) return null;

  const [activeLens, setActiveLens] = useState<'BEFORE' | 'AFTER' | 'CHANGE' | 'AI_MASK'>('AFTER');
  const { evidence, type, data } = feature;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#090e1a] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span>EVIDENCE LENS:</span>
              <span className="text-cyan-400 font-mono">{evidence.name || evidence.id}</span>
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Synchronized 4-Way Multi-Sensor Lens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                Synchronized Sub-Pixel Satellite Lens
              </span>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-mono">
                {(['BEFORE', 'AFTER', 'CHANGE', 'AI_MASK'] as const).map((lens) => (
                  <button
                    key={lens}
                    onClick={() => setActiveLens(lens)}
                    className={`px-2 py-1 rounded transition-colors ${
                      activeLens === lens
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lens}
                  </button>
                ))}
              </div>
            </div>

            {/* Lens Visual Viewer Canvas */}
            <div className="relative h-48 w-full rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center">
              {activeLens === 'BEFORE' && (
                <div className="text-center p-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mb-2">
                    <ShieldCheck className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div className="text-xs font-semibold text-emerald-300">
                    Pre-Flood Optical Baseline (Sentinel-2 2026-08-05)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Clear valley riverbed; normal backscatter and intact roadway embankment.
                  </p>
                </div>
              )}

              {activeLens === 'AFTER' && (
                <div className="text-center p-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-sky-950/80 border border-sky-500/50 flex items-center justify-center mb-2">
                    <Activity className="w-10 h-10 text-sky-400 animate-pulse" />
                  </div>
                  <div className="text-xs font-semibold text-sky-300">
                    Post-Flood SAR Radar Inundation (Sentinel-1 2026-08-15)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Severe specular backscatter decrease (-9.4 dB); target coordinates submerged in high torrent channel.
                  </p>
                </div>
              )}

              {activeLens === 'CHANGE' && (
                <div className="text-center p-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center mb-2">
                    <AlertCircle className="w-10 h-10 text-amber-400" />
                  </div>
                  <div className="text-xs font-semibold text-amber-300">
                    Differential Change Anomaly Map (Δ Backscatter & Turbidity)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Significant change detected between August 8 and August 15 acquisitions.
                  </p>
                </div>
              )}

              {activeLens === 'AI_MASK' && (
                <div className="text-center p-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center mb-2">
                    <Layers className="w-10 h-10 text-indigo-400" />
                  </div>
                  <div className="text-xs font-semibold text-indigo-300">
                    Multimodal Attention U-Net Prediction Mask
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Class 1 (Water Inundation): 95.2% confidence | Class 2 (Debris Silt): 4.1%
                  </p>
                </div>
              )}

              <div className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/20">
                Lat: {evidence.coordinates[1].toFixed(4)}° N, Lon: {evidence.coordinates[0].toFixed(4)}° E
              </div>
            </div>
          </div>

          {/* Analytical Grounding Facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Physical Satellite Evidence
              </span>
              <p className="text-xs text-slate-200 font-medium">
                {evidence.satellite_evidence}
              </p>
              <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-800">
                <span className="text-slate-400">Flood Proximity:</span>
                <span className="text-cyan-300 font-bold">{evidence.flood_proximity_m} meters</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Model Confidence:</span>
                <span className="text-emerald-400 font-bold">{(evidence.model_confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Network Connectivity Impact
              </span>
              <p className="text-xs text-rose-300 font-semibold">
                {evidence.current_connectivity_effect}
              </p>
              <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                <strong className="text-slate-400">Classification Rationale: </strong>
                {evidence.reason_for_classification}
              </div>
            </div>
          </div>

          {/* Data Provenance Badge */}
          <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-medium">Data Provenance:</span>
              <span className="text-cyan-300 font-mono">{evidence.data_source}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Permitted Sentinel & OSM Baseline
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
