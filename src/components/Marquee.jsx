// Infinite scrolling ticker — used for the floating hero banner and the awards
// strip. Duplicates children enough times to fill the viewport.
export default function Marquee({ children, className = "", speed = 30 }) {
  return (
    <div className={`marquee-wrap overflow-hidden ${className}`}>
      <div className="marquee-track" style={{ "--marquee-speed": `${speed}s` }}>
        {Array.from({ length: 2 }).map((_, k) => (
          <div key={k} className="marquee-chunk" aria-hidden={k === 1}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
