import React from 'react';

export default function Header({ scenario, operationStatus, onReset }) {
  const statusLabel = operationStatus === 'RUNNING' ? 'RUNNING' : operationStatus === 'STOPPED' ? 'STOPPED' : 'STANDBY';
  const statusClass = operationStatus === 'RUNNING' ? 'running' : operationStatus === 'READY' ? 'active' : '';

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo">⚙️</div>
        <div>
          <div className="header-title">PRIMEFORM LABS — VMC HMI</div>
          <div className="header-subtitle">Operator Interface · Startup Guidance</div>
        </div>
      </div>

      <div className="header-meta">
        {scenario && (
          <span className="header-badge" title={`CNC: ${scenario.cncProgram}`}>
            {scenario.cncProgram}
          </span>
        )}
        <span className={`header-badge ${statusClass}`}>
          {statusLabel}
        </span>
        <button className="btn-reset" onClick={onReset} id="btn-system-reset">
          ↺ Reset
        </button>
      </div>
    </header>
  );
}
