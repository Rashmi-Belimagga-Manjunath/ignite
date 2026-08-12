import { useEffect, useState } from "react";
import { MCP_SERVERS, listTools, callTool } from "../lib/mcp.js";
import { getTableList, queryDb } from "../lib/db.js";

// The Live Data page — the technical-proof page. It shows the MCP servers,
// lets the user fire live API queries on demand (with timestamps), and exposes
// the real SQLite business database with a SQL explorer.
export default function LiveData() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.25em] text-amber-400 font-mono mb-1">Proven, not promised</div>
        <h1 className="font-display text-3xl text-white font-bold">Live Data</h1>
        <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
          Every tool below is queried at the moment of use — nothing is hardcoded or cached. The
          agents call these same tools, and the Evidence Panel records source, API, record count and
          fetch timestamp for every call.
        </p>
      </header>

      <McpSection />
      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <LiveSignals />
        <DbExplorer />
      </div>
    </div>
  );
}

// ---------- MCP servers ----------
function McpSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {MCP_SERVERS.map((s) => (
        <div key={s.id} className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display text-white font-bold">{s.label}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/25">{s.tools.length} tools</span>
          </div>
          <p className="text-xs text-zinc-500 mb-3">{s.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {s.tools.map((t) => (
              <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/30 border border-white/8 text-zinc-300">{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Live signal widgets (fetch on demand) ----------
const SIGNALS = [
  {
    name: "get_weather_forecast",
    label: "Open-Meteo",
    desc: "Live Dublin forecast (no API key)",
    server: "live-signals",
    args: { latitude: 53.3498, longitude: -6.2603, name: "Dublin city centre", days: 3 },
    render: (r) => {
      const d = r.result.daily || [];
      const cur = r.result.current || {};
      return (
        <div className="space-y-1">
          <div className="font-mono text-sm text-white">Now: {cur.temp_c}°C · precip {cur.precipitation_mm}mm · wind {cur.wind_kmh} km/h</div>
          {d.map((x) => (
            <div key={x.date} className="text-xs font-mono text-zinc-400">
              {x.date}: {x.min_c}–{x.max_c}°C · rain {x.rain_probability_pct}% · {x.rain_mm}mm
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: "search_reddit",
    label: "Reddit",
    desc: "Live discussions about cold brew / Dublin pop-ups",
    server: "live-signals",
    args: { query: "cold brew coffee Dublin" },
    render: (r) => (
      <ul className="space-y-1">
        {(r.result.hits || []).slice(0, 3).map((h, i) => (
          <li key={i} className="text-xs text-zinc-300">
            <span className="font-mono text-zinc-500">r/{h.subreddit}</span> {h.title}
          </li>
        ))}
      </ul>
    ),
  },
  {
    name: "search_wikipedia",
    label: "Wikipedia",
    desc: "Reference context for specialty coffee",
    server: "live-signals",
    args: { query: "specialty coffee" },
    render: (r) => (
      <ul className="space-y-1">
        {(r.result.results || []).slice(0, 3).map((w, i) => (
          <li key={i} className="text-xs text-zinc-300">
            <span className="font-mono text-amber-300">{w.title}</span> — {w.snippet.slice(0, 90)}…
          </li>
        ))}
      </ul>
    ),
  },
  {
    name: "search_github",
    label: "GitHub",
    desc: "Read-only engineering demand signal",
    server: "live-signals",
    args: { query: "pop-up shop" },
    render: (r) => {
      const repos = r.result.hits?.repos || [];
      return (
        <ul className="space-y-1">
          {repos.slice(0, 3).map((x, i) => (
            <li key={i} className="text-xs text-zinc-300">
              <span className="font-mono text-amber-300">{x.fullName}</span> ★{x.stars}
            </li>
          ))}
        </ul>
      );
    },
  },
];

function LiveSignals() {
  const [state, setState] = useState({});
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-mono">Live signals — fetch now</div>
      {SIGNALS.map((s) => {
        const st = state[s.name] || {};
        return (
          <div key={s.name} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm text-white font-mono">{s.label}</span>
                <span className="text-[10px] font-mono ml-2 px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 border border-white/10">{s.name}</span>
              </div>
              <button
                onClick={async () => {
                  setState((p) => ({ ...p, [s.name]: { loading: true } }));
                  const t0 = Date.now();
                  try {
                    const r = await callTool(s.name, s.args);
                    setState((p) => ({ ...p, [s.name]: { result: r.result, ms: Date.now() - t0, ts: new Date().toLocaleTimeString(), ok: true } }));
                  } catch (err) {
                    setState((p) => ({ ...p, [s.name]: { error: err.message, ms: Date.now() - t0, ok: false } }));
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 disabled:opacity-50"
                disabled={st.loading}
              >
                {st.loading ? "Fetching…" : "⚡ Fetch now"}
              </button>
            </div>
            <div className="text-[11px] text-zinc-600 mb-2">{s.desc}</div>
            {st.loading && <div className="progress-indet" />}
            {st.error && <div className="text-xs text-red-300 font-mono">Error: {st.error}</div>}
            {st.ok && (
              <div className="rounded-lg bg-black/25 border border-white/8 p-3">
                {s.render(st)}
                <div className="mt-2 text-[10px] font-mono text-zinc-600">
                  fetched {st.ts} · {st.ms}ms · live, not cached
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------- Business database explorer ----------
function DbExplorer() {
  const [tables, setTables] = useState([]);
  const [sql, setSql] = useState("SELECT name, price, margin, category FROM products ORDER BY price DESC");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getTableList().then(setTables).catch(() => {});
    run(sql);
  }, []);

  async function run(q) {
    setBusy(true);
    setErr(null);
    try {
      const { columns, rows } = await queryDb(q);
      setRes({ columns, rows, sql: q, ts: new Date().toLocaleTimeString() });
    } catch (e) {
      setErr(e.message);
      setRes(null);
    } finally {
      setBusy(false);
    }
  }

  const PRESETS = [
    ["Best sellers", "SELECT product, SUM(units) AS units, ROUND(SUM(revenue),0) AS revenue FROM historical_sales GROUP BY product ORDER BY revenue DESC LIMIT 5"],
    ["Weather sensitivity", "SELECT weather, ROUND(AVG(units),1) AS avg_units FROM historical_sales GROUP BY weather ORDER BY avg_units DESC"],
    ["Location performance", "SELECT location, COUNT(*) AS days, ROUND(SUM(revenue),0) AS revenue FROM historical_sales GROUP BY location ORDER BY revenue DESC LIMIT 5"],
    ["Full inventory", "SELECT item, quantity, unit FROM inventory ORDER BY category"],
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-mono">Business database — ignite.db (SQLite)</div>
      <div className="card p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tables.map((t) => (
            <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/30 border border-white/8 text-zinc-300">{t}</span>
          ))}
        </div>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          rows={3}
          spellCheck={false}
          className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs font-mono text-emerald-300 placeholder:text-zinc-700 outline-none focus:border-amber-400/50"
        />
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            onClick={() => run(sql)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "Querying…" : "▶ Run query"}
          </button>
          {PRESETS.map(([label, q]) => (
            <button key={label} onClick={() => { setSql(q); run(q); }} className="px-2.5 py-1.5 rounded-lg text-[11px] text-zinc-300 border border-white/10 hover:bg-white/5">
              {label}
            </button>
          ))}
        </div>

        {err && <div className="mt-3 text-xs text-red-300 font-mono">{err}</div>}

        {res && (
          <div className="mt-3">
            <div className="text-[10px] font-mono text-zinc-600 mb-1">
              {res.rows.length} rows · ran {res.ts} · read from ignite.db at query time
            </div>
            <div className="overflow-x-auto rounded-lg bg-black/30 border border-white/8">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr>
                    {res.columns.map((c) => (
                      <th key={c} className="text-left px-3 py-1.5 text-amber-300 border-b border-white/10 whitespace-nowrap">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {res.rows.slice(0, 12).map((r, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      {res.columns.map((c) => (
                        <td key={c} className="px-3 py-1 text-zinc-300 whitespace-nowrap">{r[c]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
