import React from 'react';

function ToolCard({ item, onConfirm, loading }) {
  return (
    <div className={`check-card ${item.confirmed ? 'confirmed' : 'pending'}`}>
      <div className="check-icon">
        {item.confirmed ? '✅' : '🔩'}
      </div>
      <div className="check-info">
        <div className="check-label">{item.label}</div>
        <div className="check-detail">{item.detail}</div>
      </div>
      {item.confirmed ? (
        <div className="confirmed-badge">
          <span>✓</span> INSERTED
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

export default function RequiredTools({ stageData, scenario, onConfirm, onNext, loading, error }) {
  const items     = stageData?.items || [];
  const confirmed = items.filter(i => i.confirmed).length;
  const total     = items.length;
  const allDone   = confirmed === total && total > 0;
  const pct       = total ? Math.round((confirmed / total) * 100) : 0;

  return (
    <section>
      <div className="section-header">
        <div className="section-tag">Stage 02 / 05</div>
        <h1 className="section-title">Required Tools</h1>
        <p className="section-desc">
          Insert each tool into its designated pocket and confirm. All tools must be loaded before proceeding.
        </p>
      </div>

      {scenario && (
        <div className="scenario-panel">
          <div className="scenario-field">
            <span className="scenario-key">CNC Program</span>
            <span className="scenario-value">{scenario.cncProgram}</span>
          </div>
          <div className="scenario-field">
            <span className="scenario-key">Operation</span>
            <span className="scenario-value">{scenario.operation}</span>
          </div>
          <div className="scenario-field">
            <span className="scenario-key">Material</span>
            <span className="scenario-value">{scenario.material}</span>
          </div>
        </div>
      )}

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="progress-text">
        <span>{confirmed} of {total} tools confirmed</span>
        <span>{pct}%</span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="checklist">
        {items.map(item => (
          <ToolCard key={item.id} item={item} onConfirm={onConfirm} loading={loading} />
        ))}
      </div>

      <div className="action-footer">
        <span className="note">
          {allDone ? '✅ All tools loaded — ready to proceed' : `${total - confirmed} tool(s) remaining`}
        </span>
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!allDone || loading}
          id="btn-next-stage2"
        >
          Setup Workpiece →
        </button>
      </div>
    </section>
  );
}
