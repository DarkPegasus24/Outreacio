import React from 'react';
import './VignetteThemeTransition.css';

export default function VignetteThemeTransition({ isTransitioning, stage, targetTheme }) {
  if (!isTransitioning) return null;

  return (
    <div
      className={`vignette-theme-overlay stage-${stage} target-${targetTheme}`}
      aria-hidden="true"
    >
      <div className="liquid-theme-base" />
      <div className="liquid-theme-flow liquid-theme-flow-primary" />
      <div className="liquid-theme-flow liquid-theme-flow-secondary" />
      <div className="liquid-theme-sheen" />
    </div>
  );
}
