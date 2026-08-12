// Tiny module-level store so pages can share a completed pipeline run
// (Operations / Chat write it, Artefacts reads it).
const listeners = new Set();
let state = { results: null, brief: null, lastRun: null };

export const runStore = {
  set(next) {
    state = { ...state, ...next };
    listeners.forEach((l) => l(state));
  },
  get() {
    return state;
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
