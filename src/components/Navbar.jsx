import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5C518" />
          <stop offset="1" stopColor="#FF6B35" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="#0a0a12" />
      <path d="M16 6 L27 12 V20 L16 26 L5 20 V12 Z" fill="none" stroke="url(#lg)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="3" fill="url(#lg)" />
    </svg>
  );
}

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/operations", label: "Operations" },
  { to: "/data", label: "Live Data" },
  { to: "/agents", label: "Agents" },
  { to: "/artefacts", label: "Artefacts" },
  { to: "/chat", label: "Chat" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const close = () => setOpen(false);
  const onChat = loc.pathname === "/chat";

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#08080f]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group" onClick={close}>
          <Logo />
          <div className="leading-tight">
            <div className="font-display font-bold text-white text-lg tracking-wide">IGNITE</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Venture Studio</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "text-white bg-white/8" : "text-zinc-400 hover:text-white hover:bg-white/5"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/chat"
            className="ml-3 px-4 py-2 rounded-lg text-sm font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 hover:brightness-110 transition"
          >
            {onChat ? "Organisation live" : "Start an organisation"}
          </Link>
        </nav>

        <button className="md:hidden text-zinc-300 text-xl" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/8 px-4 py-3 space-y-1">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={close} className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? "text-white bg-white/8" : "text-zinc-400"}`}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/chat" onClick={close} className="block px-3 py-2 rounded-lg text-sm font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-500 text-center">
            Start an organisation
          </Link>
        </nav>
      )}
    </header>
  );
}
