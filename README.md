# VMC_OPERATOR

**Primeform Labs – VMC Operator HMI**

A responsive full-stack Human-Machine Interface (HMI) that guides a VMC (Vertical Machining Centre) operator through the complete machine startup sequence before enabling a simulated machining operation.

---

## Live Demo

Open **https://frontend-delta-flame-92.vercel.app/** after starting both servers (see below).

---

## Assignment: Operator Screen Sequence

The HMI follows a strict 5-stage gated workflow:

| Stage | Name | Items |
|---|---|---|
| 1 | **Machine Checks** | Power, E-Stop, Door, Alarm, Lubrication, Homing |
| 2 | **Required Tools** | T01 Face Mill, T02 End Mill, T03 Drill, T04 M10 Tap |
| 3 | **Workpiece Setup** | Fixture mount, orientation, clamping, material verify, G54 offset |
| 4 | **Ready Review** | Full checklist summary + READY state indicator |
| 5 | **Operation** | READY → RUNNING → STOPPED simulation |

### Mock Scenario (Preloaded)
- **Operation**: Face Milling – Aluminium Bracket
- **Material**: Aluminium 6061-T6
- **CNC Program**: O1001 Rev-D
- **Drawing Revision**: Rev-D
- **Fixture**: Kurt D688 Vise – Station 1
- **Work Offset**: G54
- **Quantity**: 5 pcs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Styling | Vanilla CSS (dark industrial HMI theme) |
| Persistence | JSON file (`backend/state.json`) |

---

## Project Structure

```
VMC/
├── backend/
│   ├── server.js        # Express REST API (port 3001)
│   ├── package.json
│   └── state.json       # Auto-created; persists operator progress
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx              # Orchestrator + all API calls
        ├── api.js               # Backend API helper
        ├── index.css            # Full design system
        └── components/
            ├── Header.jsx
            ├── StageIndicator.jsx
            ├── MachineChecks.jsx
            ├── RequiredTools.jsx
            ├── WorkpieceSetup.jsx
            ├── ReadyReview.jsx
            └── Operation.jsx
```

---

## Getting Started

### 1. Backend

```bash
cd backend
npm install
node server.js
# → Running on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/state` | Get full app state + scenario data |
| POST | `/api/confirm` | Confirm a checklist item `{ stage, itemId }` |
| POST | `/api/next` | Advance to next stage (gated – all items must be confirmed) |
| POST | `/api/operation` | Start or stop the operation `{ action: 'start' \| 'stop' }` |
| POST | `/api/reset` | Reset all progress to initial state |

---

## UI Controls

| Control | Behaviour |
|---|---|
| **Confirm** | Marks the current item as confirmed |
| **Next / →** | Advances stage only when all items are confirmed |
| **Start Operation** | Transitions READY → RUNNING |
| **Stop Operation** | Transitions RUNNING → STOPPED (stage preserved) |
| **↺ Reset** | Returns to Stage 1 (Machine Checks) |

---

## Key Features

- ✅ Stage gating — cannot advance until every item on the current stage is confirmed
- ✅ State persistence — progress survives browser refresh via `state.json`
- ✅ Full `POWER ON → MACHINE CHECKS → TOOLS → WORKPIECE → READY → RUNNING` flow
- ✅ `RUNNING → STOPPED` preserves stage context
- ✅ Dark industrial HMI aesthetic with animated status badges
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Mock data preloaded — no manual data entry required

---

*Submitted for Primeform Labs Software Engineer Technical Assignment*
