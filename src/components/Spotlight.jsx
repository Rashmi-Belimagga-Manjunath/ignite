import { useEffect, useRef } from "react";

// Soft amber spotlight that follows the cursor across the whole page.
export default function Spotlight() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e) => {
      el.style.background = `radial-gradient(640px circle at ${e.clientX}px ${e.clientY}px, rgba(245,197,24,0.055), transparent 70%)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[75]" />;
}
