import { useRef } from "react";

// Magnetic hover: the element is pulled toward the cursor while it is over it.
export default function Magnetic({ children, strength = 0.3, className = "" }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`magnetic inline-block ${className}`}>
      {children}
    </span>
  );
}
