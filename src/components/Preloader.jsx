import { useEffect, useRef, useState } from "react";

// Boot-sequence preloader: the organisation cold-starts on load — kernel, database,
// live signals, agent personas, tools — then the overlay slides away. Click to skip.
const BOOT = [
  "ignite kernel v2.6 — cold start",
  "> mount ignite.db · 7 tables · 262 sales rows",
  "> connect live signals · open-meteo / reddit / wikipedia / github / hn",
  "> load 5 agent personas · amara · lena · dara · niamh · elias",
  "> register mcp tools · 34 callable",
  "SYSTEM ONLINE — organisation ready",
];

export default function Preloader({ onDone }) {
  const [line, setLine] = useState(0);
  const [pct, setPct] = useState(0);
  const [hidden, setHidden] = useState(false);
  const skipRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DUR = reduced ? 150 : 2600;
    const start = performance.now();
    let raf;

    const finish = () => {
      setHidden(true);
      setTimeout(onDone, 650);
    };

    skipRef.current = () => {
      cancelAnimationFrame(raf);
      setPct(100);
      setLine(BOOT.length - 1);
      finish();
    };

    const tick = (t) => {
      const p = Math.min(1, (t - start) / DUR);
      setPct(Math.round(p * 100));
      setLine(Math.min(BOOT.length - 1, Math.floor(p * BOOT.length)));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(finish, 300);
      }
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointerdown", skipRef.current, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", skipRef.current);
    };
  }, [onDone]);

  return (
    <div
      aria-hidden="true"
      onClick={() => skipRef.current && skipRef.current()}
      className={`fixed inset-0 z-[200] flex flex-col justify-between bg-[#08080f] px-6 py-8 sm:px-10 transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${hidden ? "-translate-y-full" : ""}`}
    >
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">
        <span>IGNITE · autonomous venture studio</span>
        <span className="hidden sm:inline">Dublin, IE</span>
      </div>

      <div className="text-center">
        <div className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-white">
          IGNITE
        </div>
        <div className="mt-2 text-[11px] uppercase tracking-[0.4em] text-zinc-600">
          initialising the organisation
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <div className="min-h-[130px] font-mono text-xs sm:text-sm leading-relaxed">
          {BOOT.slice(0, line + 1).map((b, i) => (
            <div key={b} className={i === line ? "text-zinc-100" : "text-zinc-600"}>
              <span className="text-amber-400/70">▸</span>{" "}
              {i === line ? (
                <span>
                  {b}
                  <span className="inline-block w-2 h-3.5 bg-amber-400 ml-1 align-middle animate-pulse" />
                </span>
              ) : (
                b
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-[3px] rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-150"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-xs text-amber-300 tabular-nums">
            {String(pct).padStart(3, "0")}%
          </span>
        </div>
      </div>
    </div>
  );
}
