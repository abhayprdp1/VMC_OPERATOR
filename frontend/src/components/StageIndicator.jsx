import React from 'react';

const STAGES = [
  { id: 1, label: 'Machine Checks', icon: '🔧' },
  { id: 2, label: 'Tools',          icon: '🔩' },
  { id: 3, label: 'Workpiece',      icon: '📐' },
  { id: 4, label: 'Ready Review',   icon: '✅' },
  { id: 5, label: 'Operation',      icon: '▶️' },
];

export default function StageIndicator({ currentStage }) {
  return (
    <nav className="stage-indicator" aria-label="Stage progress">
      {STAGES.map((stage) => {
        const isDone   = stage.id < currentStage;
        const isActive = stage.id === currentStage;
        return (
          <div
            key={stage.id}
            className={`stage-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <div className="stage-dot">
              {isDone ? '✓' : stage.id}
            </div>
            <span className="stage-label">{stage.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
