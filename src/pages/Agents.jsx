import { useState } from "react";
import { AGENTS, pipelineOrder } from "../lib/agents.js";
import { listTools } from "../lib/mcp.js";
import { Eyebrow } from "../components/Eyebrow.jsx";
import Portrait from "../components/Portrait.jsx";

// The organisation, presented as five people: Amara, Lena, Dara, Niamh and Elias.
// Each card is a live-operations dossier — hover (or tap) to flip it over and read
// exactly what that person is accountable for. Cards tilt toward the cursor.

export default function Agents() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <header className="mb-6">
        <Eyebrow n="01" text="The organisation" />
        <h1 className="statement text-3xl sm:text-5xl text-white mt-3">
          A five-person team
          <br />
          <span className="gradient-text">that never sleeps.</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-4 max-w-2xl">
          Amara, Lena, Dara, Niamh and Elias. Five specialists with real identities, live tool
          access and their own judgement — organised into one unbroken pipeline. Each person's
          output becomes the next person's input, so the chain can never be broken.
        </p>
      </header>

      <StatusStrip />

      <AgentGrid />

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

function StatusStrip() {
  const tools = listTools();
  const items = [
    "system online",
    `${AGENTS.length} agents`,
    `${tools.length} registered tools`,
    "live API access",
    "human checkpoints",
    "dublin · 53.3498° N",
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-white/8 py-3 mb-10 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
      <span className="tag live">operating</span>
      {items.map((t) => (
        <span key={t} className="flex items-center gap-5">
          <span className="text-zinc-800">/</span> {t}
        </span>
      ))}
    </div>
  );
}

function AgentGrid() {
  const tools = listTools();
  const toolNames = new Set(tools.map((t) => t.name));

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {pipelineOrder.map((id, i) => {
        const a = AGENTS.find((x) => x.id === id);
        return (
          <div
            key={id}
            className={i === 4 ? "lg:col-span-2" : ""}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <AgentCard a={a} idx={i + 1} toolNames={toolNames} />
          </div>
        );
      })}
    </div>
  );
}

function AgentCard({ a, idx, toolNames }) {
  const [pinned, setPinned] = useState(false);

  const onPin = () => {
    if (window.matchMedia("(hover: none)").matches) setPinned((p) => !p);
  };

  const tilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${px * 9}deg) rotateX(${py * -9}deg) translateY(${py * -6}px)`;
  };
  const untilt = (e) => {
    e.currentTarget.style.transform = "rotateY(0deg) rotateX(0deg) translateY(0)";
  };

  return (
    <div
      className="flip-card h-[520px] sm:h-[480px] lg:h-[460px]"
      data-flip={pinned ? "1" : "0"}
      onClick={onPin}
      style={{ "--ag": a.color }}
    >
      <div
        className="flip-scene card relative h-full p-[1px]"
        onMouseMove={tilt}
        onMouseLeave={untilt}
      >
        <div className="flip-inner">
          <Front a={a} idx={idx} />
          <Back a={a} idx={idx} toolNames={toolNames} />
        </div>
      </div>
    </div>
  );
}

function Front({ a, idx }) {
  return (
    <div className="flip-face flip-front bg-[#0d0d16] border border-white/8">
      <div className="agent-ring" />
      <div className="relative z-10 h-full flex flex-col p-6">
        <div className="flex items-center justify-between">
          <span className="idx"><span className="n">AG-{String(idx).padStart(3, "0")}</span></span>
          <span className="tag live">operating</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="relative">
            <span
              className="absolute -inset-1.5 rounded-full opacity-40 blur-md"
              style={{ background: a.glow }}
            />
            <Portrait name={`${a.name} ${a.role}`} size={112} className="relative rounded-[0.875rem]" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-white font-bold tracking-tight">{a.name}</h2>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color: a.color }}>
                {a.role}
              </span>
              <span className="text-sm">{a.emoji}</span>
            </div>
          </div>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em] px-3 py-1 rounded-full border"
            style={{ color: a.color, borderColor: `${a.color}44`, background: `${a.color}14` }}
          >
            {a.superpower}
          </span>
          <p className="text-xs text-zinc-500 italic max-w-[240px]">"{a.quote}"</p>
        </div>

        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          <span>hover / tap to reveal duties</span>
          <span className="text-amber-300 text-sm">↻</span>
        </div>
      </div>
    </div>
  );
}

function Back({ a, idx, toolNames }) {
  return (
    <div className="flip-face flip-back bg-[#0a0a12] border border-white/12 scanlines">
      <div className="relative z-10 h-full flex flex-col p-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="eyebrow"><span className="bracket">[</span> <span className="n">{String(idx).padStart(2, "0")}</span> · Duties & responsibilities <span className="bracket">]</span></div>
          <span className="text-lg" aria-hidden="true">{a.emoji}</span>
        </div>

        <ul className="flex-1 mt-4 space-y-2.5">
          {a.duties.map((d) => (
            <li key={d} className="flex gap-2.5 text-[13px] text-zinc-300 leading-snug">
              <span className="text-amber-300 font-mono mt-0.5">→</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-white/8 pt-3 space-y-2.5">
          <div>
            <div className="eyebrow mb-1.5"><span className="bracket">[</span> Handoff <span className="bracket">]</span></div>
            <div className="font-mono text-xs text-amber-300">→ {a.file}</div>
            <div className="text-[11px] text-zinc-500">{a.output}</div>
          </div>
          <div>
            <div className="eyebrow mb-1.5"><span className="bracket">[</span> Tools <span className="bracket">]</span></div>
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
        </div>
      </div>
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
                  <Portrait name={`${a.name} ${a.role}`} size={28} />
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
