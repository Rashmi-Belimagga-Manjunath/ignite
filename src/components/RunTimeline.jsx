import { useMemo, useState } from "react";
import { AGENTS, pipelineOrder } from "../lib/agents.js";

// The live run timeline — the visual heart of the operation. Shows every
// agent's INPUT file, OUTPUT file, tool calls and status, plus the human
// checkpoint where the user approves or asks for a revision.
export default function RunTimeline({ events, delta = {}, checkpoint, onApprove, onRevise }) {
  const reg = useMemo(() => buildRegistry(events), [events]);
  const activeIdx = pipelineOrder.findIndex((id) => reg[id]?.state === "live");
  const [note, setNote] = useState("");

  return (
    <div className="space-y-3">
      {pipelineOrder.map((id, i) => {
        const a = AGENTS.find((x) => x.id === id);
        const r = reg[id] || {};
        const isActive = r.state === "live";
        const isDone = r.state === "done";
        const isWaiting = activeIdx >= 0 && i > activeIdx && !isDone;

        return (
          <div
            key={id}
            className={`card p-4 transition-all ${isActive ? "border-white/20 bg-white/6" : ""}`}
            style={isActive ? { boxShadow: `0 0 40px -18px ${a.glow}` } : undefined}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: `${a.color}1f`, border: `1px solid ${a.color}55` }}
              >
                {isDone ? "✓" : a.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{a.name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">{a.role}</span>
                  {isActive && (
                    <span className="ml-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      Working…
                    </span>
                  )}
                  {isDone && (
                    <span className="ml-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
                      Completed ✓
                    </span>
                  )}
                  {isWaiting && (
                    <span className="ml-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 border border-white/10">
                      Waiting…
                    </span>
                  )}
                  {!isActive && !isDone && !isWaiting && (
                    <span className="ml-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-600 border border-white/10">
                      Next
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 font-mono">{a.file}</div>
              </div>
            </div>

            {/* INPUT / OUTPUT */}
            <div className="grid grid-cols-2 gap-2 mb-2 text-[11px] font-mono">
              <div className="rounded-lg bg-black/30 border border-white/8 px-2.5 py-1.5 truncate">
                <span className="text-zinc-600">INPUT </span>
                <span className={r.input ? "text-zinc-300" : "text-zinc-600"}>
                  {r.input || (i === 0 ? "live data · business db" : "—")}
                </span>
              </div>
              <div className="rounded-lg bg-black/30 border border-white/8 px-2.5 py-1.5 truncate">
                <span className="text-zinc-600">OUTPUT </span>
                <span className={isDone ? "text-amber-300" : "text-zinc-600"}>{isDone ? a.file : "pending"}</span>
              </div>
            </div>

            {/* context line */}
            {r.context && <div className="text-xs text-zinc-400 mb-1.5">▸ {r.context}</div>}

            {/* tool checklist */}
            {r.tools.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {r.tools.map((t, k) => (
                  <span
                    key={k}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                      t.done
                        ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/25"
                        : "bg-white/4 text-amber-300 border-white/10"
                    }`}
                    title={t.summary || t.name}
                  >
                    {t.done ? "✓" : "◌"} {t.name}
                  </span>
                ))}
              </div>
            )}

            {/* progress */}
            {isActive && <div className="progress-fill" />}
            {isDone && r.handoff && (
              <div className="text-xs text-zinc-500 font-mono">Delivered {r.handoff.file} — {r.handoff.excerpt?.slice(0, 90)}…</div>
            )}

            {/* live delta */}
            {isActive && delta[id] && (
              <div className="mt-2 text-xs text-zinc-400 whitespace-pre-wrap max-h-28 overflow-y-auto bg-black/25 rounded-lg p-2.5 border border-white/6">
                {delta[id]}
              </div>
            )}

            {/* checkpoint */}
            {checkpoint && checkpoint.agentId === id && (
              <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-3">
                <div className="text-xs font-semibold text-amber-300 mb-2">⏸ HUMAN CHECKPOINT — review {a.name}'s work before the handoff</div>
                <div className="text-xs text-zinc-300 max-h-24 overflow-y-auto whitespace-pre-wrap bg-black/25 rounded-lg p-2 mb-2 font-mono">
                  {checkpoint.excerpt?.slice(0, 300)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onApprove}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black bg-gradient-to-r from-emerald-400 to-emerald-500 hover:brightness-110"
                  >
                    ✓ Approve & continue
                  </button>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && note.trim()) onRevise(note); }}
                    placeholder="Revision note (optional)…"
                    className="flex-1 min-w-0 rounded-lg bg-black/40 border border-white/10 px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/50"
                  />
                  <button
                    onClick={() => onRevise(note)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 border border-amber-400/40 hover:bg-amber-400/10"
                  >
                    ↺ Revise
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function buildRegistry(events) {
  const reg = {};
  for (const id of pipelineOrder) reg[id] = { state: "idle", tools: [], input: null, context: null, handoff: null };
  let lastDone = null;
  for (const e of events || []) {
    if (e.type === "agent:start") {
      reg[e.agentId].state = "live";
      if (lastDone) reg[e.agentId].input = lastDone.file;
    } else if (e.type === "agent:context") {
      reg[e.agentId].context = e.text;
    } else if (e.type === "tool:start") {
      const a = reg[e.agentId];
      if (a) a.tools.push({ name: e.name, done: false });
    } else if (e.type === "tool:end") {
      const a = reg[e.agentId];
      if (a) {
        const t = a.tools.find((x) => x.name === e.name && !x.done);
        if (t) { t.done = true; t.summary = e.summary; }
      }
    } else if (e.type === "agent:end") {
      reg[e.agentId].state = "done";
      reg[e.agentId].handoff = e.handoff;
      reg[e.agentId].tools = reg[e.agentId].tools.map((t) => ({ ...t, done: true }));
      lastDone = e.handoff;
    }
  }
  // ensure only the currently active agent is "live" (in case of revise re-run)
  let active = 0;
  for (const id of pipelineOrder) if (reg[id].state === "live") active++;
  if (active > 1) for (const id of pipelineOrder) if (reg[id].state === "live") { reg[id].state = "idle"; }
  return reg;
}