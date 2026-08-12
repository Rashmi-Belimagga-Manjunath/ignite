import { AGENTS, pipelineOrder } from "../lib/agents.js";

// The unbroken chain: five nodes showing idle / live / done states.
export default function PipelineFlow({ activeId = null, doneIds = [], waiting = false }) {
  const done = new Set(doneIds);
  const isActive = (id) => id === activeId;
  const isDone = (id) => done.has(id);
  const isWaiting = (id) => {
    if (!activeId) return false;
    const idx = pipelineOrder.indexOf(id);
    const act = pipelineOrder.indexOf(activeId);
    return idx > act;
  };

  return (
    <div className="flex flex-col gap-2">
      {pipelineOrder.map((id, i) => {
        const a = AGENTS.find((x) => x.id === id);
        const state = isDone(id) ? "done" : isActive(id) ? "live" : isWaiting(id) ? "waiting" : "idle";
        return (
          <div key={id} className="flex items-center gap-3">
            <div
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                state === "live"
                  ? "border-white/20 bg-white/8 shadow-lg"
                  : state === "done"
                  ? "border-white/10 bg-white/4"
                  : "border-white/6 bg-white/2 opacity-55"
              }`}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: `${a.color}1f`, border: `1px solid ${a.color}55` }}
              >
                {state === "done" ? "✓" : a.emoji}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{a.name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">{a.role}</span>
                </div>
                <div className="text-xs text-zinc-500 truncate font-mono">{a.file}</div>
              </div>
              <div className="ml-auto">
                {state === "live" && <div className="progress-indet w-24" />}
                {state === "done" && <span className="text-xs font-mono text-emerald-400">done</span>}
                {state === "waiting" && <span className="text-xs font-mono text-zinc-600">waiting…</span>}
                {state === "idle" && <span className="text-xs font-mono text-zinc-600">{waiting ? "" : "ready"}</span>}
              </div>
            </div>
            {i < pipelineOrder.length - 1 && <span className="text-zinc-600 -ml-1">↓</span>}
          </div>
        );
      })}
    </div>
  );
}
