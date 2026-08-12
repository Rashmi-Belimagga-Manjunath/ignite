import { Link } from "react-router-dom";
import { Logo } from "./Navbar.jsx";
import { AGENTS, pipelineOrder } from "../lib/agents.js";

export function Footer() {
  return (
    <footer className="border-t border-white/8 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/8 pb-10">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={26} />
              <span className="font-display font-bold text-white text-lg">IGNITE</span>
            </div>
            <p className="mt-3 text-sm text-zinc-500 max-w-sm">
              The Autonomous Venture Launch Studio. Five specialised AI agents, one unbroken
              pipeline, one tangible business — built with live data.
            </p>
          </div>
          <div className="font-mono text-xs text-zinc-600">
            Signal · Shape · Ship · Sell · Scale
            <div className="mt-2 text-zinc-500">This is AI, working.</div>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-3 pt-10">
          <div>
            <div className="eyebrow mb-4"><span className="bracket">[</span> <span className="n">01</span> · The pipeline <span className="bracket">]</span></div>
            <div className="space-y-2.5 text-sm">
              {pipelineOrder.map((id, i) => {
                const a = AGENTS.find((x) => x.id === id);
                return (
                  <div key={id} className="flex items-center gap-2 text-zinc-400">
                    <span className="idx"><span className="n">{String(i + 1).padStart(2, "0")}</span></span>
                    <span style={{ color: a.color }}>{a.emoji}</span>
                    <span>{a.name}</span>
                    <span className="text-zinc-600 font-mono text-xs ml-auto">→ {a.file}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-4"><span className="bracket">[</span> <span className="n">02</span> · Navigate <span className="bracket">]</span></div>
            <div className="grid grid-cols-2 gap-1.5 text-sm text-zinc-400">
              <Link to="/" className="hover:text-white">Home</Link>
              <Link to="/operations" className="hover:text-white">Operations</Link>
              <Link to="/data" className="hover:text-white">Live Data</Link>
              <Link to="/agents" className="hover:text-white">Agents</Link>
              <Link to="/artefacts" className="hover:text-white">Artefacts</Link>
              <Link to="/chat" className="hover:text-white">Command</Link>
              <Link to="/settings" className="hover:text-white">Settings</Link>
            </div>
          </div>
          <div>
            <div className="eyebrow mb-4"><span className="bracket">[</span> <span className="n">03</span> · Live sources <span className="bracket">]</span></div>
            <div className="space-y-2 text-sm text-zinc-400">
              <div className="flex items-center justify-between"><span>ignite.db</span><span className="tag live">SQLite</span></div>
              <div className="flex items-center justify-between"><span>Open-Meteo</span><span className="tag live">live API</span></div>
              <div className="flex items-center justify-between"><span>Reddit · Wikipedia · GitHub</span><span className="tag live">live</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 py-4 text-center text-xs text-zinc-600">
        © 2026 IGNITE — autonomous agents, live data, real output.
      </div>
    </footer>
  );
}
