"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BusinessCategory } from "@prisma/client";
import type { CityPointLite } from "@/lib/geo";
import type { Dictionary, Locale } from "@/lib/i18n";
import { CategoryIcon } from "./CategoryIcon";
import { ChevronDownIcon, MapPinIcon, ShopBagIcon } from "./icons";
import { useServiceNavigation } from "./useServiceNavigation";

export interface ServiceLink {
  href: string;
  label: string;
  category: BusinessCategory;
  blurb: string;
  accent: string;
}

interface BrowseMenuProps {
  locale: Locale;
  t: Dictionary["nav"];
  food: Dictionary["food"];
  services: ServiceLink[];
  cities: CityPointLite[];
  defaultCitySlug: string;
}

type Group = "services" | "food";

// Desktop "Browse" dropdown, two levels: pick a group on the left
// (Services, Food & supplements, more later), its items show on the right.
export function BrowseMenu({ locale, t, food, services, cities, defaultCitySlug }: BrowseMenuProps) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<Group>("services");
  const rootRef = useRef<HTMLDivElement>(null);
  const { open: openService, pending } = useServiceNavigation(locale, cities, defaultCitySlug, () => setOpen(false));

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

  const groups: { id: Group; label: string; soon?: boolean }[] = [
    { id: "services", label: t.services },
    { id: "food", label: t.foodAndSupplies, soon: true },
  ];

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
        {t.browse}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Service links stay in the DOM (hidden) so crawlers see them. */}
      <div
        hidden={!open}
        className="absolute left-0 top-full z-50 mt-3 w-[680px] overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-panel)] ring-1 ring-line"
      >
        <div className="grid grid-cols-[200px_1fr]">
          <ul className="space-y-1 border-r border-line bg-surface-sunken/50 p-3">
            {groups.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onMouseEnter={() => setGroup(g.id)}
                  onFocus={() => setGroup(g.id)}
                  onClick={() => setGroup(g.id)}
                  aria-pressed={group === g.id}
                  className={`flex w-full items-center justify-between rounded-[var(--radius-control)] px-3 py-2.5 text-left text-[15px] font-semibold transition ${
                    group === g.id ? "bg-surface text-foreground shadow-[var(--shadow-card)]" : "text-foreground/65 hover:text-foreground"
                  }`}
                >
                  {g.label}
                  <ChevronDownIcon className="h-4 w-4 -rotate-90 text-foreground/40" />
                </button>
              </li>
            ))}
          </ul>

          <div className="p-3">
            <ul hidden={group !== "services"} className="grid grid-cols-2 gap-1">
              {services.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    onClick={(e) => {
                      openService(s.category, e);
                    }}
                    className="flex items-start gap-3 rounded-[var(--radius-control)] p-3 transition hover:bg-surface-sunken"
                    style={{ "--accent": s.accent } as React.CSSProperties}
                  >
                    <span className="accent-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <CategoryIcon category={s.category} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-foreground">{s.label}</span>
                      <span className="mt-0.5 block text-sm text-foreground/60">
                        {pending === s.category ? (
                          <span className="inline-flex items-center gap-1 text-brand-blue">
                            <MapPinIcon className="h-3.5 w-3.5 animate-pulse" />
                            {t.locating}
                          </span>
                        ) : (
                          s.blurb
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <ul hidden={group !== "food"} className="space-y-1">
              {food.map((f) => (
                <li
                  key={f.label}
                  className="flex items-start gap-3 rounded-[var(--radius-control)] p-3 opacity-70"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-sunken text-foreground/50">
                    <ShopBagIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-foreground">
                      {f.label}
                      <span className="whitespace-nowrap rounded-[var(--radius-pill)] bg-brand-orange-muted px-2 py-0.5 text-[11px] font-semibold text-brand-orange-deep">
                        {t.comingSoon}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm text-foreground/60">{f.blurb}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
