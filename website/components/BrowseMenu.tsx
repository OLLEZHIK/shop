"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BusinessCategory } from "@prisma/client";
import { CategoryIcon } from "./CategoryIcon";
import { ChevronDownIcon } from "./icons";

export interface BrowseLink {
  href: string;
  label: string;
  category: BusinessCategory;
  blurb: string;
  accent: string;
}

// Desktop "Browse" dropdown (Zocdoc-style header): a tinted pill button
// that opens a panel with all service categories.
export function BrowseMenu({ links }: { links: BrowseLink[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-12 items-center gap-2 rounded-[var(--radius-control)] px-5 text-[17px] font-medium text-foreground transition ${
          open ? "bg-surface-sunken ring-1 ring-line" : "bg-surface-sunken/80 hover:bg-surface-sunken"
        }`}
      >
        Browse
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Links stay in the DOM (hidden) so crawlers see them. */}
      <div
        hidden={!open}
        className="absolute left-0 top-full z-50 mt-3 w-[560px] rounded-[var(--radius-card)] bg-surface p-3 shadow-[var(--shadow-panel)] ring-1 ring-line"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-foreground/50">
          Pet services
        </p>
        <ul className="grid grid-cols-2 gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-start gap-3 rounded-[var(--radius-control)] p-3 transition hover:bg-surface-sunken"
                style={{ "--accent": link.accent } as React.CSSProperties}
              >
                <span className="accent-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <CategoryIcon category={link.category} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-foreground">{link.label}</span>
                  <span className="mt-0.5 block text-sm text-foreground/60">{link.blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
