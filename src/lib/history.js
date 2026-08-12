// Persistent archive of every run + chat in localStorage, so nothing the
// organisation produces is ever lost. Backs the /log page.
const RUNS_KEY = "ig_runs";
const CHATS_KEY = "ig_chats";
const MAX = 20;

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function write(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list.slice(0, MAX)));
  } catch {}
}

export function saveRun({ brief, results, events, at = Date.now() }) {
  const list = read(RUNS_KEY);
  const run = {
    id: at,
    at,
    brief,
    results: results || {},
    evidence: (events || []).filter((e) => e.type === "evidence"),
    tools: (events || []).filter((e) => e.type === "tool:end"),
    meta: {
      chars: Object.fromEntries(Object.entries(results || {}).map(([k, v]) => [k, (v || "").length])),
      decision: (results?.manager || "").match(/(?:GO|NO-GO|CONDITIONAL GO|REVISE)/i)?.[0]?.toUpperCase() || "—",
    },
  };
  write(RUNS_KEY, [run, ...list]);
  return run;
}

export function getRuns() {
  return read(RUNS_KEY);
}

export function clearRuns() {
  try {
    localStorage.removeItem(RUNS_KEY);
  } catch {}
}

export function saveChat({ messages, at = Date.now() }) {
  const list = read(CHATS_KEY);
  const chat = {
    id: at,
    at,
    messages: (messages || []).filter((m) => m.content && !m.streaming).slice(-60),
  };
  if (!chat.messages.length) return null;
  write(CHATS_KEY, [chat, ...list]);
  return chat;
}

export function getChats() {
  return read(CHATS_KEY);
}

export function clearChats() {
  try {
    localStorage.removeItem(CHATS_KEY);
  } catch {}
}
