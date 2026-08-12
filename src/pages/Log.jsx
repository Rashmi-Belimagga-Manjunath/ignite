import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRuns, getChats, clearRuns, clearChats } from "../lib/history.js";
import { AGENTS, pipelineOrder } from "../lib/agents.js";
import { Eyebrow } from "../components/Eyebrow.jsx";
import Markdown from "../components/Markdown.jsx";
import Portrait from "../components/Portrait.jsx";

// The Log — every bit of documentation, every markdown, every run, every chat,
// and the full synthetic dataset. Nothing is lost.

const DOC_FILES = [
  "00_PROJECT_LOG",
  "01_OVERVIEW",
  "02_ARCHITECTURE",
  "03_AGENTS",
  "04_DATA_LAYER",
  "05_FRONTEND",
  "06_SETUP_AND_DEPLOYMENT",
  "07_FILE_MANIFEST",
  "08_SOURCE_APPENDIX",
];

const DATA_TABLES = ["business_profile", "products", "inventory", "operations", "brand", "locations", "historical_sales"];

const TABS = [
  { id: "runs", label: "Runs", desc: "Every organisation run, with all five markdown artefacts + evidence" },
  { id: "chat", label: "Chat", desc: "Every IGNITE COMMAND transcript" },
  { id: "docs", label: "Docs", desc: "The full documentation set, rendered from markdown" },
  { id: "data", label: "Data", desc: "The synthetic dataset behind every number" },
];

export default function Log() {
  const [tab, setTab] = useState("runs");
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <header className="mb-6">
        <Eyebrow n="01" text="The log — everything is recorded" />
        <h1 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">Every bit of the organisation, archived.</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-2xl">
          Runs, chats, documentation and the synthetic dataset — all rendered here from what was
          actually produced or fetched. Nothing is hardcoded into this page.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
              tab === t.id ? "text-black bg-gradient-to-r from-amber-300 to-orange-500 border-transparent font-semibold" : "text-zinc-300 border-white/12 hover:bg-white/5"
            }`}
          >
            <span className="font-mono text-[10px] mr-2 opacity-70">{TABS.findIndex((x) => x.id === t.id) + 1}/</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "runs" && <RunsTab />}
      {tab === "chat" && <ChatTab />}
      {tab === "docs" && <DocsTab />}
      {tab === "data" && <DataTab />}
    </div>
  );
}

function SectionTitle({ n, text }) {
  return (
    <div className="eyebrow mb-4"><span className="bracket">[</span> <span className="n">{n}</span> · {text} <span className="bracket">]</span></div>
  );
}

/* ---------------- RUNS ---------------- */
function RunsTab() {
  const [runs, setRuns] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => setRuns(getRuns()), []);
  useEffect(() => {
    const on = () => setRuns(getRuns());
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle n="01" text={`Run archive — ${runs.length} recorded`} />
        {runs.length > 0 && (
          <button onClick={() => { clearRuns(); setRuns([]); }} className="text-xs text-zinc-500 hover:text-red-300 font-mono">
            clear archive
          </button>
        )}
      </div>

      {runs.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-3xl mb-3">🗄️</div>
          <p className="text-sm text-zinc-400 mb-4">No runs recorded yet. Every completed organisation run is saved here automatically.</p>
          <Link to="/operations" className="link-arrow justify-center"><span>Run the organisation</span> <span>→</span></Link>
        </div>
      )}

      <div className="space-y-4">
        {runs.map((run) => {
          const isOpen = open === run.id;
          const decision = run.meta?.decision || "—";
          const go = /^GO$/i.test(decision);
          return (
            <div key={run.id} className="card overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : run.id)} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${go ? "bg-emerald-400/10 border border-emerald-400/25" : "bg-amber-400/10 border border-amber-400/25"}`}>
                  {go ? "✅" : "🧭"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{run.brief?.company || "Untitled run"}</span>
                    <span className={`tag ${go ? "live" : "warn"}`}>{decision}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">{new Date(run.at).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 font-mono truncate">
                    {run.meta?.chars ? Object.values(run.meta.chars).reduce((a, b) => a + b, 0).toLocaleString() + " chars · " : ""}
                    {run.evidence?.length || 0} evidence rows · {run.tools?.length || 0} tool calls · {run.brief?.goal || ""}
                  </div>
                </div>
                <span className="font-mono text-sm text-amber-300 shrink-0">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 pt-1">
                  <SectionTitle n="02" text="Five deliverables — full markdown" />
                  <div className="space-y-4 mb-6">
                    {pipelineOrder.map((id) => {
                      const a = AGENTS.find((x) => x.id === id);
                      const out = run.results?.[id];
                      return (
                        <div key={id} className="rounded-xl border border-white/8 bg-black/25 overflow-hidden">
                          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] border-b border-white/8">
                            <Portrait name={a.name} size={26} />
                            <span className="text-sm font-semibold text-white">{a.name}</span>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500">{a.role}</span>
                            <code className="ml-auto font-mono text-[11px] text-amber-300">{a.file}</code>
                          </div>
                          <div className="p-4 max-h-[420px] overflow-y-auto">
                            {out ? <Markdown text={out} /> : <div className="text-xs text-zinc-600">not produced in this run.</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {run.evidence?.length > 0 && (
                    <div className="mb-6">
                      <SectionTitle n="03" text={`Evidence log — ${run.evidence.length} live queries`} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        {run.evidence.map((e, i) => (
                          <div key={i} className="rounded-lg bg-black/30 border border-white/8 px-3 py-2">
                            <div className="flex justify-between gap-2">
                              <span className="text-xs text-zinc-200">{e.source}</span>
                              <span className="text-[11px] font-mono text-emerald-400 shrink-0">+{e.count}</span>
                            </div>
                            <div className="text-[11px] font-mono text-zinc-500">{e.api}</div>
                            {e.note && <div className="text-[11px] text-zinc-600">{e.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- CHAT ---------------- */
function ChatTab() {
  const [chats, setChats] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => setChats(getChats()), []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle n="01" text={`Chat archive — ${chats.length} sessions`} />
        {chats.length > 0 && (
          <button onClick={() => { clearChats(); setChats([]); }} className="text-xs text-zinc-500 hover:text-red-300 font-mono">
            clear archive
          </button>
        )}
      </div>

      {chats.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-3xl mb-3">💬</div>
          <p className="text-sm text-zinc-400">No chat sessions recorded yet. Talk to IGNITE COMMAND and transcripts are saved here.</p>
        </div>
      )}

      <div className="space-y-4">
        {chats.map((chat) => {
          const isOpen = open === chat.id;
          return (
            <div key={chat.id} className="card overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : chat.id)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors">
                <Portrait name="IGNITE" size={34} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-zinc-300 truncate">{chat.messages[0]?.content?.slice(0, 70) || "session"}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">{chat.messages.length} messages · {new Date(chat.at).toLocaleString()}</div>
                </div>
                <span className="font-mono text-sm text-amber-300">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 space-y-2 max-h-[520px] overflow-y-auto">
                  {chat.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                        m.role === "user" ? "bg-gradient-to-r from-amber-300 to-orange-500 text-black" : "bg-white/6 border border-white/8 text-zinc-300"
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- DOCS ---------------- */
function DocsTab() {
  const [doc, setDoc] = useState("01_OVERVIEW");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}docs/${doc}.md`)
      .then((r) => (r.ok ? r.text() : "*(documentation file not found)*"))
      .then((t) => { setText(t); setLoading(false); })
      .catch(() => { setText("*(failed to load)*"); setLoading(false); });
  }, [doc]);

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <SectionTitle n="01" text="Documentation index" />
        <div className="space-y-1.5">
          {DOC_FILES.map((f) => (
            <button
              key={f}
              onClick={() => setDoc(f)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-colors ${doc === f ? "text-black bg-gradient-to-r from-amber-300 to-orange-500 font-semibold" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="lg:col-span-3">
        <div className="card p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <code className="font-mono text-xs text-amber-300">docs/{doc}.md</code>
            <a href={`${import.meta.env.BASE_URL}docs/${doc}.md`} target="_blank" rel="noreferrer" className="link-arrow">
              <span>open raw</span> <span>→</span>
            </a>
          </div>
          {loading ? <div className="progress-indet w-40" /> : <Markdown text={text} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- DATA ---------------- */
function DataTab() {
  const [table, setTable] = useState("products");
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}data/${table}.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setRows(data);
        setMeta({ name: table, count: data.length, cols: data[0] ? Object.keys(data[0]) : [] });
        setLoading(false);
      })
      .catch(() => { setRows([]); setMeta({ name: table, count: 0, cols: [] }); setLoading(false); });
  }, [table]);

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <SectionTitle n="01" text="Synthetic dataset" />
        <div className="space-y-1.5">
          {DATA_TABLES.map((t) => (
            <button
              key={t}
              onClick={() => setTable(t)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-colors ${table === t ? "text-black bg-gradient-to-r from-amber-300 to-orange-500 font-semibold" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-zinc-600 mt-4 leading-relaxed">
          Mori Coffee's synthetic business data — generated by <code className="font-mono">npm run seed</code>{" "}
          from <code className="font-mono">data/</code> in the repo, served from <code className="font-mono">public/data/</code>.
        </p>
      </div>
      <div className="lg:col-span-3">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle n="02" text={`${table} — ${meta?.count ?? "…"} rows`} />
            <div className="flex gap-3">
              <a href={`${import.meta.env.BASE_URL}data/${table}.csv`} target="_blank" rel="noreferrer" className="link-arrow"><span>csv</span> <span>→</span></a>
              <a href={`${import.meta.env.BASE_URL}data/${table}.json`} target="_blank" rel="noreferrer" className="link-arrow"><span>json</span> <span>→</span></a>
            </div>
          </div>
          {loading ? (
            <div className="progress-indet w-40" />
          ) : (
            <div className="overflow-auto max-h-[560px] rounded-lg border border-white/8">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#12121d] text-zinc-400 font-mono">
                  <tr>
                    {meta.cols.map((c) => <th key={c} className="px-3 py-2 whitespace-nowrap border-b border-white/8">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-white/4 hover:bg-white/[0.03]">
                      {meta.cols.map((c) => (
                        <td key={c} className="px-3 py-1.5 text-zinc-400 whitespace-nowrap">{String(r[c] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
