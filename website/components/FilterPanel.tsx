"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BusinessCategory } from "@prisma/client";
import { animalsForService } from "@/lib/animals";
import { cityPath, listingPath } from "@/lib/categories";
import { getDictionary, type Locale } from "@/lib/i18n";
import { AnimalIcon } from "./AnimalIcon";
import { Dropdown } from "./Dropdown";
import { MapPinIcon, StarIcon } from "./icons";
import { MIN_RATINGS, type ListingSort, type MinRating } from "@/lib/listingSort";

// No district picker (owner, 2026-09-25): location is "Near me" (sort by
// distance); district pages stay for SEO and are linked from place texts.
interface FilterPanelProps {
  locale: Locale;
  /** null: the city page listing every service. */
  category: BusinessCategory | null;
  citySlug: string;
  /** District or attribute page the visitor is on, kept by the filters. */
  currentDistrictSlug?: string;
  currentAnimal?: string;
  /** "lat,lng" when the list is sorted by distance - kept across filters. */
  near?: string;
  sort?: ListingSort;
  minRating?: MinRating;
  openNow?: boolean;
  /** Some place in the list has opening hours (else the chip would only
   *  ever show an empty list). */
  showOpenNow?: boolean;
  /** Attribute pages to offer (lib/attributePages.ts): links to their own
   *  indexable URLs, not query filters; the active one leads back. */
  attributes?: { key: string; label: string; href: string; active: boolean }[];
  /** Pets to offer (ones with at least one place in the category). */
  animals?: string[];
}

export function FilterPanel({
  locale,
  category,
  citySlug,
  currentDistrictSlug,
  currentAnimal,
  near,
  sort,
  minRating,
  openNow = false,
  showOpenNow = true,
  attributes = [],
  animals,
}: FilterPanelProps) {
  const router = useRouter();
  const t = getDictionary(locale);
  const locationPath = category ? listingPath(locale, category, citySlug, currentDistrictSlug) : cityPath(locale, citySlug);
  const [locating, setLocating] = useState(false);
  const [geoOff, setGeoOff] = useState(false);

  // Every filter link keeps the other filters; `changes` overrides one.
  function withQuery(
    path: string,
    changes: {
      animal?: string | null;
      sort?: string | null;
      rating?: string | null;
      open?: string | null;
      near?: string | null;
    } = {}
  ) {
    const params = new URLSearchParams();
    const animal = "animal" in changes ? changes.animal : currentAnimal;
    const sortValue = "sort" in changes ? changes.sort : sort;
    const rating = "rating" in changes ? changes.rating : minRating;
    const openValue = "open" in changes ? changes.open : openNow ? "1" : null;
    const nearValue = "near" in changes ? changes.near : near;
    if (animal) params.set("animal", animal);
    if (nearValue) params.set("near", nearValue);
    if (sortValue) params.set("sort", sortValue);
    if (rating) params.set("rating", rating);
    if (openValue) params.set("open", openValue);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  // "Near me": asked only on tap; the list re-sorts by distance.
  function toggleNear() {
    if (near) return router.push(withQuery(locationPath, { near: null }), { scroll: false });
    if (!("geolocation" in navigator)) return setGeoOff(true);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const value = `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`;
        router.push(withQuery(locationPath, { near: value }), { scroll: false });
      },
      () => {
        setLocating(false);
        setGeoOff(true);
      },
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  }

  const chip = (active: boolean) =>
    `inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] px-3.5 text-sm font-semibold transition ${
      active ? "bg-ink text-white" : "text-foreground/70 hover:text-brand-blue"
    }`;
  const toggle = (active: boolean, on: string) =>
    `inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border px-3.5 text-sm font-semibold transition ${
      active ? `border-transparent ${on} text-white` : "border-line bg-surface text-foreground/70 hover:text-brand-blue"
    }`;
  const numberFormat = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 });

  return (
    <div className="space-y-3">
      {/* Wraps onto a second line on phones instead of hiding pets
          behind a sideways scroll nobody discovers. */}
      <div
        className="flex w-fit flex-wrap gap-1 rounded-[22px] bg-surface p-1 shadow-[var(--shadow-card)]"
        role="group"
        aria-label={t.listing.filterAnimal}
      >
        {[null, ...(animals ?? (category ? animalsForService(category) : []))].map((value) => {
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

      {/* Near me, Open now (all categories) and attribute pages (vets:
          Nonstop, Saturday, Sunday, exotics, home visits). */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={toggleNear} aria-pressed={!!near} className={toggle(!!near, "bg-brand-blue")}>
          <MapPinIcon className={`h-4 w-4 ${locating ? "animate-pulse" : ""}`} />
          {locating ? t.search.locatingYou : near ? t.search.nearYou : t.search.nearMe}
        </button>
        {showOpenNow && (
          <Link
            href={withQuery(locationPath, { open: openNow ? null : "1" })}
            aria-current={openNow ? "true" : undefined}
            scroll={false}
            className={toggle(openNow, "bg-brand-green")}
          >
            <span className={`h-2 w-2 rounded-full ${openNow ? "bg-white" : "bg-brand-green"}`} aria-hidden="true" />
            {t.listing.openNowFilter}
          </Link>
        )}
        {/* Attribute chips look like every other filter (owner, 2026-09-25:
            no extra colours); only the active one is filled. */}
        {attributes.map((a) => (
          <Link
            key={a.key}
            href={withQuery(a.href)}
            aria-current={a.active ? "page" : undefined}
            className={toggle(a.active, "bg-ink")}
          >
            {a.label}
          </Link>
        ))}
        {geoOff && <span className="text-sm text-foreground/60">{t.listing.geoOff}</span>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex w-fit flex-wrap gap-1 rounded-[22px] bg-surface p-1 shadow-[var(--shadow-card)]"
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
          onChange={(value) =>
            router.push(withQuery(locationPath, { sort: value === "default" ? null : value }), { scroll: false })
          }
          className="shrink-0 sm:w-64"
        />
      </div>
    </div>
  );
}
