const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// --- session token (free-run tracking, mirrors MK Intel) ---
const TOKEN_KEY = "mk_campaign_session";

export function getSessionToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function setSessionToken(t) {
  try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
}

// Mint a session token once (stored in localStorage). Safe to call repeatedly.
export async function ensureSession() {
  let t = getSessionToken();
  if (t) return t;
  try {
    const r = await fetch(`${BASE}/campaign/session`, { method: "POST" });
    if (r.ok) { const d = await r.json(); if (d.session_token) { setSessionToken(d.session_token); return d.session_token; } }
  } catch { /* backend may not have the endpoint yet; proceed unauthenticated */ }
  return null;
}

async function post(path, payload, extraHeaders = {}) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    let detail = `${path} failed (${r.status})`;
    try {
      const body = await r.json();
      const d = body.detail ?? body;
      if (typeof d === "string") detail = d;
      else if (Array.isArray(d)) detail = d.map((e) => `${(e.loc || []).join(".")}: ${e.msg}`).join("; ");
      else if (d && typeof d === "object") detail = JSON.stringify(d);
    } catch { /* keep default */ }
    const err = new Error(detail);
    err.status = r.status;               // 402 = free run used, needs BYO key
    throw err;
  }
  return r.json();
}

export async function health() {
  const r = await fetch(`${BASE}/health`);
  return r.json();
}
// Full channel universe from the rulebook (source of truth for the wizard pickers).
export async function getChannels() {
  const r = await fetch(`${BASE}/campaign/channels`);
  if (!r.ok) throw new Error(`channels fetch failed (${r.status})`);
  return r.json();   // { channels: [{ key, label, group, send_model }] }
}

// Campaign flow — build-candidates sends the session token as a header for free-run tracking.
export function buildCandidates(payload) {
  const token = getSessionToken();
  return post("/campaign/build-candidates", payload, token ? { "x-mk-session": token } : {});
}
export function selectCandidate(msw_id, candidate_id) { return post("/campaign/select", { msw_id, candidate_id }); }
export function finalizePlan(msw_id) { return post("/campaign/finalize", { msw_id }); }

export function planHtmlUrl(campaign_code) { return `${BASE}/campaign/plan/${campaign_code}/html`; }
export function planDownloadUrl(campaign_code) { return `${BASE}/campaign/plan/${campaign_code}/download`; }
export function planJsonUrl(campaign_code) { return `${BASE}/campaign/plan/${campaign_code}/download.json`; }
