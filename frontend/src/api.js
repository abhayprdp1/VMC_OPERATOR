/**
 * api.js — Dual-mode state manager
 *
 * LOCAL DEV:   calls the Express backend on http://localhost:3001
 * PRODUCTION:  uses localStorage (no backend needed on Vercel)
 *
 * The interface is identical in both modes so App.jsx never changes.
 */

// ─── Mock Scenario ────────────────────────────────────────────────────────────
const SCENARIO = {
  operation:       'Face Milling \u2013 Aluminium Bracket',
  material:        'Aluminium 6061-T6',
  drawingRevision: 'Rev-D',
  cncProgram:      'O1001 Rev-D',
  quantity:        5,
  fixture:         'Kurt D688 Vise \u2013 Station 1',
  workOffset:      'G54',
};

// ─── Initial State ────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  currentStage:    1,
  operationStatus: 'READY',
  stages: {
    1: {
      name: 'Machine Checks',
      items: [
        { id: 'mc1', label: 'Power / Control Available',    detail: 'Main power ON, CNC controller booted',                      confirmed: false },
        { id: 'mc2', label: 'E-Stop Released',              detail: 'Emergency stop button fully released and reset',             confirmed: false },
        { id: 'mc3', label: 'Guard / Door Closed',          detail: 'Spindle guard and all enclosure doors latched',             confirmed: false },
        { id: 'mc4', label: 'No Active Alarm',              detail: 'Alarm panel clear \u2013 zero active faults on controller',  confirmed: false },
        { id: 'mc5', label: 'Lubrication & Coolant Ready',  detail: 'Way lube level OK; coolant tank filled (min 80%)',          confirmed: false },
        { id: 'mc6', label: 'Reference Return Complete',    detail: 'All axes (X, Y, Z) homed to machine zero',                  confirmed: false },
      ],
    },
    2: {
      name: 'Required Tools',
      items: [
        { id: 't1', label: 'T01 \u2013 \u00d863 mm Face Mill', detail: 'Insert into spindle pocket T01 | Program: O1001 Rev-D', confirmed: false },
        { id: 't2', label: 'T02 \u2013 \u00d812 mm End Mill',  detail: 'Insert into spindle pocket T02 | Program: O1001 Rev-D', confirmed: false },
        { id: 't3', label: 'T03 \u2013 \u00d88 mm Drill',      detail: 'Insert into spindle pocket T03 | Program: O1001 Rev-D', confirmed: false },
        { id: 't4', label: 'T04 \u2013 M10 Tap',               detail: 'Insert into spindle pocket T04 | Program: O1001 Rev-D', confirmed: false },
      ],
    },
    3: {
      name: 'Workpiece Setup',
      items: [
        { id: 'wp1', label: 'Mount Fixture \u2013 Kurt D688 Vise', detail: 'Fix Kurt D688 Vise on Station 1 table slot; torque to 80 Nm', confirmed: false },
        { id: 'wp2', label: 'Orient Workpiece',                    detail: 'Long axis along X+ per Drawing Rev-D, face up',              confirmed: false },
        { id: 'wp3', label: 'Apply Clamping Torque',               detail: 'Vise jaw torque: 35 Nm as per fixture setup sheet',           confirmed: false },
        { id: 'wp4', label: 'Verify Material \u2013 Al 6061-T6',  detail: 'Confirm job tag matches: Aluminium 6061-T6 | Drawing Rev-D',  confirmed: false },
        { id: 'wp5', label: 'Set Work Offset G54',                 detail: 'Touch off X0 Y0 Z0 at workpiece datum; store in G54',         confirmed: false },
      ],
    },
    4: { name: 'Ready Review', items: [] },
    5: { name: 'Operation',    items: [] },
  },
};

// ─── Detect environment ───────────────────────────────────────────────────────
const IS_LOCAL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1');

const BASE = 'http://localhost:3001/api';
const LS_KEY = 'vmc_hmi_state';

// ─── localStorage helpers ─────────────────────────────────────────────────────
function lsGet() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : structuredClone(INITIAL_STATE);
  } catch {
    return structuredClone(INITIAL_STATE);
  }
}
function lsSave(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

// ─── Remote helpers (local dev only) ─────────────────────────────────────────
async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Exported API (same interface in both modes) ──────────────────────────────
export const api = IS_LOCAL
  ? {
      // ── Local dev: hit the Express backend ──────────────────────────────────
      getState:       ()              => request('GET',  '/state'),
      confirmItem:    (stage, itemId) => request('POST', '/confirm',   { stage, itemId }),
      nextStage:      ()              => request('POST', '/next'),
      startOperation: ()              => request('POST', '/operation', { action: 'start' }),
      stopOperation:  ()              => request('POST', '/operation', { action: 'stop' }),
      reset:          ()              => request('POST', '/reset'),
    }
  : {
      // ── Production: localStorage state ──────────────────────────────────────
      getState: async () => {
        return { scenario: SCENARIO, state: lsGet() };
      },

      confirmItem: async (stage, itemId) => {
        const state = lsGet();
        const item = state.stages[stage]?.items.find(i => i.id === itemId);
        if (!item) throw new Error('Item not found');
        item.confirmed = true;
        lsSave(state);
        return { success: true, state };
      },

      nextStage: async () => {
        const state = lsGet();
        const current = state.currentStage;
        if (current < 4) {
          const allConfirmed = state.stages[current].items.every(i => i.confirmed);
          if (!allConfirmed) throw new Error('All items must be confirmed before proceeding');
        }
        if (current < 5) state.currentStage = current + 1;
        lsSave(state);
        return { success: true, state };
      },

      startOperation: async () => {
        const state = lsGet();
        if (state.operationStatus !== 'READY') throw new Error('Operation not in READY state');
        state.operationStatus = 'RUNNING';
        lsSave(state);
        return { success: true, state };
      },

      stopOperation: async () => {
        const state = lsGet();
        if (state.operationStatus !== 'RUNNING') throw new Error('Operation not RUNNING');
        state.operationStatus = 'STOPPED';
        lsSave(state);
        return { success: true, state };
      },

      reset: async () => {
        const fresh = structuredClone(INITIAL_STATE);
        lsSave(fresh);
        return { success: true, state: fresh };
      },
    };
