// API communication layer for VMC HMI backend
const BASE = 'http://localhost:3001/api';

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

export const api = {
  getState: () => request('GET', '/state'),
  confirmItem: (stage, itemId) => request('POST', '/confirm', { stage, itemId }),
  nextStage: () => request('POST', '/next'),
  startOperation: () => request('POST', '/operation', { action: 'start' }),
  stopOperation: () => request('POST', '/operation', { action: 'stop' }),
  reset: () => request('POST', '/reset'),
};
