import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRun } from "../hooks/useRun.js";
import { runGeneral, runFollowUp, DEMO_TRIGGER } from "../lib/chat.js";
import { DEMO_BRIEF } from "../lib/orchestrator.js";
import { AGENTS } from "../lib/agents.js";
import { hasKey } from "../lib/llm.js";
import RunTimeline from "../components/RunTimeline.jsx";
import EvidencePanel from "../components/EvidencePanel.jsx";
import PrototypeFrame from "../components/PrototypeFrame.jsx";

const DEMO_PROMPT = "I have a coffee brand, €3,000, and want to launch something in Dublin this weekend.";
const SUGGESTIONS = [
  DEMO_PROMPT,
  "What does IGNITE do?",
  "Who are the five agents?",
  "Show me how the live data is fetched",
];

const NARRATOR = {
  researcher: "🕵️ Scout is investigating the live market — business database, weather, and what Dublin is discussing right now…",
  designer: "🎨 Muse is turning the evidence into a pop-up concept…",
  maker: "⚙️ Forge is building the actual pop-up website…",
  communicator: "📣 Voice is writing the launch campaign…",
  manager: "🧭 Pilot is independently re-querying the live forecast to verify the research before deciding…",
};
const DELIVERED = {
  researcher: "Research complete — 01_Opportunity_Brief.md written.",
  designer: "Design complete — 02_Design_Specification.md written.",
  maker: "Build complete — 03_Build_Package.md with a working prototype.",
  communicator: "Campaign complete — 04_Launch_Kit.md written.",
  manager: "Executive decision complete — 05_Executive_Briefing.md written.",
};

export default function Chat() {
  const run = useRun();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [auto, setAuto] = useState(false);
  const [phase, setPhase] = useState("idle");
  const histRef = useRef([]);
  const bootedRef = useRef(false);
  const evIdxRef = useRef(0);
  const scrollRef = useRef(null);

  const { events, delta, checkpoint, results, running, error, start, approve, revise } = run;

  const push = (m) => {
    setMessages((prev) => [...prev, m]);
    histRef.current = [...histRef.current, m];
  };
  const patchLast = (patch) => {
    setMessages((prev) => {
      const next = [...prev];
      const i = next.length - 1;
      next[i] = { ...next[i], ...patch };
      histRef.current = next;
      return next;
    });
  };

  // Welcome message once.
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    push({
      role: "assistant",
      content: "I'm **IGNITE COMMAND** — the front door to the venture studio.\n\nTell me about a business you want to launch and I'll run the whole organisation: research with live data, design, build a working product, write the campaign, and decide whether it's viable. Try the demo below:",
    });
  }, []);

  // Narrate the pipeline from events.
  useEffect(() => {
    if (events.length <= evIdxRef.current) return;
    const newEv = events.slice(evIdxRef.current);
    evIdxRef.current = events.length;
    for (const e of newEv) {
      if (e.type === "agent:start") {
        setPhase("running");
        push({ role: "assistant", kind: "narrator", content: NARRATOR[e.agentId] });
      } else if (e.type === "agent:end") {
        push({ role: "assistant", kind: "narrator", content: `✓ ${DELIVERED[e.agentId]}` });
      } else if (e.type === "checkpoint:open") {
        push({ role: "assistant", kind: "narrator", content: `⏸ Human checkpoint — review ${AGENTS.find((a) => a.id === e.agentId)?.name}'s work (${e.file}) in the pipeline panel, then approve or ask for a revision.` });
      } else if (e.type === "pipeline:end") {
        setPhase("done");
      }
    }
  }, [events]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, delta]);

  async function handleSend(raw) {
    const text = (raw ?? input).trim();
    if (!text || running) return;
    setInput("");
    if (text === DEMO_TRIGGER || text === DEMO_PROMPT) {
      push({ role: "user", content: text });
      push({
        role: "assistant",
        content: "Understood. I'll investigate the live market, design the strongest opportunity, build the first version, prepare the launch campaign, and evaluate whether it is commercially viable.",
      });
      start(DEMO_BRIEF, { autoApprove: auto });
      return;
    }

    push({ role: "user", content: text });

    if (results && phase === "done") {
      push({ role: "assistant", content: "", streaming: true });
      try {
        await runFollowUp({
          history: histRef.current.slice(0, -1),
          brief: DEMO_BRIEF,
          results,
          onDelta: (t) => patchLast({ content: (histRef.current[histRef.current.length - 1]?.content || "") + t }),
        });
      } catch (err) {
        patchLast({ content: `⚠️ ${err?.message || "Something went wrong"}` });
      }
      return;
    }

    push({ role: "assistant", content: "", streaming: true });
    try {
      await runGeneral({
        history: histRef.current.slice(0, -1),
        onDelta: (t) => patchLast({ content: (histRef.current[histRef.current.length - 1]?.content || "") + t }),
      });
    } catch (err) {
      patchLast({ content: `⚠️ ${err?.message || "Something went wrong"}` });
    }
  }

  const evidence = events.filter((e) => e.type === "evidence");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="eyebrow mb-1"><span className="bracket">[</span> <span className="n">01</span> · Front door <span className="bracket">]</span></div>
          <h1 className="font-display text-3xl text-white font-bold">IGNITE COMMAND</h1>
          <p className="text-sm text-zinc-500 mt-1">One request in. Five agents working. One business out.</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="accent-amber-400" />
          Auto-approve checkpoints
        </label>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* CHAT */}
        <div className={`${running || results ? "lg:col-span-2" : "lg:col-span-3 mx-auto lg:max-w-3xl w-full"} card flex flex-col h-[640px]`}>
          <div className="px-4 py-2.5 border-b border-white/8 bg-white/3 flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> IGNITE COMMAND · {running ? "organisation running" : phase === "done" ? "run complete" : "ready"}
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-amber-300 to-orange-500 text-black font-medium"
                      : m.kind === "narrator"
                      ? "bg-black/30 border border-white/8 text-zinc-400 font-mono text-xs"
                      : m.streaming
                      ? "bg-white/5 border border-white/8 text-zinc-300"
                      : "bg-white/5 border border-white/8 text-zinc-300"
                  }`}
                >
                  {m.content || (m.streaming && <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse align-middle" />)}
                </div>
              </div>
            ))}
            {running && <div className="text-xs text-zinc-600 font-mono animate-pulse">agents at work…</div>}
          </div>

          {phase === "idle" && messages.length <= 2 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/12 text-zinc-300 hover:bg-white/5 hover:text-white transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {phase === "done" && !running && (
            <div className="px-4 pb-3 border-t border-white/8 pt-3 text-xs text-zinc-500">
              The organisation finished. Ask it anything about the run — e.g.{" "}
              <button className="text-amber-300 hover:text-amber-200" onClick={() => handleSend("Why should we launch? What's the risk?")}>
                "Why should we launch?"
              </button>
            </div>
          )}

          <div className="p-3 border-t border-white/8 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={!hasKey() ? "Add your API key in Settings first…" : running ? "The organisation is running…" : "Ask IGNITE something…"}
              disabled={running}
              className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/50 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={running}
              className="px-5 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 disabled:opacity-50 transition"
            >
              {running ? "…" : "Send"}
            </button>
          </div>
        </div>

        {/* PIPELINE PANEL */}
        {(running || results) && (
          <div className="lg:col-span-3 space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {!hasKey() && !running && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm text-amber-200">
                No API key found — add one in <Link to="/settings" className="underline">Settings</Link> to run the organisation.
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>
            )}
            <RunTimeline events={events} delta={delta} checkpoint={checkpoint} onApprove={approve} onRevise={revise} />
            <EvidencePanel evidence={evidence} />
            {results?.maker && <PrototypeFrame text={results.maker} height={480} />}
            {results && (
              <div className="card p-4 flex items-center justify-between">
                <span className="text-sm text-zinc-300">All five artefacts are ready.</span>
                <Link to="/artefacts" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
                  Open artefacts →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
