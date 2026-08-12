import { useMemo, useState } from "react";

// Extracts the ```html fenced prototype from the Maker's Build Package and
// renders it live in a sandboxed iframe — the tangible output the lecturer clicks.
export function extractHtml(text) {
  const m = (text || "").match(/```html\n([\s\S]*?)\n```/);
  return m ? m[1] : null;
}

export default function PrototypeFrame({ text, height = 560 }) {
  const html = useMemo(() => extractHtml(text), [text]);
  const [tab, setTab] = useState("preview");
  const [key, setKey] = useState(0);

  if (!html) return null;

  const src = useMemo(() => URL.createObjectURL(new Blob([html], { type: "text/html" })), [html]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/8 bg-white/3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <span className="text-xs font-mono text-zinc-500 ml-1">mori-after-dark.html — built by Dara O'Brien</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setTab("preview")}
            className={`px-2.5 py-1 rounded-md ${tab === "preview" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}
          >
            Preview
          </button>
          <button
            onClick={() => setTab("code")}
            className={`px-2.5 py-1 rounded-md ${tab === "code" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}
          >
            Code
          </button>
          <button onClick={() => setKey((k) => k + 1)} className="px-2.5 py-1 rounded-md text-zinc-500 hover:text-white">⟳</button>
        </div>
      </div>
      {tab === "preview" ? (
        <iframe
          key={key}
          title="Mori Coffee pop-up site"
          src={src}
          className="w-full bg-white"
          style={{ height, border: 0 }}
          sandbox="allow-scripts allow-popups allow-forms"
        />
      ) : (
        <pre className="text-xs text-zinc-300 overflow-auto p-4" style={{ height, backgroundColor: "#0b0b14" }}>
          {html}
        </pre>
      )}
    </div>
  );
}
