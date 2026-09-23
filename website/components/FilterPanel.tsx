"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BusinessCategory } from "@prisma/client";
import { ANIMALS } from "@/lib/animals";
import { listingPath } from "@/lib/categories";
import { getDictionary, type Locale } from "@/lib/i18n";
import { AnimalIcon } from "./AnimalIcon";
import { Dropdown } from "./Dropdown";
import { MapPinIcon } from "./icons";

interface FilterPanelProps {
  locale: Locale;
  category: BusinessCategory;
  citySlug: string;
  cityName: string;
  districts: { slug: string; name: string }[];
  currentDistrictSlug?: string;
  currentAnimal?: string;
  /** "lat,lng" when the list is sorted by distance - kept across filters. */
  near?: string;
}

export function FilterPanel({
  locale,
  category,
  citySlug,
  cityName,
  districts,
  currentDistrictSlug,
  currentAnimal,
  near,
}: FilterPanelProps) {
  const router = useRouter();
  const t = getDictionary(locale);
  const locationPath = listingPath(locale, category, citySlug, currentDistrictSlug);

  function withQuery(path: string, animal: string | null | undefined) {
    const params = new URLSearchParams();
    if (animal) params.set("animal", animal);
    if (near) params.set("near", near);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Horizontal chip scroller on phones (docs/design-plan.md 4.2). */}
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <div
          className="inline-flex rounded-[var(--radius-pill)] bg-surface p-1 shadow-[var(--shadow-card)]"
          role="group"
          aria-label={t.listing.filterAnimal}
        >
          {[null, ...ANIMALS].map((value) => {
            const active = (currentAnimal ?? null) === value;
            return (
              <Link
                key={value ?? "any"}
                href={withQuery(locationPath, value)}
                aria-current={active ? "true" : undefined}
                scroll={false}
                className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] px-3.5 text-sm font-semibold transition ${
                  active ? "bg-ink text-white" : "text-foreground/70 hover:text-brand-blue"
                }`}
              >
                {value && <AnimalIcon animal={value} className="h-4 w-4" />}
                {value ? t.animals[value] : t.animals.any}
              </Link>
            );
          })}
        </div>
      </div>

      <Dropdown
        ariaLabel={t.listing.filterDistrict}
        placeholder={t.listing.allOf(cityName)}
        value={currentDistrictSlug ?? "all"}
        options={[
          {
            value: "all",
            label: t.listing.allOf(cityName),
            icon: <MapPinIcon className="h-4 w-4 text-foreground/50" />,
          },
          ...districts.map((d) => ({ value: d.slug, label: d.name })),
        ]}
        onChange={(value) =>
          router.push(
            withQuery(listingPath(locale, category, citySlug, value === "all" ? null : value), currentAnimal)
          )
        }
        className="shrink-0 sm:w-64"
      />
    </div>
  );
}
