import React, { useState, useEffect } from 'react';

interface TypewriterTitleProps {
  title: string;
  subtitle?: string;
  speedMs?: number;
  className?: string;
}

export function TypewriterTitle({
  title,
  subtitle,
  speedMs = 28,
  className = '',
}: TypewriterTitleProps) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayedChars(title.length);
      setIsComplete(true);
      return;
    }

    setDisplayedChars(0);
    setIsComplete(false);

    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayedChars(index);
      if (index >= title.length) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [title, speedMs]);

  return (
    <div
      className={`relative select-none text-center ${className}`}
      aria-label={title}
      role="heading"
      aria-level={2}
    >
      {/* Title Container: Pre-reserves full geometry to guarantee CLS = 0 */}
      <div className="relative inline-flex items-center justify-center gap-3">
        {/* Left Constellation Diamond */}
        <span
          className="text-white text-sm md:text-base select-none transition-transform duration-500"
          style={{ textShadow: '0 0 10px rgba(255,255,255,0.8)' }}
        >
          ◈
        </span>

        {/* Hidden full text to reserve layout bounding box */}
        <span className="invisible select-none font-['Michroma'] tracking-wider text-xl md:text-3xl font-bold uppercase pointer-events-none">
          {title}
        </span>

        {/* Revealed text superimposed at exact origin */}
        <div className="absolute inset-0 flex items-center justify-center font-['Michroma'] tracking-wider text-xl md:text-3xl font-bold uppercase text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
          <span>{title.slice(0, displayedChars)}</span>
          {/* Blinking Caret */}
          {!isComplete && (
            <span
              className="inline-block w-2 md:w-2.5 h-5 md:h-7 ml-1 bg-white animate-caret align-middle shadow-[0_0_8px_#ffffff]"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Right Constellation Diamond */}
        <span
          className="text-white text-sm md:text-base select-none transition-transform duration-500"
          style={{ textShadow: '0 0 10px rgba(255,255,255,0.8)' }}
        >
          ◈
        </span>
      </div>

      {/* Subtitle if provided */}
      {subtitle && (
        <p
          className={`mt-2 font-mono text-xs md:text-sm text-[#9fd8ff]/70 tracking-widest uppercase transition-opacity duration-700 ${
            isComplete ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
