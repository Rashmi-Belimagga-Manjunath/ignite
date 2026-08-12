import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { runGeneral } from "../lib/chat.js";
import { hasKey } from "../lib/llm.js";
import { saveChat } from "../lib/history.js";
import Portrait from "./Portrait.jsx";

// Floating chatbot — IGNITE COMMAND in a launcher bubble on every page.
// Quick questions answered live (same engine as the /chat page); the full
// five-agent organisation runs on the Command page.
const SUGGESTIONS = [
  "What does IGNITE do?",
  "Who are the five agents?",
  "How is the data fetched live?",
];

export default function ChatWidget() {
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const histRef = useRef([]);
  const scrollRef = useRef(null);
  const bootedRef = useRef(false);

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

  useEffect(() => {
    if (!open || bootedRef.current) return;
    bootedRef.current = true;
    push({
      role: "assistant",
      content: "Hi — I'm **IGNITE COMMAND**. Ask me anything about the venture studio, or head to the Command page to run the full five-agent organisation.",
    });
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (loc.pathname === "/chat") return null;

  async function send(raw) {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    setInput("");
    push({ role: "user", content: text });

    if (!hasKey()) {
      push({
        role: "assistant",
        content: "Add an API key in **Settings** to let me answer — the key stays in your browser.",
      });
      saveChat({ messages: histRef.current });
      return;
    }

    push({ role: "assistant", content: "", streaming: true });
    setBusy(true);
    try {
      await runGeneral({
        history: histRef.current.slice(0, -1),
        onDelta: (t) => patchLast({ content: (histRef.current[histRef.current.length - 1]?.content || "") + t }),
      });
    } catch (err) {
      patchLast({ content: `⚠️ ${err?.message || "Something went wrong"}` });
    }
    setBusy(false);
    saveChat({ messages: histRef.current });
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="card w-[min(92vw,390px)] h-[560px] flex flex-col overflow-hidden bg-[#0b0b14]/95 backdrop-blur-xl shadow-2xl shadow-black/60">
          {/* header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-white/[0.03]">
            <Portrait name="IGNITE" size={34} />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white leading-tight">IGNITE COMMAND</div>
              <div className="text-[10px] text-emerald-400 font-mono">● online — live tools</div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-zinc-400 hover:text-white text-lg leading-none">✕</button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-amber-300 to-orange-500 text-black font-medium"
                      : "bg-white/6 border border-white/8 text-zinc-300"
                  }`}
                >
                  {m.content || (m.streaming && <span className="inline-block w-2 h-3.5 bg-amber-400 animate-pulse align-middle" />)}
                </div>
              </div>
            ))}
            {busy && !messages.some((m) => m.streaming) && (
              <div className="text-[11px] text-zinc-500 font-mono animate-pulse">thinking…</div>
            )}
          </div>

          {/* suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-[11px] px-2.5 py-1 rounded-full border border-white/12 text-zinc-300 hover:bg-white/5 hover:text-white transition">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* footer link */}
          <div className="px-3 pb-1.5">
            <Link to="/chat" onClick={() => setOpen(false)} className="text-[11px] text-amber-300 hover:text-amber-200 font-mono">
              Run the full five-agent organisation →
            </Link>
          </div>

          {/* input */}
          <div className="p-3 border-t border-white/8 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={hasKey() ? "Ask IGNITE…" : "Add an API key in Settings…"}
              className="flex-1 min-w-0 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/50"
            />
            <button
              onClick={() => send()}
              className="px-3 py-2 rounded-lg font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 text-sm"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle IGNITE COMMAND chat"
        className="relative group w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105 flex items-center justify-center"
      >
        <span className="pulse-ring" />
        <span className="font-display font-bold text-black text-xl">{open ? "✕" : "IGN"}</span>
      </button>
    </div>
  );
}
