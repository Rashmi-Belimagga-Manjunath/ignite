import { useEffect, useState } from "react";
import { getApiKey, setApiKey, getModel, setModel } from "../lib/config.js";
import { hasKey } from "../lib/llm.js";

export default function Settings() {
  const [key, setKey] = useState(getApiKey() || "");
  const [model, setModelVal] = useState(getModel());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <div className="text-xs uppercase tracking-[0.25em] text-amber-400 font-mono mb-1">Settings</div>
      <h1 className="font-display text-3xl text-white font-bold mb-6">Studio settings</h1>

      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-white mb-1">OpenAI API key</h2>
        <p className="text-xs text-zinc-500 mb-3">
          Used to power the five agents. Your key is stored only in this browser (localStorage) and
          never leaves your device — the agents stream directly to OpenAI.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-…"
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/50 font-mono"
        />
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => { setApiKey(key); setSaved(true); }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110"
          >
            Save key
          </button>
          <span className={`text-xs font-mono ${hasKey() ? "text-emerald-400" : "text-red-400"}`}>
            {hasKey() ? "✓ key present" : "no key"}
          </span>
          {saved && <span className="text-xs text-emerald-300">Saved ✓</span>}
        </div>
      </div>

      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-white mb-1">Model</h2>
        <select
          value={model}
          onChange={(e) => { setModel(e.target.value); setModelVal(e.target.value); }}
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
        >
          <option value="gpt-4o-mini">gpt-4o-mini (fast, recommended)</option>
          <option value="gpt-4o">gpt-4o (slower, deeper reasoning)</option>
          <option value="gpt-4.1-mini">gpt-4.1-mini</option>
          <option value="gpt-4.1">gpt-4.1</option>
        </select>
      </div>

      <div className="card p-6 text-sm text-zinc-400 leading-relaxed">
        <h2 className="font-semibold text-white mb-2">How live data works</h2>
        <p className="mb-2">
          The agents never work from hardcoded numbers. The <span className="font-mono text-amber-300">business-data</span>{" "}
          MCP queries Mori Coffee's real SQLite database (<span className="font-mono">ignite.db</span>) at the moment of use,
          and the <span className="font-mono text-amber-300">live-signals</span> MCP fetches live weather (Open-Meteo) and
          market discussions (Reddit, Wikipedia) in real time. Every evidence row records the API, record count and timestamp.
        </p>
        <p className="mb-2">
          The Manager independently re-queries the live forecast before making its final decision — it does
          not blindly trust the Researcher's numbers.
        </p>
        <p>
          Deployment note: the hosted site uses a <span className="font-mono">VITE_OPENAI_API_KEY</span> build
          secret; locally you can rely on the key saved here.
        </p>
      </div>
    </div>
  );
}
