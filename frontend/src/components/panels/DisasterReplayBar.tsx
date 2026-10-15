import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Clapperboard } from 'lucide-react';

interface DisasterReplayBarProps {
  onStageChange: (stage: 'BEFORE' | 'EVENT' | 'AFTER' | 'DAMAGE' | 'ISOLATION' | 'SCENARIO') => void;
  language: 'en' | 'ne';
}

const STAGES = [
  { id: 'BEFORE', label: '1. PRE-EVENT BASELINE', date: '2026-08-05' },
  { id: 'EVENT', label: '2. MONSOON SURGE', date: '2026-08-14' },
  { id: 'AFTER', label: '3. SAR RADAR INUNDATION', date: '2026-08-15' },
  { id: 'DAMAGE', label: '4. INFRASTRUCTURE DAMAGE', date: '2026-08-15' },
  { id: 'ISOLATION', label: '5. NETWORK ISOLATION', date: '2026-08-15' },
  { id: 'SCENARIO', label: '6. WHAT-IF RESCUE SCENARIO', date: '2026-08-16' },
] as const;

export const DisasterReplayBar: React.FC<DisasterReplayBarProps> = ({
  onStageChange,
  language,
}) => {
  const [currentIdx, setCurrentIdx] = useState(2); // start at AFTER
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIdx((prev) => {
          const next = (prev + 1) % STAGES.length;
          onStageChange(STAGES[next].id);
          return next;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, onStageChange]);

  const setStage = (idx: number) => {
    setCurrentIdx(idx);
    onStageChange(STAGES[idx].id);
  };

  return (
    <div className="w-full bg-[#080d1a]/90 border-t border-slate-800 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs backdrop-blur-md">
      {/* Label */}
      <div className="flex items-center gap-2">
        <Clapperboard className="w-4 h-4 text-cyan-400" />
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          {language === 'ne' ? 'सिनेमेटिक आपतकालीन रिप्ले' : 'CINEMATIC DISASTER REPLAY'}
        </span>
      </div>

      {/* Replay Controls & Timeline Steps */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors cursor-pointer"
          title={isPlaying ? 'Pause Replay' : 'Play Cinematic Replay'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <div className="flex-1 grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {STAGES.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                setIsPlaying(false);
                setStage(idx);
              }}
              className={`py-1 rounded-lg text-[10px] font-mono font-bold transition-all truncate px-1 ${
                currentIdx === idx
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`${st.label} (${st.date})`}
            >
              {st.id}
            </button>
          ))}
        </div>
      </div>

      {/* Active Stage Indicator */}
      <div className="text-[11px] font-mono text-cyan-400 font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
        {STAGES[currentIdx].label}
      </div>
    </div>
  );
};
