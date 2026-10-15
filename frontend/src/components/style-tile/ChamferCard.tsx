import React, { useState, useRef, useEffect } from 'react';
import { MagneticButton } from './MagneticButton';

interface ChamferCardProps {
  id?: string;
  title: string;
  tag: string;
  tagType?: 'ice' | 'amber' | 'red' | 'teal';
  description: string;
  statusText?: string;
  metric?: string;
  metricLabel?: string;
  isLite?: boolean;
  onInspect?: () => void;
  onFlyTo?: () => void;
  imageSrc?: string;
  geometricCrestType?: 'crystal' | 'constellation' | 'orbital';
}

export function ChamferCard({
  title,
  tag,
  tagType = 'ice',
  description,
  statusText,
  metric,
  metricLabel,
  isLite = false,
  onInspect,
  onFlyTo,
  imageSrc,
  geometricCrestType = 'constellation',
}: ChamferCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const tagColors = {
    ice: 'text-white border-white/40 bg-white/10',
    amber: 'text-[#f5b94a] border-[#f5b94a]/40 bg-[#f5b94a]/10',
    red: 'text-[#ff5a5f] border-[#ff5a5f]/40 bg-[#ff5a5f]/10',
    teal: 'text-slate-200 border-white/30 bg-white/10',
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLite || isTouched || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Up to 6 degrees tilt
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      setTilt({ x: rotateX, y: rotateY });
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setTilt({ x: 0, y: 0 });
  };

  const handleTouch = () => {
    setIsTouched(true);
    setIsHovered(!isHovered);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // SVG Geometric Crests
  const renderCrest = () => {
    if (geometricCrestType === 'crystal') {
      return (
        <svg className="w-6 h-6 text-[#9fd8ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <polygon points="12 2 19 8 19 16 12 22 5 16 5 8" />
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="5" y1="8" x2="19" y2="16" />
          <line x1="5" y1="16" x2="19" y2="8" />
        </svg>
      );
    }
    if (geometricCrestType === 'orbital') {
      return (
        <svg className="w-6 h-6 text-[#3de0c5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="3" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" />
        </svg>
      );
    }
    // Constellation default
    return (
      <svg className="w-6 h-6 text-[#3de0c5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="6" cy="6" r="1.5" fill="currentColor" />
        <circle cx="18" cy="7" r="1.5" fill="currentColor" />
        <circle cx="12" cy="13" r="1.5" fill="currentColor" />
        <circle cx="7" cy="19" r="1.5" fill="currentColor" />
        <circle cx="17" cy="18" r="1.5" fill="currentColor" />
        <line x1="6" y1="6" x2="12" y2="13" />
        <line x1="18" y1="7" x2="12" y2="13" />
        <line x1="12" y1="13" x2="7" y2="19" />
        <line x1="12" y1="13" x2="17" y2="18" />
      </svg>
    );
  };

  const transformStyle =
    isLite || isTouched
      ? undefined
      : {
          transform: isHovered
            ? `perspective(800px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) translate3d(0, -4px, 0)`
            : 'perspective(800px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)',
          transition: isHovered
            ? 'transform 0.08s ease-out'
            : 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTouch}
      style={transformStyle}
      className={`relative w-full max-w-sm cursor-pointer select-none group clip-chamfer-md ${
        isLite ? 'bg-black border border-white/20' : 'bg-black/85 backdrop-blur-md'
      }`}
    >
      {/* 1. Animated Conic Gradient Border Frame (Silver/White Shimmer) */}
      <div
        className={`absolute -inset-[1.5px] clip-chamfer-md pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-20'
        }`}
        style={{
          background: isHovered
            ? 'conic-gradient(from 0deg at 50% 50%, #ffffff 0deg, #94a3b8 90deg, #1e293b 180deg, #94a3b8 270deg, #ffffff 360deg)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(100,116,139,0.1) 100%)',
        }}
      />

      {/* 2. Inner Frame Background */}
      <div className="relative clip-chamfer-md bg-[#07090e]/95 p-5 z-10 flex flex-col justify-between min-h-[300px]">
        {/* Top Decorative Crest Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-black border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.15)]">
              {renderCrest()}
            </div>
            {/* Title fades to invisible when touched/hovered per user instruction */}
            <span
              className={`font-['Michroma'] text-xs uppercase tracking-wider text-white transition-opacity duration-200 ${
                isHovered || isTouched ? 'opacity-0 invisible' : 'opacity-100 visible'
              }`}
            >
              {title}
            </span>
          </div>
          <span
            className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 clip-badge border transition-opacity duration-200 ${
              isHovered || isTouched ? 'opacity-40' : 'opacity-100'
            } ${tagColors[tagType]}`}
          >
            {tag}
          </span>
        </div>

        {/* Visual / Image Area */}
        <div className="relative my-3 h-28 rounded overflow-hidden bg-black border border-white/10 flex items-center justify-center">
          {/* Base Metric / Satellite Layer (Fades out completely when hovered/touched) */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-200 ${
              isHovered || isTouched ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {imageSrc ? (
              <img src={imageSrc} alt={title} className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#10141f] to-black">
                {/* Subtle monochrome grid */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #ffffff 1px, transparent 1px), linear-gradient(to right, #475569 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                {metric ? (
                  <div className="text-center z-10 px-2">
                    <div className="font-['Michroma'] text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                      {metric}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                      {metricLabel || 'Active Metric'}
                    </div>
                  </div>
                ) : (
                  <div className="font-mono text-xs text-slate-400 uppercase tracking-widest">
                    ◈ SATELLITE LAYER ◈
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opaque Sliding Description Overlay (Revealed cleanly when touched/hovered) */}
          <div
            className={`absolute inset-0 z-20 bg-black/98 p-3.5 flex flex-col justify-center items-center text-center transition-all duration-200 ${
              isHovered || isTouched
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-3 pointer-events-none'
            }`}
          >
            <p className="font-mono text-xs text-slate-200 leading-relaxed font-normal">
              {description}
            </p>
            {statusText && (
              <span className="mt-2.5 font-mono text-[10px] text-white tracking-widest uppercase border-t border-white/15 pt-1 w-full text-center">
                STATUS: {statusText}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer with Buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <div className="font-mono text-[10px] text-slate-500">
            SEC-7 // NEPAL
          </div>
          <div className="flex items-center gap-2">
            <MagneticButton
              variant="inspect"
              onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                e?.stopPropagation();
                onInspect?.();
              }}
            >
              Inspect
            </MagneticButton>
            <MagneticButton
              variant="flyto"
              onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                e?.stopPropagation();
                onFlyTo?.();
              }}
            >
              Fly to
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}
