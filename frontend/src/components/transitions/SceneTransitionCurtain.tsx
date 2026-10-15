import React, { useEffect, useState } from 'react';

export type TransitionType = 'T1_MIST' | 'T2_STRIPES' | 'T3_HYPERSPACE' | 'NONE';

interface SceneTransitionCurtainProps {
  transitionType: TransitionType;
  isActive: boolean;
  onTransitionComplete?: () => void;
}

export function SceneTransitionCurtain({
  transitionType,
  isActive,
  onTransitionComplete,
}: SceneTransitionCurtainProps) {
  const [phase, setPhase] = useState<'IDLE' | 'COVERING' | 'REVEALING'>('IDLE');

  useEffect(() => {
    if (!isActive || transitionType === 'NONE') {
      setPhase('IDLE');
      return;
    }

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Plain 200ms fade per requirement P7
      setPhase('COVERING');
      const timer = setTimeout(() => {
        setPhase('IDLE');
        onTransitionComplete?.();
      }, 200);
      return () => clearTimeout(timer);
    }

    // Phase 1: Covering (~250ms)
    setPhase('COVERING');

    const revealTimer = setTimeout(() => {
      // Phase 2: Revealing
      setPhase('REVEALING');
      const completeTimer = setTimeout(() => {
        setPhase('IDLE');
        onTransitionComplete?.();
      }, 350);
      return () => clearTimeout(completeTimer);
    }, 280);

    return () => clearTimeout(revealTimer);
  }, [isActive, transitionType]);

  if (phase === 'IDLE') return null;

  // --- T1: NEBULA MIST DISSOLVE ---
  if (transitionType === 'T1_MIST') {
    return (
      <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden">
        {/* Layer 1: Core Radial Mist Layer */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            phase === 'COVERING' ? 'opacity-90 scale-100' : 'opacity-0 scale-110'
          }`}
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, rgba(15, 20, 28, 0.85) 60%, #000000 100%)',
          }}
        />

        {/* Layer 2: Secondary Offset Atmospheric Mist */}
        <div
          className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            phase === 'COVERING' ? 'opacity-80 scale-105' : 'opacity-0 scale-120'
          }`}
          style={{
            background:
              'radial-gradient(ellipse 90% 60% at 50% 60%, rgba(148, 163, 184, 0.12) 0%, rgba(5, 7, 12, 0.95) 70%, #000000 100%)',
          }}
        />
      </div>
    );
  }

  // --- T2: AURORA STRIPE CURTAIN (10 Vertical Monochromatic Stripes, 30ms Stagger) ---
  if (transitionType === 'T2_STRIPES') {
    const numStripes = 10;
    return (
      <div className="fixed inset-0 pointer-events-none z-[80] flex overflow-hidden">
        {Array.from({ length: numStripes }).map((_, idx) => {
          const delayMs = idx * 28;
          return (
            <div
              key={idx}
              className={`flex-1 h-full transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]`}
              style={{
                background:
                  idx % 2 === 0
                    ? 'linear-gradient(180deg, #090b10 0%, #1a1e28 50%, #090b10 100%)'
                    : 'linear-gradient(180deg, #141722 0%, #252a38 50%, #141722 100%)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                transform:
                  phase === 'COVERING'
                    ? 'translateY(0%)'
                    : 'translateY(-105%)',
                transitionDelay: `${delayMs}ms`,
                willChange: 'transform',
              }}
            />
          );
        })}
      </div>
    );
  }

  // T3 Hyperspace stretch is rendered directly inside the canvas, with optional subtle flash veil here
  if (transitionType === 'T3_HYPERSPACE') {
    return (
      <div
        className={`fixed inset-0 pointer-events-none z-[80] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          phase === 'COVERING' ? 'opacity-25' : 'opacity-0'
        } bg-white`}
      />
    );
  }

  return null;
}
