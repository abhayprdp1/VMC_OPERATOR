import React from 'react';

function CheckCard({ item, onConfirm, loading }) {
  return (
    <div className={`check-card ${item.confirmed ? 'confirmed' : 'pending'}`}>
      <div className="check-icon">
        {item.confirmed ? '✅' : '⬜'}
      </div>
      <div className="check-info">
        <div className="check-label">{item.label}</div>
        <div className="check-detail">{item.detail}</div>
      </div>
      {item.confirmed ? (
        <div className="confirmed-badge">
          <span>✓</span> CONFIRMED
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

export default function MachineChecks({ stageData, onConfirm, onNext, loading, error }) {
  const items = stageData?.items || [];
  const confirmed = items.filter(i => i.confirmed).length;
  const total     = items.length;
  const allDone   = confirmed === total && total > 0;
  const pct       = total ? Math.round((confirmed / total) * 100) : 0;

  return (
    <section>
      <div className="section-header">
        <div className="section-tag">Stage 01 / 05</div>
        <h1 className="section-title">Machine Checks</h1>
        <p className="section-desc">
          Verify all machine systems are safe and operational before loading tools.
          Confirm each check one by one.
        </p>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="progress-text">
        <span>{confirmed} of {total} checks confirmed</span>
        <span>{pct}%</span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="checklist">
        {items.map(item => (
          <CheckCard key={item.id} item={item} onConfirm={onConfirm} loading={loading} />
        ))}
      </div>

      <div className="action-footer">
        <span className="note">
          {allDone ? '✅ All checks complete — ready to proceed' : `${total - confirmed} check(s) remaining`}
        </span>
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!allDone || loading}
          id="btn-next-stage1"
        >
          Load Tools →
        </button>
      </div>
    </section>
  );
}
