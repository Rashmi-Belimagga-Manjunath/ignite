import { useState } from "react";
import { AGENTS, pipelineOrder } from "../lib/agents.js";
import { listTools } from "../lib/mcp.js";
import { Eyebrow } from "../components/Eyebrow.jsx";

// The five agents, presented as a live-operations registry: each row carries an
// ID, its role in the organisation, an operating status, its superpower and the
// file it hands to the next agent. Expand a row to inspect it.

export default function Agents() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <header className="mb-8">
        <Eyebrow n="01" text="The organisation" />
        <h1 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">Five agents. One unbroken pipeline.</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-2xl">
          Each agent has its own system prompt, personality and domain expertise. Each one's actual
          output becomes the next one's input — so the chain can never be broken.
        </p>
      </header>

      <Registry />

      <Chain />

      <div className="card p-6 mt-8">
        <div className="flex items-center gap-3 mb-2">
          <Eyebrow n="02" text="Why this is agentic collaboration" />
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-zinc-400">
          <ul className="space-y-1.5">
            <li><span className="text-amber-300 font-mono">→</span> Each agent's <span className="hl">output file becomes the next agent's input file</span> — the handoff is the heart of the system.</li>
            <li><span className="text-amber-300 font-mono">→</span> The <span className="hl">Researcher</span> cannot design, the <span className="hl">Designer</span> cannot build, the <span className="hl">Maker</span> cannot market, and the <span className="hl">Communicator</span> cannot decide.</li>
          </ul>
          <ul className="space-y-1.5">
            <li><span className="text-amber-300 font-mono">→</span> The <span className="hl">Manager</span> independently re-queries the live forecast at decision time — the organisation does not blindly trust its own first findings.</li>
            <li><span className="text-amber-300 font-mono">→</span> Human <span className="hl">checkpoints</span> pause the pipeline after every agent so you can approve or request a revision.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Registry() {
  const [open, setOpen] = useState(null);
  const tools = listTools();
  const toolNames = new Set(tools.map((t) => t.name));

  return (
    <div className="card overflow-hidden">
      <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-white/8 bg-white/[0.02] text-[10px] uppercase tracking-[0.18em] text-zinc-600 font-mono">
        <span className="col-span-1">ID</span>
        <span className="col-span-3">Agent</span>
        <span className="col-span-2">Archetype</span>
        <span className="col-span-2">Status</span>
        <span className="col-span-4">Superpower / output</span>
      </div>

      {pipelineOrder.map((id, i) => {
        const a = AGENTS.find((x) => x.id === id);
        const isOpen = open === id;
        return (
          <div key={id} className="border-b border-white/6 last:border-0">
            <button
              onClick={() => setOpen(isOpen ? null : id)}
              className="w-full grid lg:grid-cols-12 items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
            >
              <span className="idx col-span-1"><span className="n">AG-{String(i + 1).padStart(3, "0")}</span></span>
              <span className="col-span-3 flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: `${a.color}1f`, border: `1px solid ${a.color}55` }}>{a.emoji}</span>
                <span>
                  <span className="font-display text-white font-bold block">{a.name}</span>
                  <span className="text-[11px] text-zinc-500 font-mono">{a.role}</span>
                </span>
              </span>
              <span className="col-span-2 text-sm text-zinc-400">{a.title}</span>
              <span className="col-span-2"><span className="tag live">operating</span></span>
              <span className="col-span-4 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-zinc-400">{a.superpower}</span>
                <span className="font-mono text-[11px] text-amber-300 whitespace-nowrap">{isOpen ? "close −" : "inspect +"}</span>
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 lg:pl-[calc(4.1666%+20px)]">
                <div className="grid md:grid-cols-2 gap-5 pt-2 border-t border-white/6">
                  <div>
                    <div className="eyebrow mb-2"><span className="bracket">[</span> Scope <span className="bracket">]</span></div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{a.scope}</p>
                    <div className="eyebrow mb-2 mt-4"><span className="bracket">[</span> Personality <span className="bracket">]</span></div>
                    <p className="text-xs text-zinc-400 leading-relaxed">"{a.quote}" — {a.personality}</p>
                  </div>
                  <div>
                    <div className="eyebrow mb-2"><span className="bracket">[</span> Handoff <span className="bracket">]</span></div>
                    <div className="font-mono text-xs text-amber-300">→ {a.file}</div>
                    <div className="text-[11px] text-zinc-500 mb-2">{a.output}</div>
                    <div className="eyebrow mb-2 mt-4"><span className="bracket">[</span> Tools <span className="bracket">]</span></div>
                    <div className="flex flex-wrap gap-1">
                      {a.tools.map((t) => (
                        <span key={t} className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${toolNames.has(t) ? "bg-emerald-400/8 text-emerald-300 border-emerald-400/20" : "bg-white/4 text-zinc-500 border-white/10"}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Chain() {
  const tools = listTools();
  const toolNames = new Set(tools.map((t) => t.name));
  return (
    <div className="card p-6 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <Eyebrow n="03" text="The unbroken chain" />
      </div>
      <div className="flex flex-col lg:flex-row items-stretch gap-3">
        {pipelineOrder.map((id, i) => {
          const a = AGENTS.find((x) => x.id === id);
          return (
            <div key={id} className="flex-1 flex lg:flex-col items-center gap-3">
              <div className="flex-1 lg:flex-none w-full rounded-lg bg-black/30 border border-white/8 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>{a.emoji}</span>
                  <span className="font-semibold text-white text-sm">{a.name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 ml-auto">{a.role}</span>
                </div>
                <div className="font-mono text-[11px] text-amber-300 mb-2">→ {a.file}</div>
                <div className="flex flex-wrap gap-1">
                  {a.tools.map((t) => (
                    <span
                      key={t}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${toolNames.has(t) ? "bg-emerald-400/8 text-emerald-300 border-emerald-400/20" : "bg-white/4 text-zinc-500 border-white/10"}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {i < pipelineOrder.length - 1 && <span className="text-amber-400 text-lg rotate-90 lg:rotate-0">→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
