import React from 'react';

function ReviewGroup({ title, items }) {
  return (
    <div className="review-group">
      <div className="review-group-header">
        {title}
        <span className="count">{items.length} items</span>
      </div>
      {items.map(item => (
        <div key={item.id} className="review-item">
          <span className="review-check">✓</span>
          <span className="review-item-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReadyReview({ stageData, allStages, scenario, onNext, loading, error }) {
  const machineItems   = allStages?.[1]?.items || [];
  const toolItems      = allStages?.[2]?.items || [];
  const workpieceItems = allStages?.[3]?.items || [];

  return (
    <section>
      <div className="section-header">
        <div className="section-tag">Stage 04 / 05</div>
        <h1 className="section-title">Ready Review</h1>
        <p className="section-desc">
          All preparation stages are complete. Verify the summary below before starting the operation.
        </p>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {/* READY Banner */}
      <div className="ready-status">
        <div className="ready-icon">🟢</div>
        <div className="ready-title">ALL SYSTEMS READY</div>
        <div className="ready-sub">
          {scenario?.operation} · {scenario?.material} · {scenario?.cncProgram}
        </div>
      </div>

      {/* Summary */}
      <ReviewGroup title="🔧 Machine Checks" items={machineItems} />
      <ReviewGroup title="🔩 Required Tools" items={toolItems} />
      <ReviewGroup title="📐 Workpiece Setup" items={workpieceItems} />

      {/* Scenario summary */}
      {scenario && (
        <div className="scenario-panel" style={{ marginTop: '1rem' }}>
          <div className="scenario-field">
            <span className="scenario-key">Operation</span>
            <span className="scenario-value">{scenario.operation}</span>
          </div>
          <div className="scenario-field">
            <span className="scenario-key">Material</span>
            <span className="scenario-value">{scenario.material}</span>
          </div>
          <div className="scenario-field">
            <span className="scenario-key">CNC Program</span>
            <span className="scenario-value">{scenario.cncProgram}</span>
          </div>
          <div className="scenario-field">
            <span className="scenario-key">Work Offset</span>
            <span className="scenario-value">{scenario.workOffset}</span>
          </div>
          <div className="scenario-field">
            <span className="scenario-key">Fixture</span>
            <span className="scenario-value">{scenario.fixture}</span>
          </div>
          <div className="scenario-field">
            <span className="scenario-key">Quantity</span>
            <span className="scenario-value">{scenario.quantity} pcs</span>
          </div>
        </div>
      )}

      <div className="action-footer">
        <span className="note">
          ✅ Checklist complete — proceed to start the operation
        </span>
        <button
          className="btn-next"
          onClick={onNext}
          disabled={loading}
          id="btn-proceed-operation"
          style={{ background: 'linear-gradient(135deg, var(--green), #00c853)', boxShadow: '0 4px 20px var(--green-glow)' }}
        >
          Proceed to Operation →
        </button>
      </div>
    </section>
  );
}
