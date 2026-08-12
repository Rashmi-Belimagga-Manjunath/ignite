const LS_KEY = "ig_apikey";
const LS_MODEL = "ig_model";

export function getApiKey() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) return stored;
  } catch {}
  return import.meta.env.VITE_OPENAI_API_KEY || "";
}

export function setApiKey(key) {
  try { localStorage.setItem(LS_KEY, key); } catch {}
}

export function getModel() {
  try {
    const stored = localStorage.getItem(LS_MODEL);
    if (stored) return stored;
  } catch {}
  return import.meta.env.VITE_MODEL || "gpt-4o-mini";
}

export function setModel(model) {
  try { localStorage.setItem(LS_MODEL, model); } catch {}
}

export const ORG = {
  name: "IGNITE",
  tagline: "Signal. Shape. Ship. Sell. Scale.",
  demoClient: "Mori Coffee",
};
