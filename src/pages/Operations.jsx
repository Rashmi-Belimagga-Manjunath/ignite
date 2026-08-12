import { useState } from "react";
import { Link } from "react-router-dom";
import { useRun } from "../hooks/useRun.js";
import { DEMO_BRIEF } from "../lib/orchestrator.js";
import { AGENTS, pipelineOrder } from "../lib/agents.js";
import { Eyebrow } from "../components/Eyebrow.jsx";
import RunTimeline from "../components/RunTimeline.jsx";
import EvidencePanel from "../components/EvidencePanel.jsx";
import PrototypeFrame from "../components/PrototypeFrame.jsx";
import Markdown from "../components/Markdown.jsx";
import { hasKey } from "../lib/llm.js";

export default function Operations() {
  const { events, delta, checkpoint, results, running, error, start, approve, revise, stop } = useRun();
  const [auto, setAuto] = useState(false);

  const evidence = events.filter((e) => e.type === "evidence");
  const makerOutput = results?.maker || "";
  const managerOutput = results?.manager || "";
  const go = /🟢|GO/i.test(managerOutput) && !/NO-GO/i.test(managerOutput);

  const status = running ? ["running", "RUNNING"] : results ? ["live", "COMPLETE"] : ["dim", "STANDBY"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Eyebrow n="01" text="Live operation" />
            <span className={`tag ${status[0]}`}><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> {status[1]}</span>
          </div>
          <h1 className="font-display text-3xl text-white font-bold tracking-tight">Mori Coffee — Dublin Launch</h1>
          <p className="text-sm text-zinc-500 mt-1 font-mono">
            €3,000 budget · a weekend pop-up · five agents · one unbroken pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="accent-amber-400" />
            Auto-approve checkpoints
          </label>
          {!running && !results ? (
            <button
              onClick={() => start(DEMO_BRIEF, { autoApprove: auto })}
              className="px-5 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 transition"
            >
              {hasKey() ? "▶ START OPERATION" : "Add your API key in Settings"}
            </button>
          ) : running ? (
            <button onClick={stop} className="px-5 py-2.5 rounded-lg font-semibold text-white border border-red-400/40 hover:bg-red-400/10 transition">
              ⏹ Stop
            </button>
          ) : (
            <button
              onClick={() => start(DEMO_BRIEF, { autoApprove: auto })}
              className="px-5 py-2.5 rounded-lg font-semibold text-white border border-white/15 hover:bg-white/5 transition"
            >
              ⟳ Run again
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!running && !results && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 card p-6 bg-grid">
            <h2 className="font-display text-xl text-white font-bold mb-3">Watch the organisation work</h2>
            <p className="text-sm text-zinc-400 mb-4 max-w-xl">
              Hit start and five agents will research with live data, design, build a working pop-up
              website, write the launch campaign and independently re-verify the live forecast before
              deciding whether Mori Coffee should launch.
            </p>
            <div className="rounded-lg bg-black/40 border border-white/8 p-4 font-mono text-sm">
              <div className="text-amber-400">$ user</div>
              <p className="text-zinc-300">"I have a coffee brand, €3,000, and want to launch something in Dublin this weekend."</p>
              <div className="text-amber-400 mt-3">$ ignite</div>
              <p className="text-zinc-300">Understood. I'll investigate the live market, design the opportunity, build the first version, prepare the campaign and evaluate viability.</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
              {pipelineOrder.map((id) => (
                <span key={id} className="tag dim">
                  {AGENTS.find((a) => a.id === id).emoji} {AGENTS.find((a) => a.id === id).name} <span className="text-amber-400">→</span> {AGENTS.find((a) => a.id === id).file}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center gap-2 mb-3"><Eyebrow n="02" text="Why checkpoints" /></div>
            <p className="text-sm text-zinc-400 mb-3">
              After every agent, IGNITE pauses and shows you its work. You either{" "}
              <span className="text-emerald-300">approve</span> the handoff or ask the agent to{" "}
              <span className="text-amber-300">revise</span> — a real human in the loop.
            </p>
            <div className="flex items-center gap-2 mb-3 mt-5"><Eyebrow n="03" text="Why a Manager re-verification" /></div>
            <p className="text-sm text-zinc-400">
              The Manager does not trust the Researcher's numbers blindly. It independently re-queries the
              live forecast and business data at decision time, and changes its recommendation if conditions moved.
            </p>
            <Link to="/chat" className="link-arrow mt-4">
              <span>Or start from the chatbot</span> <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {(running || results) && (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* LEFT: pipeline */}
          <div className="lg:col-span-3 space-y-4">
            <RunTimeline events={events} delta={delta} checkpoint={checkpoint} onApprove={approve} onRevise={revise} />
            <EvidencePanel evidence={evidence} />
          </div>

          {/* RIGHT: live artefact + outcome */}
          <div className="lg:col-span-2 space-y-4">
            {makerOutput ? (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="eyebrow"><span className="bracket">[</span> <span className="n">04</span> · Live artefact — built by Forge <span className="bracket">]</span></span>
                  <span className="tag hot">working prototype</span>
                </div>
                <PrototypeFrame text={makerOutput} height={620} />
              </div>
            ) : (
              <div className="card p-6 text-center text-sm text-zinc-500">
                <div className="text-3xl mb-2">🛠️</div>
                Waiting for Forge to build the pop-up website…
                {running && <div className="mt-3"><div className="progress-indet w-full" /></div>}
              </div>
            )}

            {managerOutput && (
              <div className={`card p-4 ${go ? "border-emerald-400/30" : "border-amber-400/30"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="eyebrow"><span className="bracket">[</span> <span className="n">05</span> · Executive decision — by Pilot <span className="bracket">]</span></span>
                  <span className="tag live">re-verified</span>
                </div>
                <div className={`font-display text-2xl font-bold ${go ? "text-emerald-400" : "text-amber-300"}`}>
                  {go ? "🟢 LAUNCH APPROVED" : "Launch recommendation"}
                </div>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  <Markdown text={managerOutput.slice(0, 900)} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {results && (
        <div className="mt-8 card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-display text-lg text-white font-bold">The organisation's output</h3>
            <Link to="/artefacts" className="link-arrow">
              <span>Open all five artefacts</span> <span>→</span>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            {pipelineOrder.map((id) => {
              const a = AGENTS.find((x) => x.id === id);
              const out = results[id] || "";
              return (
                <div key={id} className="rounded-xl bg-black/25 border border-white/8 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{a.emoji}</span>
                    <span className="text-sm text-white font-semibold">{a.name}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">{a.file}</div>
                  <div className="text-[11px] text-zinc-600 mt-1">{out.length} chars · {out.split("\n").length} lines</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
