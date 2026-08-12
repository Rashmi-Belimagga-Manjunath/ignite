import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AGENTS, pipelineOrder } from "../lib/agents.js";

const CONSOLE_LINES = [
  ["ignite", "→ RESEARCHER (Scout)  live query: business database…"],
  ["ignite", "→ RESEARCHER (Scout)  live query: Open-Meteo weather…"],
  ["ignite", "→ RESEARCHER (Scout)  live query: Reddit + Wikipedia…"],
  ["ignite", "→ OPPORTUNITY BRIEF written  01_Opportunity_Brief.md"],
  ["ignite", "→ DESIGNER (Muse)  reading 01_Opportunity_Brief.md…"],
  ["ignite", "→ DESIGN SPEC written  02_Design_Specification.md"],
  ["ignite", "→ MAKER (Forge)  building the pop-up website…"],
  ["ignite", "→ PROTOTYPE BUILT  mori-after-dark.html  ✓"],
  ["ignite", "→ COMMUNICATOR (Voice)  launch campaign ready  04_Launch_Kit.md"],
  ["ignite", "→ MANAGER (Pilot)  reviewing the entire operation…"],
  ["ignite", "→ DECISION: GO — expected contribution €670 · 82% confidence"],
];

const MOVES = [
  { emoji: "🕵️", name: "Research", who: "Scout · Researcher", desc: "Queries a real business database, LIVE Dublin weather and live market signals to find the opportunity." },
  { emoji: "🎨", name: "Design", who: "Muse · Designer", desc: "Turns the evidence into a pop-up concept, experience, menu and brand direction." },
  { emoji: "⚙️", name: "Build", who: "Forge · Maker", desc: "Builds a working, clickable pop-up website you can actually reserve a spot on." },
  { emoji: "📣", name: "Campaign", who: "Voice · Communicator", desc: "Writes the launch campaign — Instagram, email, ads, and a day-by-day strategy." },
  { emoji: "🧭", name: "Decision", who: "Pilot · Manager", desc: "Reviews everything and decides GO / NO-GO with revenue, cost, confidence and risks." },
];

export default function Home() {
  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-grid">
        <div className="aurora w-[480px] h-[480px] bg-amber-500 -top-40 -left-40" />
        <div className="aurora w-[420px] h-[420px] bg-orange-600 top-20 right-0" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE · five agents · one pipeline
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-6xl text-white leading-[1.05] tracking-tight">
            FROM SIGNAL
            <br />
            <span className="gradient-text">→ TO BUSINESS</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-zinc-400 text-base sm:text-lg">
            IGNITE is an autonomous venture launch studio. Five specialised AI agents — a{" "}
            <span className="text-white">Researcher</span>, <span className="text-white">Designer</span>,{" "}
            <span className="text-white">Maker</span>, <span className="text-white">Communicator</span> and{" "}
            <span className="text-white">Manager</span> — work as one unbroken pipeline, passing real work from
            one to the next, to research, design, build, market and launch a business using live data.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/operations" className="px-6 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 transition">
              ▶ Watch the organisation work
            </Link>
            <Link to="/chat" className="px-6 py-3 rounded-xl font-semibold text-white border border-white/15 hover:bg-white/5 transition">
              💬 IGNITE COMMAND
            </Link>
          </div>
          <p className="mt-5 text-xs text-zinc-600 font-mono">
            Demo: Mori Coffee · €3,000 · a weekend pop-up in Dublin
          </p>
        </div>
      </section>

      {/* ---------- ANIMATED CONSOLE ---------- */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 -mt-2 pb-10">
        <Console />
      </section>

      {/* ---------- THE ORGANISATION ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-amber-400 font-mono mb-2">The organisation</div>
          <h2 className="font-display text-3xl text-white font-bold">Not five chatbots.<br />One organisation.</h2>
          <p className="mt-3 text-zinc-400 max-w-xl mx-auto text-sm">
            Each agent has its own system prompt, personality and domain expertise — and each agent's
            actual output becomes the next agent's input. The chain is unbroken.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {MOVES.map((m, i) => {
            const a = AGENTS.find((x) => x.role === m.who.split(" · ")[1]);
            return (
              <div key={m.name} className="card card-hover p-5 relative">
                <div className="absolute top-4 right-4 font-mono text-xs text-zinc-700">{String(i + 1).padStart(2, "0")}</div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: `${a.color}1f`, border: `1px solid ${a.color}55` }}>
                  {m.emoji}
                </div>
                <div className="font-semibold text-white">{m.name}</div>
                <div className="text-xs text-zinc-500 mb-2 font-mono">{m.who}</div>
                <p className="text-xs text-zinc-400 leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- LIVE DATA PROOF ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="card p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-amber-400 font-mono mb-2">Proven live, not promised</div>
              <h3 className="font-display text-2xl text-white font-bold">Every number is fetched at query time.</h3>
              <p className="mt-2 text-sm text-zinc-400 max-w-lg">
                The agents query Mori Coffee's real SQLite database and live public APIs the moment
                they work — weather, market discussions and business data, each with a timestamp.
              </p>
              <Link to="/data" className="inline-block mt-4 text-sm font-semibold text-amber-300 hover:text-amber-200">
                Open the Live Data page →
              </Link>
            </div>
            <div className="grid gap-3 w-full lg:w-96">
              {[
                ["Open-Meteo", "live 3-day Dublin weather", "keyless API"],
                ["business-data MCP", "SQLite database (ignite.db)", "7 tables · 262 sales rows"],
                ["Reddit · Wikipedia", "live market discussions", "public APIs"],
              ].map(([t, s, tag]) => (
                <div key={t} className="rounded-xl bg-black/30 border border-white/8 px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white font-mono">{t}</div>
                    <div className="text-xs text-zinc-500">{s}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/25">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- THE STORY ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-display text-xl text-white font-bold mb-3">The demo: Mori Coffee</h3>
            <p className="text-sm text-zinc-400">
              A small specialty coffee brand with <span className="text-white">€3,000</span> wants a weekend pop-up in Dublin.
            </p>
            <div className="mt-4 rounded-xl bg-black/30 border border-white/8 p-4 font-mono text-sm text-zinc-300">
              <div className="text-amber-400">$ user</div>
              <p>"I have a coffee brand, €3,000, and want to launch something in Dublin this weekend."</p>
              <div className="text-amber-400 mt-3">$ ignite</div>
              <p>Understood. I'll investigate the live market, design the strongest opportunity, build the first version, prepare the launch campaign and evaluate whether it is viable.</p>
            </div>
            <Link to="/chat" className="inline-block mt-4 text-sm font-semibold text-amber-300 hover:text-amber-200">
              Try it in IGNITE COMMAND →
            </Link>
          </div>
          <div className="card p-6">
            <h3 className="font-display text-xl text-white font-bold mb-3">The output: a business, not a report</h3>
            <ol className="space-y-2.5 text-sm text-zinc-400">
              {[
                ["01_Opportunity_Brief.md", "Scout finds the opportunity with live data"],
                ["02_Design_Specification.md", "Muse designs the pop-up experience"],
                ["03_Build_Package.md", "Forge builds a working pop-up website"],
                ["04_Launch_Kit.md", "Voice writes the launch campaign"],
                ["05_Executive_Briefing.md", "Pilot decides GO / NO-GO with revenue, cost & risk"],
              ].map(([f, d]) => (
                <li key={f} className="flex items-center gap-3 rounded-lg bg-black/25 border border-white/6 px-3 py-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <code className="font-mono text-xs text-amber-300">{f}</code>
                  <span className="text-xs text-zinc-500 hidden sm:inline">— {d}</span>
                </li>
              ))}
            </ol>
            <Link to="/artefacts" className="inline-block mt-4 text-sm font-semibold text-amber-300 hover:text-amber-200">
              View the artefacts →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20 text-center">
        <div className="card p-10 glow-amber relative overflow-hidden bg-grid">
          <h2 className="font-display text-3xl text-white font-bold">Watch an organisation build a business.</h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-lg mx-auto">
            One request in, five agents working, one tangible business out. This is AI, working.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/operations" className="px-6 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 transition">
              ▶ Run the operation
            </Link>
            <Link to="/agents" className="px-6 py-3 rounded-xl font-semibold text-white border border-white/15 hover:bg-white/5 transition">
              Meet the five agents
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------- Animated terminal that replays the pipeline ----------
function Console() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= CONSOLE_LINES.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 380);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div className="card overflow-hidden bg-black/50">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 bg-white/3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 text-xs font-mono text-zinc-500">ignite — organisation console</span>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed min-h-[220px]">
        {CONSOLE_LINES.slice(0, shown).map(([c, line], i) => (
          <div key={i} className="console-line">
            <span className="text-zinc-600">{c} $</span> <span className="text-zinc-300">{line}</span>
          </div>
        ))}
        {shown < CONSOLE_LINES.length && <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse align-middle" />}
      </div>
    </div>
  );
}
