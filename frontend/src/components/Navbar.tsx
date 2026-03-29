"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/[0.06] glass">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 font-bold text-[17px] tracking-tight group">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-50" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green" />
        </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-white transition-all">
          Social Alpha Trader
        </span>
      </Link>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold px-2.5 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent-2 tracking-widest uppercase">
          <span className="w-1 h-1 rounded-full bg-accent" />
          Live
        </div>
        <span className="font-mono text-[12px] text-white/20 tabular-nums">{time}</span>
      </div>
    </nav>
  );
}
