import { useEffect, useRef, useState } from "react";

// Animated count-up that starts when the element scrolls into view.
export default function Stat({ value, prefix = "", suffix = "", decimals = 0, label, sub, className = "" }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const dur = 1400;
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(value * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  const n = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString();

  return (
    <div ref={ref} className={className}>
      <div className="font-display text-4xl sm:text-5xl font-bold gradient-text tabular-nums">
        {prefix}
        {n}
        {suffix}
      </div>
      {label && <div className="mt-1 text-sm font-medium text-white">{label}</div>}
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
