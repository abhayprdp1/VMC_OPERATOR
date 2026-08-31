const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const STATE_FILE = path.join(__dirname, 'state.json');

app.use(cors());
app.use(express.json());

// ─── Mock Scenario Data ───────────────────────────────────────────────────────
const MOCK_SCENARIO = {
  operation: 'Face Milling – Aluminium Bracket',
  material: 'Aluminium 6061-T6',
  drawingRevision: 'Rev-D',
  cncProgram: 'O1001 Rev-D',
  quantity: 5,
  fixture: 'Kurt D688 Vise – Station 1',
  workOffset: 'G54',
};

const INITIAL_STATE = {
  currentStage: 1,
  operationStatus: 'READY', // READY | RUNNING | STOPPED
  stages: {
    1: {
      name: 'Machine Checks',
      items: [
        { id: 'mc1', label: 'Power / Control Available', detail: 'Main power ON, CNC controller booted', confirmed: false },
        { id: 'mc2', label: 'E-Stop Released', detail: 'Emergency stop button fully released and reset', confirmed: false },
        { id: 'mc3', label: 'Guard / Door Closed', detail: 'Spindle guard and all enclosure doors latched', confirmed: false },
        { id: 'mc4', label: 'No Active Alarm', detail: 'Alarm panel clear – zero active faults on controller', confirmed: false },
        { id: 'mc5', label: 'Lubrication & Coolant Ready', detail: 'Way lube level OK; coolant tank filled (min 80%)', confirmed: false },
        { id: 'mc6', label: 'Reference Return Complete', detail: 'All axes (X, Y, Z) homed to machine zero', confirmed: false },
      ],
    },
    2: {
      name: 'Required Tools',
      items: [
        { id: 't1', label: 'T01 – Ø63 mm Face Mill', detail: 'Insert into spindle pocket T01 | Program: O1001 Rev-D', confirmed: false },
        { id: 't2', label: 'T02 – Ø12 mm End Mill', detail: 'Insert into spindle pocket T02 | Program: O1001 Rev-D', confirmed: false },
        { id: 't3', label: 'T03 – Ø8 mm Drill', detail: 'Insert into spindle pocket T03 | Program: O1001 Rev-D', confirmed: false },
        { id: 't4', label: 'T04 – M10 Tap', detail: 'Insert into spindle pocket T04 | Program: O1001 Rev-D', confirmed: false },
      ],
    },
    3: {
      name: 'Workpiece Setup',
      items: [
        { id: 'wp1', label: 'Mount Fixture – Kurt D688 Vise', detail: 'Fix Kurt D688 Vise on Station 1 table slot; torque to 80 Nm', confirmed: false },
        { id: 'wp2', label: 'Orient Workpiece', detail: 'Long axis along X+ per Drawing Rev-D, face up', confirmed: false },
        { id: 'wp3', label: 'Apply Clamping Torque', detail: 'Vise jaw torque: 35 Nm as per fixture setup sheet', confirmed: false },
        { id: 'wp4', label: 'Verify Material – Al 6061-T6', detail: 'Confirm job tag matches: Aluminium 6061-T6 | Drawing Rev-D', confirmed: false },
        { id: 'wp5', label: 'Set Work Offset G54', detail: 'Touch off X0 Y0 Z0 at workpiece datum; store in G54', confirmed: false },
      ],
    },
    4: {
      name: 'Ready Review',
      items: [],
    },
    5: {
      name: 'Operation',
      items: [],
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not load state file, using initial state.');
  }
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/state – return full app state + scenario
app.get('/api/state', (req, res) => {
  const state = loadState();
  res.json({ scenario: MOCK_SCENARIO, state });
});

// POST /api/confirm – confirm a single checklist item
app.post('/api/confirm', (req, res) => {
  const { stage, itemId } = req.body;
  if (!stage || !itemId) return res.status(400).json({ error: 'stage and itemId required' });

  const state = loadState();
  const stageData = state.stages[stage];
  if (!stageData) return res.status(404).json({ error: 'Stage not found' });

  const item = stageData.items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.confirmed = true;
  saveState(state);
  res.json({ success: true, state });
});

// POST /api/next – advance to next stage (only if all current items confirmed)
app.post('/api/next', (req, res) => {
  const state = loadState();
  const current = state.currentStage;
  const stageData = state.stages[current];

  // Stages 4 and 5 don't gate on items
  if (current < 4) {
    const allConfirmed = stageData.items.every(i => i.confirmed);
    if (!allConfirmed) {
      return res.status(400).json({ error: 'All items must be confirmed before proceeding' });
    }
  }

  if (current < 5) {
    state.currentStage = current + 1;
    saveState(state);
    res.json({ success: true, state });
  } else {
    res.status(400).json({ error: 'Already at final stage' });
  }
});

// POST /api/operation – start or stop the simulated operation
app.post('/api/operation', (req, res) => {
  const { action } = req.body; // 'start' | 'stop'
  const state = loadState();

  if (state.currentStage !== 5) {
    return res.status(400).json({ error: 'Must be on Operation stage' });
  }

  if (action === 'start' && state.operationStatus === 'READY') {
    state.operationStatus = 'RUNNING';
  } else if (action === 'stop' && state.operationStatus === 'RUNNING') {
    state.operationStatus = 'STOPPED';
  } else {
    return res.status(400).json({ error: `Invalid action "${action}" from state "${state.operationStatus}"` });
  }

  saveState(state);
  res.json({ success: true, state });
});

// POST /api/reset – reset to initial state
app.post('/api/reset', (req, res) => {
  const fresh = JSON.parse(JSON.stringify(INITIAL_STATE));
  saveState(fresh);
  res.json({ success: true, state: fresh });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`VMC HMI Backend running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/state`);
  console.log(`  POST /api/confirm`);
  console.log(`  POST /api/next`);
  console.log(`  POST /api/operation`);
  console.log(`  POST /api/reset`);
});
