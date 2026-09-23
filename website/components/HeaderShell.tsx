"use client";

import { useEffect, useState } from "react";

// Transparent at the top of the page so the header blends into the hero
// (seamless); once the page scrolls it gets a frosted background and a
// hairline so content doesn't run into it.
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled
          ? "bg-background/80 shadow-[0_1px_0_var(--line)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
          : "bg-transparent"
      }`}
    >
      {children}
    </header>
  );
}
