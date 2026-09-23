"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { BusinessCategory } from "@prisma/client";
import { CategoryIcon } from "./CategoryIcon";
import { ArrowRightIcon, ChevronDownIcon, CloseIcon } from "./icons";

interface MenuLink {
  href: string;
  label: string;
  category: BusinessCategory;
  blurb: string;
  accent: string;
}

// Full-screen category menu for small screens - the desktop nav is
// hidden below `lg`, so without this phones had no navigation at all.
export function MobileMenu({ links }: { links: MenuLink[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Browse services"
        aria-expanded={open}
        className="inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-control)] bg-surface-sunken px-4 font-medium text-foreground lg:hidden"
      >
        Browse
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {/* Portal: the sticky header's backdrop-filter would otherwise
          become the containing block and clip this fixed overlay. */}
      {open &&
        createPortal(
        <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-heading text-lg font-bold">Browse services</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-[var(--shadow-card)]"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Any link click closes the menu (event bubbles up from <a>). */}
          <nav className="flex-1 overflow-y-auto px-4 pb-6" aria-label="Categories"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setOpen(false);
            }}
          >
            <ul className="grid grid-cols-2 gap-3">
              {links.map((link, i) => (
                <li key={link.href} className="rise-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <Link
                    href={link.href}
                    className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)]"
                    style={{ "--accent": link.accent } as React.CSSProperties}
                  >
                    <span className="accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
                      <CategoryIcon category={link.category} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-foreground">{link.label}</span>
                      <span className="mt-0.5 block text-xs text-foreground/60">{link.blurb}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2">
              <Link
                href="/how-it-works/"
                className="flex items-center justify-between rounded-[var(--radius-control)] bg-surface px-4 py-3.5 font-medium"
              >
                Help - how pawenn works
                <ArrowRightIcon className="h-4 w-4 text-foreground/50" />
              </Link>
              <Link
                href="/add-or-fix-listing/"
                className="flex items-center justify-between rounded-[var(--radius-control)] bg-ink px-4 py-3.5 font-medium text-white"
              >
                List your business
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>,
          document.body
        )}
    </>
  );
}
