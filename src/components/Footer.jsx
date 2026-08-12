import { Link } from "react-router-dom";
import { Logo } from "./Navbar.jsx";
import { AGENTS, pipelineOrder } from "../lib/agents.js";

export function Footer() {
  return (
    <footer className="border-t border-white/8 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <div className="font-display font-bold text-white">IGNITE</div>
          </div>
          <p className="mt-3 text-sm text-zinc-500 max-w-xs">
            The Autonomous Venture Launch Studio. Five specialised AI agents, one unbroken
            pipeline, one tangible business.
          </p>
          <p className="mt-2 font-mono text-xs text-zinc-600">Signal · Shape · Ship · Sell · Scale</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">The Pipeline</div>
          <div className="space-y-1.5 text-sm">
            {pipelineOrder.map((id) => {
              const a = AGENTS.find((x) => x.id === id);
              return (
                <div key={id} className="text-zinc-400">
                  <span style={{ color: a.color }}>{a.emoji}</span> {a.name} · {a.role}
                  <span className="text-zinc-600 ml-2">→ {a.file}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Navigate</div>
          <div className="grid grid-cols-2 gap-1.5 text-sm text-zinc-400">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/operations" className="hover:text-white">Operations</Link>
            <Link to="/data" className="hover:text-white">Live Data</Link>
            <Link to="/agents" className="hover:text-white">Agents</Link>
            <Link to="/artefacts" className="hover:text-white">Artefacts</Link>
            <Link to="/chat" className="hover:text-white">IGNITE COMMAND</Link>
            <Link to="/settings" className="hover:text-white">Settings</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 py-4 text-center text-xs text-zinc-600">
        IGNITE — autonomous agents, live data, real output. This is AI, working.
      </div>
    </footer>
  );
}
