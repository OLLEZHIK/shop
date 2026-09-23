"use client";

import { useState } from "react";
import Link from "next/link";
import type { DistrictSummary } from "@/lib/data";
import { CATEGORY_THEME } from "@/lib/categories";
import { CategoryIcon } from "./CategoryIcon";
import { ArrowRightIcon, MapPinIcon } from "./icons";

// Pick a neighbourhood, see what's there. Chips are sized by real
// listing counts; the panel shows the district's categories as links
// straight into the district listing pages.
export function DistrictExplorer({
  districts,
  citySlug,
  cityName,
}: {
  districts: DistrictSummary[];
  citySlug: string;
  cityName: string;
}) {
  const [selectedSlug, setSelectedSlug] = useState(districts[0]?.slug ?? null);
  const selected = districts.find((d) => d.slug === selectedSlug) ?? districts[0];
  if (!selected) return null;

  const max = Math.max(...districts.map((d) => d.total));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-wrap content-start gap-2" role="tablist" aria-label="Districts">
        {districts.map((d) => {
          const active = d.slug === selected.slug;
          // 0..1 weight for a subtle size/intensity scale.
          const weight = d.total / max;
          return (
            <button
              key={d.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedSlug(d.slug)}
              className={`inline-flex items-center gap-2 rounded-[var(--radius-pill)] border font-medium transition duration-200 ${
                active
                  ? "border-ink bg-ink text-white shadow-[var(--shadow-card-hover)]"
                  : "border-line bg-surface text-foreground/80 hover:-translate-y-0.5 hover:border-brand-blue-muted-border hover:text-brand-blue"
              } ${weight > 0.6 ? "px-5 py-3 text-base" : weight > 0.3 ? "px-4 py-2.5 text-sm" : "px-3.5 py-2 text-sm"}`}
            >
              {d.name}
              <span
                className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-xs ${
                  active ? "bg-white/15 text-white" : "bg-surface-sunken text-foreground/60"
                }`}
              >
                {d.total}
              </span>
            </button>
          );
        })}
      </div>

      <div
        key={selected.slug}
        role="tabpanel"
        className="rise-in rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-foreground/60">
              <MapPinIcon className="h-4 w-4" />
              {cityName} district
            </p>
            <h3 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">{selected.name}</h3>
          </div>
          <div className="text-right">
            <p className="font-heading text-3xl font-extrabold text-brand-orange md:text-4xl">{selected.total}</p>
            <p className="text-xs text-foreground/60">{selected.total === 1 ? "place listed" : "places listed"}</p>
          </div>
        </div>

        <ul className="mt-6 space-y-2">
          {selected.byCategory.map((c) => (
            <li key={c.categorySlug}>
              <Link
                href={`/${c.categorySlug}/${citySlug}/${selected.slug}/`}
                className="group flex items-center gap-3 rounded-[var(--radius-control)] p-2.5 transition hover:bg-surface-sunken"
                style={{ "--accent": CATEGORY_THEME[c.category].accent } as React.CSSProperties}
              >
                <span className="accent-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <CategoryIcon category={c.category} className="h-5 w-5" />
                </span>
                <span className="flex-1 font-medium text-foreground">{c.categoryLabel}</span>
                <span className="text-sm text-foreground/60">{c.count}</span>
                <ArrowRightIcon className="h-4 w-4 text-foreground/30 transition group-hover:translate-x-0.5 group-hover:text-brand-blue" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
