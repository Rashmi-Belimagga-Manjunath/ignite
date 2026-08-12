import { useState } from "react";
import { Link } from "react-router-dom";
import { useLastRun } from "../hooks/useRun.js";
import { AGENTS, pipelineOrder } from "../lib/agents.js";
import Markdown from "../components/Markdown.jsx";
import PrototypeFrame from "../components/PrototypeFrame.jsx";

// The artefacts page — the organisation's real outputs. Reads the latest run
// from the shared store (written by Operations or the Chat page).
export default function Artefacts() {
  const run = useLastRun();
  const [tab, setTab] = useState("researcher");
  const results = run?.results || null;

  const download = (name, content) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!results) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <div className="text-5xl mb-4">📁</div>
        <h1 className="font-display text-2xl text-white font-bold mb-2">No artefacts yet</h1>
        <p className="text-sm text-zinc-500 mb-6">
          The organisation hasn't run in this browser session. Run the Mori Coffee operation and every
          agent's real output will appear here.
        </p>
        <Link to="/operations" className="inline-block px-6 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 transition">
          ▶ Run the operation
        </Link>
      </div>
    );
  }

  const agent = AGENTS.find((x) => x.id === tab);
  const output = results[tab] || "";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <header className="mb-6">
        <div className="eyebrow mb-1"><span className="bracket">[</span> <span className="n">01</span> · Real outputs, unbroken chain <span className="bracket">]</span></div>
        <h1 className="font-display text-3xl text-white font-bold">Artefacts — {run?.brief?.company || "Mori Coffee"}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Each file is one agent's actual output, passed to the next agent as its input.
        </p>
      </header>

      {/* tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {pipelineOrder.map((id) => {
          const a = AGENTS.find((x) => x.id === id);
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition ${active ? "bg-gradient-to-r from-amber-300 to-orange-500 text-black font-semibold" : "bg-white/4 border border-white/10 text-zinc-400 hover:text-white"}`}
            >
              {a.emoji} {a.file}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {tab === "maker" ? (
            <div className="space-y-4">
              <PrototypeFrame text={output} height={640} />
              <div className="card p-5">
                <div className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-mono mb-3">Full build package</div>
                <Markdown text={output} />
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{agent.emoji}</span>
                    <span className="font-display text-lg text-white font-bold">{agent.name} · {agent.role}</span>
                  </div>
                  <div className="font-mono text-xs text-amber-300 mt-1">{agent.file}</div>
                </div>
                <button
                  onClick={() => download(agent.file, output)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white border border-white/15 hover:bg-white/5"
                >
                  ⬇ Download
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                <Markdown text={output} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-mono mb-3">The chain</div>
            {pipelineOrder.map((id) => {
              const a = AGENTS.find((x) => x.id === id);
              const active = tab === id;
              return (
                <button key={id} onClick={() => setTab(id)} className={`w-full text-left px-3 py-2 rounded-lg mb-1.5 text-xs transition ${active ? "bg-white/8 text-white" : "text-zinc-400 hover:bg-white/4"}`}>
                  <span>{a.emoji}</span> <span className="font-mono">{a.file}</span>
                  <div className="text-[10px] text-zinc-600 mt-0.5">{a.output}</div>
                </button>
              );
            })}
          </div>
          <div className="card p-4 text-xs text-zinc-500 leading-relaxed">
            <span className="text-white font-semibold">How to read this:</span> every file below was
            produced by one agent and consumed in full by the next. The final file —
            <span className="font-mono text-amber-300"> 05_Executive_Briefing.md</span> — contains the
            GO/NO-GO decision based on everything above plus the Manager's independent re-query of the live forecast.
          </div>
        </div>
      </div>
    </div>
  );
}
