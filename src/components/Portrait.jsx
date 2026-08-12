import { useMemo } from "react";

// Deterministic SVG placeholder portrait (initials + gradient + dot pattern).
// No external image service — a crisp generated avatar for testimonials, agents
// and chat. Colour derives from the name so the same person always looks the same.
const PALETTES = [
  ["#F5C518", "#FF6B35"],
  ["#34d399", "#0ea5e9"],
  ["#f472b6", "#a855f7"],
  ["#fbbf24", "#f43f5e"],
  ["#60a5fa", "#8b5cf6"],
  ["#2dd4bf", "#6366f1"],
];

export default function Portrait({ name = "?", size = 48, className = "", title }) {
  const initials = useMemo(
    () =>
      name
        .replace(/[^a-zA-Z ]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("") || "?",
    [name]
  );

  const hash = useMemo(() => {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
  }, [name]);

  const [c1, c2] = PALETTES[hash % PALETTES.length];
  const id = `pg${hash.toString(36)}`;
  const r = size;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={`${name} — placeholder portrait`}
      title={title || name}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <pattern id={`${id}p`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="rgba(255,255,255,0.18)" />
        </pattern>
      </defs>
      <rect width="48" height="48" rx={r * 0.24} fill={`url(#${id})`} />
      <rect width="48" height="48" rx={r * 0.24} fill={`url(#${id}p)`} />
      <text
        x="24"
        y="25"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="700"
        fontSize={name.length > 6 ? 15 : 17}
        fill="rgba(0,0,0,0.55)"
        letterSpacing="0.03em"
      >
        {initials}
      </text>
    </svg>
  );
}
