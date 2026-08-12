import { useEffect, useRef } from "react";

// Xenet-style cursor: a tight dot + a lagging ring that eases toward the pointer
// every frame, scaling up over links and buttons. Desktop / fine pointers only.
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    if (!window.matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)").matches) return;

    let tx = 0, ty = 0, dx = 0, dy = 0, rx = 0, ry = 0;
    let scale = 1, targetScale = 1, visible = false, raf;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        dx = tx; dy = ty; rx = tx; ry = ty;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    const onOver = (e) => {
      const t = e.target && e.target.closest ? e.target.closest("a, button, [role='button']") : null;
      targetScale = t ? 1.9 : 1;
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const loop = () => {
      dx += (tx - dx) * 0.55;
      dy += (ty - dy) * 0.55;
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      scale += (targetScale - scale) * 0.2;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 h-8 w-8 rounded-full border opacity-0"
        style={{ borderColor: "rgba(255,255,255,0.16)", transition: "opacity .25s ease" }}
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full opacity-0"
        style={{ background: "#ededed", transition: "opacity .25s ease" }}
      />
    </div>
  );
}
