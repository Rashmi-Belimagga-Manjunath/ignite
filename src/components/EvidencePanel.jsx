import { computeConfidence } from "../lib/evidence.js";

// "Evidence used" — proves the data was fetched live: source + API/MCP name +
// record count + fetch timestamp, plus a confidence score.
export default function EvidencePanel({ evidence = [] }) {
  const confidence = computeConfidence(evidence);
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">LIVE EVIDENCE</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Confidence</span>
          <span className="font-mono text-sm text-amber-300">{confidence}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {evidence.length === 0 && <div className="text-xs text-zinc-600">Waiting for the first live query…</div>}
        {evidence.map((e, i) => (
          <div key={i} className="rounded-lg bg-black/30 border border-white/8 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-zinc-200">{e.source}</span>
              <span className="text-[11px] font-mono text-emerald-400 shrink-0">+{e.count}</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-zinc-500 truncate">{e.api}</span>
              <span className="text-[10px] font-mono text-zinc-600 shrink-0">
                {e.at ? new Date(e.at).toLocaleTimeString() : ""}
              </span>
            </div>
            {e.note && <div className="text-[11px] text-zinc-600 mt-0.5">{e.note}</div>}
          </div>
        ))}
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-600 mb-1">
          <span>Fetched live at query time</span>
          <span>Not hardcoded</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
