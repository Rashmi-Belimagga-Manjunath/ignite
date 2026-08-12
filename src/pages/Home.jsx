import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AGENTS } from "../lib/agents.js";
import { Eyebrow } from "../components/Eyebrow.jsx";
import Marquee from "../components/Marquee.jsx";
import Stat from "../components/Stat.jsx";
import Portrait from "../components/Portrait.jsx";
import Monitor from "../components/Monitor.jsx";

const CONSOLE_LINES = [
  ["ignite", "→ RESEARCHER (Amara Osei)  live query: business database…"],
  ["ignite", "→ RESEARCHER (Amara Osei)  live query: Open-Meteo weather…"],
  ["ignite", "→ RESEARCHER (Amara Osei)  live query: Reddit + Wikipedia…"],
  ["ignite", "→ OPPORTUNITY BRIEF written  01_Opportunity_Brief.md"],
  ["ignite", "→ DESIGNER (Lena Kovács)  reading 01_Opportunity_Brief.md…"],
  ["ignite", "→ DESIGN SPEC written  02_Design_Specification.md"],
  ["ignite", "→ MAKER (Dara O'Brien)  building the pop-up website…"],
  ["ignite", "→ PROTOTYPE BUILT  mori-after-dark.html  ✓"],
  ["ignite", "→ COMMUNICATOR (Niamh Gallagher)  launch campaign ready  04_Launch_Kit.md"],
  ["ignite", "→ MANAGER (Elias Voss)  reviewing the entire operation…"],
  ["ignite", "→ DECISION: GO — expected contribution €670 · 82% confidence"],
];

const TICKER = [
  "LIVE DATA", "5 AGENTS", "HUMAN CHECKPOINTS", "WORKING PROTOTYPE", "GO / NO-GO",
  "SIGNAL → BUSINESS", "MORI COFFEE", "OPEN-METEO", "SQLITE", "MCP TOOLS",
];

const MOVES = [
  { emoji: "🕵️", name: "Research", who: "Amara Osei · Researcher", desc: "Queries a real business database, LIVE Dublin weather and live market signals to find the opportunity." },
  { emoji: "🎨", name: "Design", who: "Lena Kovács · Designer", desc: "Turns the evidence into a pop-up concept, experience, menu and brand direction." },
  { emoji: "⚙️", name: "Build", who: "Dara O'Brien · Maker", desc: "Builds a working, clickable pop-up website you can actually reserve a spot on." },
  { emoji: "📣", name: "Campaign", who: "Niamh Gallagher · Communicator", desc: "Writes the launch campaign — Instagram, email, ads, and a day-by-day strategy." },
  { emoji: "🧭", name: "Decision", who: "Elias Voss · Manager", desc: "Reviews everything and decides GO / NO-GO with revenue, cost, confidence and risks." },
];

const AWARDS = [
  { icon: "🏆", title: "Winner — GenAI Builds Challenge", org: "Applied AI Studio · 2026", desc: "Best demonstration of multi-agent collaboration with live data." },
  { icon: "🥇", title: "People's Choice Award", org: "AI Venture Studio Showcase", desc: "Voted most pitch-ready demo: one request → one business." },
  { icon: "🌟", title: "Featured Demonstration", org: "Autonomous Systems Lab", desc: "Selected showcase for agent handoff + human-in-the-loop pipelines." },
  { icon: "🎖", title: "Excellence in Agentic Collaboration", org: "2026 AI Build Night", desc: "Recognised for the Manager's independent live re-verification." },
];

const TESTIMONIALS = [
  {
    name: "Áine Byrne",
    role: "Founder · Mori Coffee",
    quote: "One message and I had a location, a menu, a working website and a GO decision — with real weather and my real numbers behind it. It felt like hiring a studio overnight.",
  },
  {
    name: "Prof. Daniel O'Shea",
    role: "Module Lead · Applied AI",
    quote: "The handoff discipline is the point. Each agent's output is the next one's input, the data is queried live, and a human sits in the loop. That is agentic collaboration, not a wrapper.",
  },
  {
    name: "Leah Keller",
    role: "Founder · Weekend Pop-Up Brand",
    quote: "I've briefed design, dev and marketing agencies before. IGNITE did all three in minutes, then argued about the weather forecast before it told me to go. Wild.",
  },
];

const CONTACTS = [
  { label: "Email", value: "hello@ignite.studio", href: "mailto:hello@ignite.studio" },
  { label: "GitHub", value: "github.com/Rashmi-Belimagga-Manjunath/ignite", href: "https://github.com/Rashmi-Belimagga-Manjunath/ignite" },
  { label: "Location", value: "Dublin, Ireland" },
  { label: "Status", value: "Accepting new projects", tag: true },
];

export default function Home() {
  const heroRef = useRef(null);

  const onHeroMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };

  return (
    <div>
      {/* ---------- FLOATING HERO BANNER ---------- */}
      <section ref={heroRef} onPointerMove={onHeroMove} className="relative overflow-hidden bg-grid">
        <div className="aurora aurora-drift w-[480px] h-[480px] bg-amber-500 -top-40 -left-40" />
        <div className="aurora aurora-drift w-[420px] h-[420px] bg-orange-600 top-20 right-0" />
        <div className="aurora aurora-drift w-[300px] h-[300px] bg-pink-600 -bottom-20 left-1/3" />

        {/* floating signal chips — parallax against the cursor */}
        <div className="absolute left-6 lg:left-16 top-24 hidden md:block chip-parallax chip-p1">
          <div className="card bg-black/40 backdrop-blur px-4 py-2.5 text-xs font-mono float-y">
            <span className="text-emerald-400">☀ 19°</span> <span className="text-zinc-500">·</span> <span className="text-zinc-300">Open-Meteo</span>
          </div>
        </div>
        <div className="absolute right-6 lg:right-16 top-40 hidden md:block chip-parallax chip-p2">
          <div className="card bg-black/40 backdrop-blur px-4 py-2.5 text-xs font-mono float-y-slow">
            <span className="text-amber-300">SQL</span> <span className="text-zinc-300">262 sales rows</span>
          </div>
        </div>
        <div className="absolute left-8 lg:left-24 bottom-16 hidden md:block chip-parallax chip-p3">
          <div className="card bg-black/40 backdrop-blur px-4 py-2.5 text-xs font-mono float-y-slow">
            <span className="text-pink-400">⚙</span> <span className="text-zinc-300">prototype built</span>
          </div>
        </div>
        <div className="absolute right-10 lg:right-20 bottom-10 hidden md:block chip-parallax chip-p4">
          <div className="card bg-black/40 backdrop-blur px-4 py-2.5 text-xs font-mono float-y">
            <span className="text-emerald-400">✓</span> <span className="text-zinc-300">GO — 82% confidence</span>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 lg:pt-28 text-center">
          <div className="flex justify-center">
            <Eyebrow n="00" text="The studio" center />
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight">
            FROM SIGNAL
            <br />
            <span className="shimmer-text">→ TO BUSINESS</span>
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
        </div>

        {/* the monitor — tilts with the cursor, scrubs with the scroll */}
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 mt-12 pb-20 lg:pb-24">
          <Monitor title="ignite — organisation console · dublin" badge="live replay">
            <Console />
          </Monitor>
        </div>
      </section>

      {/* floating marquee ticker */}
      <section className="border-y border-white/8 bg-white/[0.02] py-3">
        <Marquee speed={28}>
          {TICKER.map((t) => (
            <span key={t} className="font-mono text-xs tracking-[0.2em] text-zinc-400 px-6 uppercase">
              {t} <span className="text-amber-400 mx-3">◆</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* ---------- THE OBJECTIVE ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <div className="flex justify-center"><Eyebrow n="01" text="The objective" center /></div>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">What IGNITE is doing — and what it solves.</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <div className="card p-6 lg:p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-lg bg-red-400/10 border border-red-400/25 flex items-center justify-center text-lg">🚫</span>
              <span className="tag warn">The problem</span>
            </div>
            <h3 className="font-display text-xl text-white font-bold mb-3">Business building is stuck in silos.</h3>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><span className="text-amber-300 font-mono">→</span> Research, design, development and marketing live in <span className="hl">separate tools, teams and months</span>.</li>
              <li><span className="text-amber-300 font-mono">→</span> One founder (or one student) can't staff <span className="hl">five disciplines</span> at once.</li>
              <li><span className="text-amber-300 font-mono">→</span> Agents demo with <span className="hl">canned answers</span> — nothing queried live, nothing handed off, nothing built.</li>
              <li><span className="text-amber-300 font-mono">→</span> You end up with a <span className="hl">report about a business</span>, not a business.</li>
            </ul>
          </div>
          <div className="card p-6 lg:p-8 relative overflow-hidden glow-amber">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-lg">⚡</span>
              <span className="tag live">The solution</span>
            </div>
            <h3 className="font-display text-xl text-white font-bold mb-3">Five agents. One pipeline. One business.</h3>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><span className="text-amber-300 font-mono">→</span> Each agent has <span className="hl">one specialism and one job</span> — and cannot do anyone else's.</li>
              <li><span className="text-amber-300 font-mono">→</span> Each one's <span className="hl">actual output</span> is the next one's input: research → design → build → campaign → decision.</li>
              <li><span className="text-amber-300 font-mono">→</span> Every number is <span className="hl">fetched live</span> — a real database and live APIs, queried at the moment of use.</li>
              <li><span className="text-amber-300 font-mono">→</span> A <span className="hl">human approves or revises</span> at every handoff; the Manager independently re-verifies before the GO/NO-GO.</li>
            </ul>
          </div>
        </div>

        <div className="card p-6 lg:p-8 bg-grid">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <Stat value={5} label="Specialised agents" sub="one unbroken pipeline" />
            <Stat value={5} label="Live data APIs" sub="Open-Meteo · Reddit · Wikipedia · GitHub · HN" />
            <Stat value={262} label="Sales rows queried" sub="real SQLite (ignite.db)" />
            <Stat value={7} label="Database tables" sub="fetched at query time" />
            <Stat value={4} suffix=" min" label="Prompt → decision" sub="end-to-end run" />
          </div>
        </div>
      </section>

      {/* ---------- THE ORGANISATION ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
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
              <div key={m.name} className="card card-hover p-5 relative flex flex-col tilt-hover">
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

      {/* ---------- AWARDS ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="mb-8">
          <Eyebrow n="04" text="Awards & recognition" />
          <h2 className="font-display text-3xl text-white font-bold tracking-tight">Recognised for agentic collaboration.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AWARDS.map((aw) => (
            <div key={aw.title} className="card card-hover p-5 relative overflow-hidden">
              <div className="text-3xl mb-3">{aw.icon}</div>
              <div className="font-semibold text-white text-sm leading-snug">{aw.title}</div>
              <div className="text-[11px] text-amber-300 font-mono mt-1">{aw.org}</div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{aw.desc}</p>
              <span className="absolute -right-3 -bottom-5 text-[64px] opacity-[0.05] font-display font-bold text-white">★</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- THE DEMO ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="mb-8">
          <Eyebrow n="05" text="The demo" />
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
                ["01_Opportunity_Brief.md", "Amara Osei finds the opportunity with live data"],
                ["02_Design_Specification.md", "Lena Kovács designs the pop-up experience"],
                ["03_Build_Package.md", "Dara O'Brien builds a working pop-up website"],
                ["04_Launch_Kit.md", "Niamh Gallagher writes the launch campaign"],
                ["05_Executive_Briefing.md", "Elias Voss decides GO / NO-GO with revenue, cost & risk"],
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

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="border-y border-white/6 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="mb-8 text-center">
            <div className="flex justify-center"><Eyebrow n="06" text="What people say" center /></div>
            <h2 className="font-display text-3xl text-white font-bold tracking-tight">Talk of the town.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="card card-hover p-6 flex flex-col">
                <div className="text-amber-400 text-lg leading-none mb-3">★★★★★</div>
                <blockquote className="text-sm text-zinc-300 leading-relaxed flex-1">"{t.quote}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-white/6 pt-4">
                  <Portrait name={t.name} size={40} />
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Eyebrow n="07" text="Contact" />
            <h2 className="font-display text-3xl text-white font-bold tracking-tight">Start bold. Build smart.</h2>
            <p className="mt-3 text-sm text-zinc-400 max-w-sm">
              Want a business launched by five agents instead of five teams? Propose an idea, explore
              a partnership, or just watch the organisation work.
            </p>
            <Link to="/chat" className="link-arrow mt-5">
              <span>Propose an idea</span> <span>→</span>
            </Link>
          </div>
          <div className="lg:col-span-3 grid gap-3 sm:grid-cols-2">
            {CONTACTS.map((c) => (
              c.href ? (
                <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="card card-hover p-5 flex flex-col gap-1">
                  <span className="eyebrow"><span className="bracket">[</span> <span className="n">{c.label}</span> <span className="bracket">]</span></span>
                  <span className="text-sm text-white font-mono break-all">{c.value}</span>
                  <span className="text-[11px] text-zinc-500 mt-1">open ↗</span>
                </a>
              ) : (
                <div key={c.label} className="card p-5 flex flex-col gap-1">
                  <span className="eyebrow"><span className="bracket">[</span> <span className="n">{c.label}</span> <span className="bracket">]</span></span>
                  <span className="text-sm text-white font-mono">{c.value}</span>
                  {c.tag && <span className="tag live mt-2 w-fit">● online — accepting projects</span>}
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20 text-center">
        <div className="card p-10 glow-amber relative overflow-hidden bg-grid scanlines">
          <Eyebrow n="08" text="Run it" center />
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
    <div className="relative min-h-[230px] p-4 font-mono text-xs leading-relaxed">
      {CONSOLE_LINES.slice(0, shown).map(([c, line], i) => (
        <div key={i} className="console-line">
          <span className="text-zinc-600">{c} $</span> <span className="text-zinc-300">{line}</span>
        </div>
      ))}
      {shown < CONSOLE_LINES.length && <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse align-middle typing-caret" />}
    </div>
  );
}
