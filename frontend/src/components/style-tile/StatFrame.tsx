import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, ShieldAlert } from 'lucide-react';

interface StatFrameProps {
  label: string;
  targetValue: number;
  suffix?: string;
  status: 'confirmed' | 'likely' | 'uncertain' | 'nominal';
  subtitle?: string;
  className?: string;
}

export function StatFrame({
  label,
  targetValue,
  suffix = '',
  status,
  subtitle,
  className = '',
}: StatFrameProps) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Intersection observer to trigger count-up on view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const durationMs = 1200;
          const steps = 30;
          const stepTime = durationMs / steps;
          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(targetValue * easeProgress));

            if (currentStep >= steps) {
              setCount(targetValue);
              clearInterval(timer);
            }
          }, stepTime);
        }
      },
      { threshold: 0.2 }
    );

    if (frameRef.current) observer.observe(frameRef.current);

    return () => observer.disconnect();
  }, [targetValue, hasAnimated]);

  // Color & pattern definitions per specification:
  // Red ONLY for confirmed damage
  // Amber ONLY for cut off / warning
  // Ice/Teal for nominal/uncertain
  const statusConfig = {
    confirmed: {
      color: '#ff5a5f',
      borderClass: 'border-[#ff5a5f]/40 hover:border-[#ff5a5f]',
      bgClass: 'bg-[#ff5a5f]/10',
      badgeClass: 'text-[#ff5a5f] border-[#ff5a5f]/50',
      textClass: 'text-[#ff5a5f]',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-[#ff5a5f]" />,
      badgeText: 'CONFIRMED',
      pattern: 'repeating-linear-gradient(45deg, rgba(255,90,95,0.06) 0px, rgba(255,90,95,0.06) 4px, transparent 4px, transparent 8px)',
    },
    likely: {
      color: '#f5b94a',
      borderClass: 'border-[#f5b94a]/40 hover:border-[#f5b94a]',
      bgClass: 'bg-[#f5b94a]/10',
      badgeClass: 'text-[#f5b94a] border-[#f5b94a]/50',
      textClass: 'text-[#f5b94a]',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#f5b94a]" />,
      badgeText: 'CUT OFF / WARNING',
      pattern: 'repeating-linear-gradient(-45deg, rgba(245,185,74,0.06) 0px, rgba(245,185,74,0.06) 4px, transparent 4px, transparent 8px)',
    },
    uncertain: {
      color: '#9fd8ff',
      borderClass: 'border-[#9fd8ff]/40 hover:border-[#3de0c5]',
      bgClass: 'bg-[#9fd8ff]/10',
      badgeClass: 'text-[#9fd8ff] border-[#9fd8ff]/50',
      textClass: 'text-[#9fd8ff]',
      icon: <HelpCircle className="w-3.5 h-3.5 text-[#9fd8ff]" />,
      badgeText: 'UNCERTAIN',
      pattern: 'radial-gradient(circle, rgba(159,216,255,0.08) 1px, transparent 1px)',
    },
    nominal: {
      color: '#3de0c5',
      borderClass: 'border-[#3de0c5]/40 hover:border-[#cfefff]',
      bgClass: 'bg-[#3de0c5]/10',
      badgeClass: 'text-[#3de0c5] border-[#3de0c5]/50',
      textClass: 'text-[#3de0c5]',
      icon: <CheckCircle className="w-3.5 h-3.5 text-[#3de0c5]" />,
      badgeText: 'NOMINAL',
      pattern: 'none',
    },
  };

  const cfg = statusConfig[status];

  return (
    <div
      ref={frameRef}
      className={`relative p-4 clip-chamfer-md border ${cfg.borderClass} ${cfg.bgClass} glacier-glass transition-colors duration-300 ${className}`}
      style={{
        backgroundImage: cfg.pattern,
      }}
    >
      {/* Corner notch accent */}
      <span
        className="absolute top-0 right-0 w-3 h-3 pointer-events-none"
        style={{
          borderTop: `2px solid ${cfg.color}`,
          borderRight: `2px solid ${cfg.color}`,
        }}
      />

      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-[#9fd8ff]/80 tracking-wider uppercase font-semibold">
          {label}
        </span>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 clip-badge border ${cfg.badgeClass}`}>
          {cfg.icon}
          <span className="font-mono text-[9px] font-bold tracking-widest">{cfg.badgeText}</span>
        </div>
      </div>

      {/* Metric with count-up */}
      <div className="flex items-baseline gap-1 mt-1">
        <span
          className={`font-['Michroma'] text-3xl md:text-4xl font-bold tracking-tight ${cfg.textClass}`}
          style={{ textShadow: `0 0 16px ${cfg.color}40` }}
        >
          {count.toLocaleString()}
        </span>
        {suffix && (
          <span className="font-mono text-xs text-[#9fd8ff]/70 font-semibold uppercase">
            {suffix}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 font-mono text-[11px] text-slate-300/80 leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
}
