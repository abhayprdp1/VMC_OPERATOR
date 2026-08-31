import React from 'react';

export default function Operation({ scenario, operationStatus, onStart, onStop, loading, error }) {
  const isReady   = operationStatus === 'READY';
  const isRunning = operationStatus === 'RUNNING';
  const isStopped = operationStatus === 'STOPPED';

  const statusEmoji = isRunning ? '▶' : isStopped ? '■' : '●';

  return (
    <section>
      <div className="section-header">
        <div className="section-tag">Stage 05 / 05</div>
        <h1 className="section-title">Operation</h1>
        <p className="section-desc">
          Machine is prepared and ready. Start the simulated machining operation.
        </p>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="op-panel">
        <div className="op-status-label">OPERATION STATUS</div>
        <div className={`op-status-badge ${operationStatus}`}>
          <span className="op-dot" />
          {operationStatus}
        </div>
        <div className="op-name">
          {scenario?.operation || 'Face Milling – Aluminium Bracket'}
        </div>

        {scenario && (
          <div className="scenario-panel" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <div className="scenario-field">
              <span className="scenario-key">CNC Program</span>
              <span className="scenario-value">{scenario.cncProgram}</span>
            </div>
            <div className="scenario-field">
              <span className="scenario-key">Material</span>
              <span className="scenario-value">{scenario.material}</span>
            </div>
            <div className="scenario-field">
              <span className="scenario-key">Work Offset</span>
              <span className="scenario-value">{scenario.workOffset}</span>
            </div>
            <div className="scenario-field">
              <span className="scenario-key">Quantity</span>
              <span className="scenario-value">{scenario.quantity} pcs</span>
            </div>
          </div>
        )}

        <div className="op-controls">
          <button
            className="btn-start"
            onClick={onStart}
            disabled={!isReady || loading}
            id="btn-start-operation"
          >
            ▶ START OPERATION
          </button>
          <button
            className="btn-stop"
            onClick={onStop}
            disabled={!isRunning || loading}
            id="btn-stop-operation"
          >
            ■ STOP OPERATION
          </button>
        </div>
      </div>

      {isStopped && (
        <div style={{
          background: 'rgba(255,77,77,0.06)',
          border: '1px solid rgba(255,77,77,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          textAlign: 'center',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
        }}>
          ■ Operation stopped. Stage and progress preserved.
          Use the <strong style={{ color: 'var(--text-primary)' }}>↺ Reset</strong> button in the header to begin a new cycle.
        </div>
      )}

      {isRunning && (
        <div style={{
          background: 'var(--accent-dim)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          textAlign: 'center',
          fontSize: '0.88rem',
          color: 'var(--accent)',
          animation: 'pulse-badge 1.5s ease-in-out infinite',
        }}>
          ▶ Machining in progress — {scenario?.operation}
        </div>
      )}
    </section>
  );
}
