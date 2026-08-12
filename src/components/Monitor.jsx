import { useEffect, useRef } from "react";

// The IGNITE "monitor": a browser-frame screen that tilts in 3D toward the
// cursor, parallaxes on scroll, and lets its contents drift slightly opposite
// the tilt for depth — the Xenet-style "monitor movement". Content is authored
// by the caller and placed between the chrome bar and the frame's base.
export default function Monitor({ title = "ignite — organisation console", badge = "live", children, className = "" }) {
  const wrapRef = useRef(null);
  const tiltRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const tilt = tiltRef.current;
    const inner = innerRef.current;
    if (!wrap || !tilt) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let tx = 0, ty = 0, rX = 0, rY = 0, iX = 0, iY = 0, sp = 0, curSp = 0, raf;

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    };
    const onScroll = () => {
      sp = -window.scrollY * 0.1;
    };

    const loop = () => {
      if (fine && !reduced) {
        rX += (ty - rX) * 0.08;
        rY += (tx - rY) * 0.08;
        iX += (tx - iX) * 0.12;
        iY += (ty - iY) * 0.12;
      }
      curSp += (sp - curSp) * 0.1;
      tilt.style.transform = `translateY(${curSp}px) rotateX(${rX * -9}deg) rotateY(${rY * 12}deg)`;
      if (inner) inner.style.transform = `translate3d(${iX * -24}px, ${iY * -18}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    wrap.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative ${className}`} style={{ perspective: "1600px" }}>
      <div ref={tiltRef} className="relative will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        <div className="card overflow-hidden bg-[#0a0a12] border-white/12 shadow-[0_50px_140px_-40px_rgba(245,197,24,0.28)]">
          {/* window chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 bg-white/3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-2 text-xs font-mono text-zinc-500 truncate">{title}</span>
            <span className="ml-auto"><span className="tag live">{badge}</span></span>
          </div>
          <div ref={innerRef} className="will-change-transform">{children}</div>
        </div>
      </div>
    </div>
  );
}
