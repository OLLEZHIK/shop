"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GridIcon, ChevronDownIcon } from "./icons";

interface CategoryMenuProps {
  citySlug: string;
  categories: { slug: string; label: string }[];
}

// Replaces a row of always-visible text links (one per service category)
// with a single "Browse" trigger - the header shouldn't read as a wall of
// service labels; the full list is still one click away here, and the
// footer already lists every category as a persistent fallback.
export function CategoryMenu({ citySlug, categories }: CategoryMenuProps) {
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
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="pill-hover flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground/80"
      >
        <GridIcon className="h-4 w-4" />
        Browse services
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-20 mt-2 w-56 rounded-[var(--radius-control)] bg-white py-1.5 shadow-[var(--shadow-panel)]"
        >
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}/${citySlug}/`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-brand-blue-muted hover:text-brand-blue"
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
