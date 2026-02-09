"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
      <div className="nav-left">
        <span className="nav-logo">
          saltguide<span className="neon-dot">.</span>
        </span>
      </div>
      <button className="burger" aria-label="Menu">
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}
