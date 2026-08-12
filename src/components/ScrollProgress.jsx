import { useEffect, useRef } from "react";

// Thin amber progress bar tracking scroll depth.
export default function ScrollProgress() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      el.style.transform = `scaleX(${max > 0 ? doc.scrollTop / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[95] h-[2px] pointer-events-none">
      <div
        ref={ref}
        className="h-full origin-left scale-x-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500"
      />
    </div>
  );
}
