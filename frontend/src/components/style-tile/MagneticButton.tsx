import React, { useRef, useState, useEffect } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'inspect' | 'flyto' | 'action';
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function MagneticButton({
  children,
  onClick,
  variant = 'inspect',
  icon,
  className = '',
  disabled = false,
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate delta limited to 6px
    const deltaX = (e.clientX - centerX) * 0.18;
    const deltaY = (e.clientY - centerY) * 0.18;

    const maxPull = 6;
    const clampedX = Math.max(-maxPull, Math.min(maxPull, deltaX));
    const clampedY = Math.max(-maxPull, Math.min(maxPull, deltaY));

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      setOffset({ x: clampedX, y: clampedY });
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setOffset({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const variantStyles = {
    inspect:
      'border-white/30 bg-black/85 text-white hover:border-white hover:bg-white/10 hover:shadow-[0_0_12px_rgba(255,255,255,0.25)]',
    flyto:
      'border-white bg-white text-black font-bold hover:bg-slate-200 hover:shadow-[0_0_16px_rgba(255,255,255,0.4)]',
    action:
      'border-slate-600/60 bg-[#12151d] text-slate-200 hover:border-white hover:text-white hover:bg-[#1a1e29]',
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`relative group inline-flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider font-semibold transition-colors duration-200 cursor-pointer clip-chamfer-sm ${variantStyles[variant]} ${className}`}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: isHovered
          ? 'transform 0.08s ease-out'
          : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
      }}
    >
      {/* 1px glowing chamfer border simulation */}
      <span
        className={`absolute inset-0 border border-current pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-200 clip-chamfer-sm`}
      />

      {/* Subtle corner ice highlights */}
      <span className="absolute top-0 left-1 w-1.5 h-1.5 border-t border-l border-[#cfefff] opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="absolute bottom-0 right-1 w-1.5 h-1.5 border-b border-r border-[#3de0c5] opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Button content */}
      {icon && (
        <span className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
