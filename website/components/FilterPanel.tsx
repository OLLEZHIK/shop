"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BusinessCategory } from "@prisma/client";
import { animalsForService } from "@/lib/animals";
import { listingPath } from "@/lib/categories";
import { getDictionary, type Locale } from "@/lib/i18n";
import { AnimalIcon } from "./AnimalIcon";
import { Dropdown } from "./Dropdown";
import { MapPinIcon, StarIcon } from "./icons";
import { MIN_RATINGS, type ListingSort, type MinRating } from "@/lib/listingSort";

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
  sort?: ListingSort;
  minRating?: MinRating;
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
  sort,
  minRating,
}: FilterPanelProps) {
  const router = useRouter();
  const t = getDictionary(locale);
  const locationPath = listingPath(locale, category, citySlug, currentDistrictSlug);

  // Every filter link keeps the other filters; `changes` overrides one.
  function withQuery(
    path: string,
    changes: { animal?: string | null; sort?: string | null; rating?: string | null } = {}
  ) {
    const params = new URLSearchParams();
    const animal = "animal" in changes ? changes.animal : currentAnimal;
    const sortValue = "sort" in changes ? changes.sort : sort;
    const rating = "rating" in changes ? changes.rating : minRating;
    if (animal) params.set("animal", animal);
    if (near) params.set("near", near);
    if (sortValue) params.set("sort", sortValue);
    if (rating) params.set("rating", rating);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  const chip = (active: boolean) =>
    `inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] px-3.5 text-sm font-semibold transition ${
      active ? "bg-ink text-white" : "text-foreground/70 hover:text-brand-blue"
    }`;
  const numberFormat = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Wraps onto a second line on phones instead of hiding pets
            behind a sideways scroll nobody discovers. */}
        <div
          className="flex flex-wrap gap-1 self-start rounded-[22px] bg-surface p-1 shadow-[var(--shadow-card)]"
          role="group"
          aria-label={t.listing.filterAnimal}
        >
          {[null, ...animalsForService(category)].map((value) => {
            const active = (currentAnimal ?? null) === value;
            return (
              <Link
                key={value ?? "any"}
                href={withQuery(locationPath, { animal: value })}
                aria-current={active ? "true" : undefined}
                scroll={false}
                className={chip(active)}
              >
                {value && <AnimalIcon animal={value} className="h-4 w-4" />}
                {value ? t.animals[value] : t.animals.any}
              </Link>
            );
          })}
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
            router.push(withQuery(listingPath(locale, category, citySlug, value === "all" ? null : value)))
          }
          className="shrink-0 sm:w-64"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1 self-start rounded-[22px] bg-surface p-1 shadow-[var(--shadow-card)]"
          role="group"
          aria-label={t.listing.filterRating}
        >
          {[null, ...MIN_RATINGS].map((value) => {
            const active = (minRating ?? null) === value;
            return (
              <Link
                key={value ?? "any"}
                href={withQuery(locationPath, { rating: value })}
                aria-current={active ? "true" : undefined}
                scroll={false}
                className={chip(active)}
              >
                {value ? (
                  <>
                    <StarIcon className={`h-4 w-4 ${active ? "text-white" : "text-brand-amber"}`} />
                    {numberFormat.format(Number(value))}+
                  </>
                ) : (
                  t.listing.ratingAny
                )}
              </Link>
            );
          })}
        </div>

        <Dropdown
          ariaLabel={t.listing.sortLabel}
          placeholder={t.listing.sortLabel}
          value={sort ?? "default"}
          options={[
            { value: "default", label: near ? t.listing.sortNearest : t.listing.sortRecommended },
            { value: "rating", label: t.listing.sortRating },
            { value: "reviews", label: t.listing.sortReviews },
          ]}
          onChange={(value) => router.push(withQuery(locationPath, { sort: value === "default" ? null : value }), { scroll: false })}
          className="shrink-0 sm:w-64"
        />
      </div>
    </div>
  );
}
