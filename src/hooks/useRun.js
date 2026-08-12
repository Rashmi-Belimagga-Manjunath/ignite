import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { runPipeline, DEMO_BRIEF } from "../lib/orchestrator.js";
import { runStore } from "../lib/store.js";
import { saveRun } from "../lib/history.js";

// Shared hook that runs the five-agent organisation with live events,
// streaming deltas, human checkpoints and handoff results.
export function useRun() {
  const [events, setEvents] = useState([]);
  const [delta, setDelta] = useState({});
  const [checkpoint, setCheckpoint] = useState(null);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const pendingRef = useRef(null);
  const eventsRef = useRef([]);

  const start = useCallback(async (brief = DEMO_BRIEF, { autoApprove = false } = {}) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    eventsRef.current = [];
    setEvents([]);
    setDelta({});
    setCheckpoint(null);
    setResults(null);
    setError(null);
    setRunning(true);

    try {
      const handoffs = await runPipeline({
        signal: ac.signal,
        brief,
        onEvent: (e) => {
          eventsRef.current = [...eventsRef.current, e];
          if (e.type === "agent:delta") {
            setDelta((d) => ({ ...d, [e.agentId]: (d[e.agentId] || "") + e.text }));
            return;
          }
          setEvents((ev) => [...ev, e]);
          if (e.type === "agent:start") {
            setDelta((d) => ({ ...d, [e.agentId]: "" }));
          }
        },
        checkpoint: async (info) => {
          if (autoApprove) return { action: "approve" };
          setCheckpoint({ agentId: info.agentId, file: info.file, excerpt: info.excerpt });
          return new Promise((resolve) => {
            pendingRef.current = resolve;
          });
        },
      });
      if (ac.signal.aborted) return;
      setResults(handoffs);
      runStore.set({ results: handoffs, brief, lastRun: Date.now() });
      try {
        saveRun({ brief, results: handoffs, events: eventsRef.current || [] });
      } catch {}
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error(err);
        setError(err?.message || String(err));
      }
    } finally {
      if (!ac.signal.aborted) setRunning(false);
    }
  }, []);

  const approve = useCallback(() => {
    if (pendingRef.current) {
      pendingRef.current({ action: "approve" });
      pendingRef.current = null;
    }
    setCheckpoint(null);
  }, []);

  const revise = useCallback((note) => {
    if (pendingRef.current) {
      pendingRef.current({ action: "revise", note });
      pendingRef.current = null;
    }
    setCheckpoint(null);
  }, []);

  const stop = useCallback(() => {
    if (pendingRef.current) {
      pendingRef.current({ action: "approve" });
      pendingRef.current = null;
    }
    setCheckpoint(null);
    abortRef.current?.abort();
    setRunning(false);
  }, []);

  return { events, delta, checkpoint, results, running, error, start, approve, revise, stop };
}

// Read the latest completed run from the shared store.
export function useLastRun() {
  return useSyncExternalStore(runStore.subscribe, runStore.get);
}
