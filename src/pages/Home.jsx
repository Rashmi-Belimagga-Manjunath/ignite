import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AGENTS, pipelineOrder } from "../lib/agents.js";
import { Eyebrow } from "../components/Eyebrow.jsx";

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
          <div className="flex justify-center">
            <Eyebrow n="00" text="The studio" center />
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight">
            FROM SIGNAL
            <br />
            <span className="gradient-text">→ TO BUSINESS</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-zinc-400 text-base sm:text-lg">
            IGNITE is an autonomous venture launch studio. Five specialised AI agents — a{" "}
            <span className="hl">Researcher</span>, <span className="hl">Designer</span>,{" "}
            <span className="hl">Maker</span>, <span className="hl">Communicator</span> and{" "}
            <span className="hl">Manager</span> — work as one unbroken pipeline, passing real work from
            one to the next, to research, design, build, market and launch a business using live data.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <Link to="/operations" className="px-6 py-3 rounded-lg font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 transition">
              ▶ Watch the organisation work
            </Link>
            <Link to="/chat" className="link-arrow">
              <span>IGNITE COMMAND</span> <span>→</span>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {pipelineOrder.map((id) => (
              <span key={id} className="tag dim">{AGENTS.find((a) => a.id === id).emoji} {AGENTS.find((a) => a.id === id).name}</span>
            ))}
            <span className="tag hot">demo: Mori Coffee · €3,000</span>
          </div>
        </div>
      </section>

      {/* ---------- ANIMATED CONSOLE ---------- */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 -mt-2 pb-10">
        <Console />
      </section>

      {/* ---------- STATEMENT ---------- */}
      <section className="border-y border-white/6 bg-white/[0.015]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 lg:py-20 text-center">
          <div className="flex justify-center"><Eyebrow n="01" text="The thesis" center /></div>
          <p className="statement text-3xl sm:text-5xl text-zinc-200">
            This is not a report about AI.
            <br />
            <span className="gradient-text">This is AI, working.</span>
          </p>
          <p className="mt-5 text-sm text-zinc-500 max-w-xl mx-auto">
            No demos with canned answers. Every number the organisation uses is fetched at query time
            — from a real SQLite database and live public APIs.
          </p>
        </div>
      </section>

      {/* ---------- THE ORGANISATION ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <Eyebrow n="02" text="The organisation" />
            <h2 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">Five agents. One unbroken pipeline.</h2>
          </div>
          <Link to="/agents" className="link-arrow mb-1">
            <span>Meet the five agents</span> <span>→</span>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {MOVES.map((m, i) => {
            const a = AGENTS.find((x) => x.role === m.who.split(" · ")[1]);
            return (
              <div key={m.name} className="card card-hover p-5 relative flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl" style={{ background: `${a.color}1f`, border: `1px solid ${a.color}55` }}>
                    {m.emoji}
                  </div>
                  <span className="idx"><span className="n">{String(i + 1).padStart(2, "0")}</span>/05</span>
                </div>
                <div className="font-display text-lg text-white font-bold">{m.name}</div>
                <div className="text-[11px] text-zinc-500 mb-2 font-mono">{m.who}</div>
                <p className="text-xs text-zinc-400 leading-relaxed flex-1">{m.desc}</p>
                <div className="mt-3 border-t border-white/6 pt-3 flex items-center justify-between">
                  <span className="tag live">operating</span>
                  <span className="font-mono text-[10px] text-zinc-600">→ {a.file}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- LIVE SIGNALS ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="card p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <Eyebrow n="03" text="Live signals — proven, not promised" />
              <h3 className="font-display text-2xl text-white font-bold">Every number is fetched at query time.</h3>
              <p className="mt-2 text-sm text-zinc-400 max-w-lg">
                The agents query Mori Coffee's real SQLite database and live public APIs the moment
                they work — weather, market discussions and business data, each with a timestamp.
              </p>
              <Link to="/data" className="link-arrow mt-4">
                <span>Open the Live Data console</span> <span>→</span>
              </Link>
            </div>
            <div className="grid gap-3 w-full lg:w-96">
              {[
                ["open-meteo", "live 3-day Dublin weather", "live API", "live"],
                ["business-data", "SQLite database (ignite.db)", "7 tables · 262 sales", "live"],
                ["reddit · wikipedia", "live market discussions", "public APIs", "live"],
              ].map(([t, s, tag, tone]) => (
                <div key={t} className="rounded-lg bg-black/30 border border-white/8 px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white font-mono">{t}</div>
                    <div className="text-xs text-zinc-500">{s}</div>
                  </div>
                  <span className={`tag ${tone === "live" ? "live" : ""}`}>{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- THE DEMO ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="mb-8">
          <Eyebrow n="04" text="The demo" />
          <h2 className="font-display text-3xl text-white font-bold tracking-tight">One request. One business.</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl text-white font-bold">Mori Coffee</h3>
              <span className="tag hot">client</span>
            </div>
            <p className="text-sm text-zinc-400">
              A small specialty coffee brand with <span className="hl">€3,000</span> wants a weekend pop-up in Dublin.
            </p>
            <div className="mt-4 rounded-lg bg-black/30 border border-white/8 p-4 font-mono text-sm text-zinc-300">
              <div className="text-amber-400">$ user</div>
              <p>"I have a coffee brand, €3,000, and want to launch something in Dublin this weekend."</p>
              <div className="text-amber-400 mt-3">$ ignite</div>
              <p>Understood. I'll investigate the live market, design the strongest opportunity, build the first version, prepare the launch campaign and evaluate whether it is viable.</p>
            </div>
            <Link to="/chat" className="link-arrow mt-4">
              <span>Try it in IGNITE COMMAND</span> <span>→</span>
            </Link>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl text-white font-bold">The output</h3>
              <span className="tag live">5 artefacts</span>
            </div>
            <p className="text-sm text-zinc-400 mb-4">A business, not a report. Five files, each one the next agent's input.</p>
            <ol className="space-y-2.5 text-sm text-zinc-400">
              {[
                ["01_Opportunity_Brief.md", "Scout finds the opportunity with live data"],
                ["02_Design_Specification.md", "Muse designs the pop-up experience"],
                ["03_Build_Package.md", "Forge builds a working pop-up website"],
                ["04_Launch_Kit.md", "Voice writes the launch campaign"],
                ["05_Executive_Briefing.md", "Pilot decides GO / NO-GO with revenue, cost & risk"],
              ].map(([f, d], i) => (
                <li key={f} className="flex items-center gap-3 rounded-lg bg-black/25 border border-white/6 px-3 py-2">
                  <span className="idx"><span className="n">{String(i + 1).padStart(2, "0")}</span></span>
                  <code className="font-mono text-xs text-amber-300">{f}</code>
                  <span className="text-xs text-zinc-500 hidden sm:inline ml-auto">{d}</span>
                </li>
              ))}
            </ol>
            <Link to="/artefacts" className="link-arrow mt-4">
              <span>View the artefacts</span> <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20 text-center">
        <div className="card p-10 glow-amber relative overflow-hidden bg-grid">
          <Eyebrow n="05" text="Run it" center />
          <h2 className="statement text-3xl sm:text-4xl text-white">Watch an organisation build a business.</h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-lg mx-auto">
            One request in, five agents working, one tangible business out.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            <Link to="/operations" className="px-6 py-3 rounded-lg font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 transition">
              ▶ Run the operation
            </Link>
            <Link to="/agents" className="link-arrow">
              <span>Meet the five agents</span> <span>→</span>
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
        <span className="ml-auto tag dim">live replay</span>
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
