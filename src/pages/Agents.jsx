import { AGENTS, pipelineOrder } from "../lib/agents.js";
import { listTools } from "../lib/mcp.js";

// The five agents — archetypes with personalities, domain expertise and the
// tools each one commands. Rendered as flip cards, exactly five, one chain.
export default function Agents() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <header className="mb-8 text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-amber-400 font-mono mb-1">The organisation</div>
        <h1 className="font-display text-3xl text-white font-bold">Five agents. One unbroken pipeline.</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-2xl mx-auto">
          Each agent has its own system prompt, personality and domain expertise. Each one's actual
          output becomes the next one's input — so the chain can never be broken.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-10">
        {pipelineOrder.map((id) => (
          <AgentCard key={id} id={id} />
        ))}
      </div>

      <Chain />

      <div className="card p-6 mt-8">
        <h3 className="font-display text-lg text-white font-bold mb-2">Why this proves agentic collaboration</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-zinc-400">
          <ul className="space-y-1.5">
            <li>• Each agent's <span className="text-white">output file becomes the next agent's input file</span> — the handoff is the heart of the system.</li>
            <li>• The <span className="text-white">Researcher</span> cannot design, the <span className="text-white">Designer</span> cannot build, the <span className="text-white">Maker</span> cannot market, and the <span className="text-white">Communicator</span> cannot decide.</li>
          </ul>
          <ul className="space-y-1.5">
            <li>• The <span className="text-white">Manager</span> independently re-queries the live forecast at decision time — the organisation does not blindly trust its own first findings.</li>
            <li>• Human <span className="text-white">checkpoints</span> pause the pipeline after every agent so you can approve or request a revision.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AgentCard({ id }) {
  const a = AGENTS.find((x) => x.id === id);
  return (
    <div className="flip-card h-72">
      <div className="flip-inner h-full">
        {/* front */}
        <div className="flip-front card p-4 h-full flex flex-col items-center text-center justify-center" style={{ boxShadow: `inset 0 0 60px -30px ${a.color}` }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3" style={{ background: `${a.color}1f`, border: `1px solid ${a.color}55` }}>
            {a.emoji}
          </div>
          <div className="font-display text-lg text-white font-bold">{a.name}</div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{a.role}</div>
          <div className="text-xs text-zinc-500 italic px-2">"{a.quote}"</div>
          <div className="mt-2 text-[10px] font-mono text-zinc-600">hover to inspect</div>
        </div>
        {/* back */}
        <div className="flip-back card p-4 h-full overflow-y-auto bg-[#0d0d18]">
          <div className="flex items-center gap-2 mb-2">
            <span>{a.emoji}</span>
            <span className="font-semibold text-white">{a.name}</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 ml-auto">{a.role}</span>
          </div>
          <div className="text-[11px] text-amber-300 font-mono mb-1">⚡ {a.superpower}</div>
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">{a.personality}</p>
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Scope</div>
          <p className="text-[11px] text-zinc-400 mb-2">{a.scope}</p>
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Output</div>
          <div className="font-mono text-[11px] text-zinc-300">{a.file} — {a.output}</div>
        </div>
      </div>
    </div>
  );
}

function Chain() {
  const tools = listTools();
  const toolNames = new Set(tools.map((t) => t.name));
  return (
    <div className="card p-6">
      <h3 className="font-display text-lg text-white font-bold mb-4">The unbroken chain</h3>
      <div className="flex flex-col lg:flex-row items-stretch gap-3">
        {pipelineOrder.map((id, i) => {
          const a = AGENTS.find((x) => x.id === id);
          return (
            <div key={id} className="flex-1 flex lg:flex-col items-center gap-3">
              <div className="flex-1 lg:flex-none w-full rounded-xl bg-black/30 border border-white/8 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>{a.emoji}</span>
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
