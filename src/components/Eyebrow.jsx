// Editorial section eyebrow in the terminal style used across IGNITE:
//   [ 02 · THE ORGANISATION ]
export function Eyebrow({ n, text, center = false }) {
  return (
    <div className={`eyebrow mb-2 ${center ? "text-center" : ""}`}>
      <span className="bracket">[</span> <span className="n">{n}</span> · {text}{" "}
      <span className="bracket">]</span>
    </div>
  );
}
