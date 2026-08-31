import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import Header from './components/Header';
import StageIndicator from './components/StageIndicator';
import MachineChecks from './components/MachineChecks';
import RequiredTools from './components/RequiredTools';
import WorkpieceSetup from './components/WorkpieceSetup';
import ReadyReview from './components/ReadyReview';
import Operation from './components/Operation';

export default function App() {
  const [scenario, setScenario]         = useState(null);
  const [appState, setAppState]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]               = useState(null);
  const [actionError, setActionError]   = useState(null);

  // ── Load state from backend ──────────────────────────────────────────
  const fetchState = useCallback(async () => {
    try {
      const data = await api.getState();
      setScenario(data.scenario);
      setAppState(data.state);
      setError(null);
    } catch (e) {
      setError(`Cannot connect to backend: ${e.message}. Make sure the backend server is running on port 3001.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchState(); }, [fetchState]);

  // ── Confirm a checklist item ─────────────────────────────────────────
  const handleConfirm = async (itemId) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const data = await api.confirmItem(appState.currentStage, itemId);
      setAppState(data.state);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Advance to next stage ────────────────────────────────────────────
  const handleNext = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const data = await api.nextStage();
      setAppState(data.state);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Operation controls ───────────────────────────────────────────────
  const handleStart = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const data = await api.startOperation();
      setAppState(data.state);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const data = await api.stopOperation();
      setAppState(data.state);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────
  const handleReset = async () => {
    if (!window.confirm('Reset all progress and return to Machine Checks?')) return;
    setLoading(true);
    setActionError(null);
    try {
      const data = await api.reset();
      setAppState(data.state);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app-layout">
        <div className="loader">
          <div className="loader-ring" />
          <div className="loader-text">Connecting to VMC HMI backend…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout">
        <div className="loader">
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <div style={{ color: 'var(--red)', fontSize: '1rem', fontWeight: 700 }}>Backend Offline</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', maxWidth: 420 }}>
            {error}
          </div>
          <button
            onClick={fetchState}
            style={{
              marginTop: '1rem', padding: '10px 24px', borderRadius: 8,
              border: '1px solid var(--accent)', background: 'var(--accent-dim)',
              color: 'var(--accent)', cursor: 'pointer', fontSize: '0.88rem',
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
            }}
          >
            ↺ Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const currentStage = appState?.currentStage || 1;
  const stages       = appState?.stages || {};

  const renderStage = () => {
    const commonProps = {
      loading: actionLoading,
      error: actionError,
      onNext: handleNext,
    };

    switch (currentStage) {
      case 1:
        return (
          <MachineChecks
            stageData={stages[1]}
            onConfirm={handleConfirm}
            {...commonProps}
          />
        );
      case 2:
        return (
          <RequiredTools
            stageData={stages[2]}
            scenario={scenario}
            onConfirm={handleConfirm}
            {...commonProps}
          />
        );
      case 3:
        return (
          <WorkpieceSetup
            stageData={stages[3]}
            scenario={scenario}
            onConfirm={handleConfirm}
            {...commonProps}
          />
        );
      case 4:
        return (
          <ReadyReview
            stageData={stages[4]}
            allStages={stages}
            scenario={scenario}
            {...commonProps}
          />
        );
      case 5:
        return (
          <Operation
            scenario={scenario}
            operationStatus={appState.operationStatus}
            onStart={handleStart}
            onStop={handleStop}
            loading={actionLoading}
            error={actionError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Header
        scenario={scenario}
        operationStatus={appState?.operationStatus}
        onReset={handleReset}
      />
      <main className="main-content">
        <StageIndicator currentStage={currentStage} />
        {renderStage()}
      </main>
    </div>
  );
}
