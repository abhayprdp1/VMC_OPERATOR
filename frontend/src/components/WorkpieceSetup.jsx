import React from 'react';

function WorkpieceCard({ item, onConfirm, loading }) {
  return (
    <div className={`check-card ${item.confirmed ? 'confirmed' : 'pending'}`}>
      <div className="check-icon">
        {item.confirmed ? '✅' : '📐'}
      </div>
      <div className="check-info">
        <div className="check-label">{item.label}</div>
        <div className="check-detail">{item.detail}</div>
      </div>
      {item.confirmed ? (
        <div className="confirmed-badge">
          <span>✓</span> DONE
        </div>
      ) : (
        <button
          className="btn-confirm"
          onClick={() => onConfirm(item.id)}
          disabled={loading}
          id={`btn-confirm-${item.id}`}
        >
          Confirm
        </button>
      )}
    </div>
  );
}

export default function WorkpieceSetup({ stageData, scenario, onConfirm, onNext, loading, error }) {
  const items     = stageData?.items || [];
  const confirmed = items.filter(i => i.confirmed).length;
  const total     = items.length;
  const allDone   = confirmed === total && total > 0;
  const pct       = total ? Math.round((confirmed / total) * 100) : 0;

  return (
    <section>
      <div className="section-header">
        <div className="section-tag">Stage 03 / 05</div>
        <h1 className="section-title">Workpiece Setup</h1>
        <p className="section-desc">
          Mount the fixture, position and clamp the workpiece, then verify material and set the work offset.
        </p>
      </div>

      {scenario && (
        <div className="scenario-panel">
          <div className="scenario-field">
            <span className="scenario-key">Fixture</span>
            <span className="scenario-value">{scenario.fixture}</span>
          </div>
          <div className="scenario-field">
            <span className="scenario-key">Work Offset</span>
            <span className="scenario-value">{scenario.workOffset}</span>
          </div>
          <div className="scenario-field">
            <span className="scenario-key">Drawing Rev.</span>
            <span className="scenario-value">{scenario.drawingRevision}</span>
          </div>
          <div className="scenario-field">
            <span className="scenario-key">Quantity</span>
            <span className="scenario-value">{scenario.quantity} pcs</span>
          </div>
        </div>
      )}

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="progress-text">
        <span>{confirmed} of {total} steps confirmed</span>
        <span>{pct}%</span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="checklist">
        {items.map(item => (
          <WorkpieceCard key={item.id} item={item} onConfirm={onConfirm} loading={loading} />
        ))}
      </div>

      <div className="action-footer">
        <span className="note">
          {allDone ? '✅ Workpiece ready — proceed to review' : `${total - confirmed} step(s) remaining`}
        </span>
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!allDone || loading}
          id="btn-next-stage3"
        >
          Ready Review →
        </button>
      </div>
    </section>
  );
}
