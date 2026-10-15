import React from 'react';
import { HeroMissionControl } from '../hero/HeroMissionControl';

interface S0HeroSlideProps {
  onRunAnalysis: (bbox: string, date: string) => void;
  onLoadCaseStudy: () => void;
  onNextSlide: () => void;
  mousePos: { x: number; y: number };
  language?: 'en' | 'ne';
}

export function S0_HeroSlide({
  onRunAnalysis,
  onLoadCaseStudy,
  onNextSlide,
  mousePos,
  language = 'en',
}: S0HeroSlideProps) {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">
      <HeroMissionControl
        onRunAnalysis={onRunAnalysis}
        onLoadCaseStudy={onLoadCaseStudy}
        onScrollToNext={onNextSlide}
        onInspectCard={() => onNextSlide()}
        mousePos={mousePos}
        language={language}
      />
    </div>
  );
}
