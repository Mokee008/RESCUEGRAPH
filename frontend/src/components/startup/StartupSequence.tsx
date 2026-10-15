import React, { useEffect, useState } from 'react';
import { Satellite } from 'lucide-react';

interface StartupSequenceProps {
  onComplete: () => void;
}

export const StartupSequence: React.FC<StartupSequenceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'INIT' | 'GRID' | 'SATELLITE' | 'SETTLE' | 'DONE'>('INIT');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('GRID'), 200);
    const t2 = setTimeout(() => setPhase('SATELLITE'), 600);
    const t3 = setTimeout(() => setPhase('SETTLE'), 1100);
    const t4 = setTimeout(() => {
      setPhase('DONE');
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (phase === 'DONE') return null;

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-50 bg-[#070b14] flex flex-col items-center justify-center transition-opacity duration-500 cursor-pointer ${
        phase === 'SETTLE' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Coordinate Grid Lines */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          phase === 'GRID' || phase === 'SATELLITE' ? 'opacity-25' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Center Branding */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-3 shadow-2xl">
          <Satellite className="w-6 h-6 text-sky-400 animate-pulse" />
        </div>

        <h1 className="text-xl font-bold tracking-widest text-white uppercase font-mono">
          RESCUEGRAPH
        </h1>

        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
          <span>LAT: 27.982° N</span>
          <span>•</span>
          <span>LON: 85.195° E</span>
          <span>•</span>
          <span className="text-sky-400">TRISHULI BASIN</span>
        </div>

        {/* Loading Step Sequence */}
        <div className="mt-4 text-[11px] font-mono text-slate-500 h-4">
          {phase === 'INIT' && 'INITIALIZING GEOSPATIAL RUNTIME...'}
          {phase === 'GRID' && 'ESTABLISHING COPERNICUS DEM MESH...'}
          {phase === 'SATELLITE' && 'RESOLVING MULTISENSOR SATELLITE BASEMAP...'}
          {phase === 'SETTLE' && 'DISASTER INTELLIGENCE READY'}
        </div>
      </div>
    </div>
  );
};
