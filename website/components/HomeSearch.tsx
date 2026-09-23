"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessCategory } from "@prisma/client";
import { Dropdown } from "./Dropdown";
import { ChevronDownIcon, MapPinIcon, SearchIcon } from "./icons";
import { AnimalIcon } from "./AnimalIcon";
import { CategoryIcon } from "./CategoryIcon";
import { ANIMALS, animalsForService, servicesForAnimal, type Animal } from "@/lib/animals";
import { CATEGORY_THEME } from "@/lib/categories";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { nearestCity, type CityPointLite } from "@/lib/geo";

export interface SearchOption {
  slug: string;
  label: string;
}

export interface SearchCategory extends SearchOption {
  category: BusinessCategory;
}

interface HomeSearchProps {
  locale: Locale;
  citySlug: string;
  cityName: string;
  categories: SearchCategory[];
  popularCategorySlugs: string[];
  districts: SearchOption[];
  popularDistrictSlugs: string[];
  /** "hero" = homepage (pill bar on desktop, card on phones).
   *  "dialog" = the stepped card at every size, for the Find pet care dialog. */
  layout?: "hero" | "dialog";
  /** Called right before navigating to the results (e.g. to close a dialog). */
  onNavigate?: () => void;
  /** Covered cities with a centre point - enables "Near me". */
  cities?: CityPointLite[];
}

const NEAR = "__near";
type GeoStatus = "idle" | "locating" | "denied" | "far";

type Overlay = "category" | "district" | null;

export function HomeSearch({
  locale,
  citySlug,
  cityName,
  categories,
  popularCategorySlugs,
  districts,
  popularDistrictSlugs,
  layout = "hero",
  onNavigate,
  cities = [],
}: HomeSearchProps) {
  const router = useRouter();
  const t = getDictionary(locale);
  const [animal, setAnimalState] = useState<Animal | null>(null);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [districtSlug, setDistrictSlug] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  // Bumped when Search is pressed with no service: remounts the Service
  // dropdown already open.
  const [serviceNudge, setServiceNudge] = useState(0);
  // "Near me": asked only when the visitor taps it (never on page load),
  // then results open in the nearest covered city sorted by distance.
  const [near, setNear] = useState<{ lat: number; lng: number; citySlug: string } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const canLocate = cities.length > 0;

  function locate() {
    if (!("geolocation" in navigator)) return setGeoStatus("denied");
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const city = nearestCity(cities, latitude, longitude);
        if (!city) {
          setNear(null);
          return setGeoStatus("far");
        }
        setNear({ lat: latitude, lng: longitude, citySlug: city.slug });
        setDistrictSlug(null);
        setGeoStatus("idle");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  }

  function pickDistrict(slug: string | null) {
    setNear(null);
    setGeoStatus("idle");
    setDistrictSlug(slug);
  }

  // Services that make sense for the chosen pet, and pets that make
  // sense for the chosen service (lib/animals.ts): no dog training for birds.
  const allowedServices = servicesForAnimal(animal);
  const visibleCategories = allowedServices
    ? categories.filter((c) => allowedServices.includes(c.category))
    : categories;
  const selectedCategory = categories.find((c) => c.slug === categorySlug);
  const visibleAnimals = selectedCategory ? animalsForService(selectedCategory.category) : [...ANIMALS];

  function setAnimal(next: Animal | null) {
    setAnimalState(next);
    // Drop a service the new pet doesn't need.
    const allowed = servicesForAnimal(next);
    if (allowed && selectedCategory && !allowed.includes(selectedCategory.category)) setCategorySlug(null);
  }

  const categoryLabel = selectedCategory?.label;
  const districtLabel = near ? t.search.nearYou : districts.find((d) => d.slug === districtSlug)?.label;

  function goSearch() {
    if (!categorySlug) return;
    let path = localePath(locale, `/${categorySlug}/${near?.citySlug ?? citySlug}/`);
    if (districtSlug) path += `${districtSlug}/`;
    const params = new URLSearchParams();
    if (animal) params.set("animal", animal);
    if (near) params.set("near", `${near.lat.toFixed(4)},${near.lng.toFixed(4)}`);
    const query = params.toString();
    if (query) path += `?${query}`;
    onNavigate?.();
    router.push(path);
  }

  const petChips = (
    // py-2: room inside the horizontal scroller for the hover lift and
    // ring - overflow-x clips vertically too.
    <div className="-mx-4 mt-0.5 flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
      {visibleAnimals.map((value) => {
        const active = animal === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => setAnimal(active ? null : value)}
            className={`flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 font-semibold transition ${
              active ? "bg-brand-orange text-white shadow-[var(--shadow-card)]" : "bg-surface-sunken text-foreground ring-1 ring-transparent hover:-translate-y-0.5 hover:bg-brand-orange-muted hover:text-brand-orange-deep hover:shadow-[var(--shadow-card)] hover:ring-brand-orange/60"
            }`}
          >
            <AnimalIcon animal={value} className="h-5 w-5" />
            {t.animalSingular[value]}
          </button>
        );
      })}
    </div>
  );

  const stepLabel = "px-1 text-xs font-semibold uppercase tracking-wider text-foreground/50";

  const nearButton = canLocate && (
    <button
      type="button"
      onClick={locate}
      aria-pressed={!!near}
      className={`inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold normal-case tracking-normal transition ${
        near ? "bg-brand-blue text-white" : "bg-brand-blue-muted text-brand-blue hover:bg-brand-blue hover:text-white"
      }`}
    >
      <MapPinIcon className={`h-3.5 w-3.5 ${geoStatus === "locating" ? "animate-pulse" : ""}`} />
      {geoStatus === "locating" ? t.search.locatingYou : near ? t.search.nearYou : t.search.nearMe}
    </button>
  );

  const geoMessage =
    geoStatus === "denied" ? t.search.geoDenied : geoStatus === "far" ? t.search.geoFar(cityName) : null;

  if (layout === "dialog") {
    return (
      <div className="text-left">
        <p className={stepLabel}>{t.search.stepPet}</p>
        {petChips}

        <p className={`mt-5 ${stepLabel} ${serviceNudge > 0 && !categorySlug ? "!text-brand-orange-deep" : ""}`}>
          {t.search.stepService}
        </p>
        {/* Pressing search without a service flashes this block. */}
        <div
          key={serviceNudge}
          className={`mt-2 grid grid-cols-2 gap-2 rounded-[var(--radius-control)] ${
            serviceNudge > 0 && !categorySlug ? "nudge ring-2 ring-brand-orange/60 ring-offset-4 ring-offset-surface" : ""
          }`}
        >
          {visibleCategories.map((c) => {
            const active = c.slug === categorySlug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={active}
                onClick={() => setCategorySlug(active ? null : c.slug)}
                className={`flex min-h-12 items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 text-left text-sm font-semibold transition ${
                  active
                    ? "accent-solid shadow-[var(--shadow-card)]"
                    : "bg-surface-sunken text-foreground ring-1 ring-transparent hover:-translate-y-0.5 hover:bg-surface hover:text-[var(--accent)] hover:shadow-[var(--shadow-card)] hover:ring-[var(--accent)]"
                }`}
                style={{ "--accent": CATEGORY_THEME[c.category].accent } as React.CSSProperties}
              >
                <CategoryIcon category={c.category} className="h-5 w-5 shrink-0" />
                {c.label}
              </button>
            );
          })}
        </div>

        <div className={`mt-5 flex items-center justify-between gap-2 ${stepLabel}`}>
          {t.search.stepWhere}
          {nearButton}
        </div>
        <Dropdown
          key={near ? "near" : "district"}
          ariaLabel={t.search.where}
          placeholder={t.search.all(cityName)}
          value={near ? NEAR : (districtSlug ?? "all")}
          options={[
            ...(near ? [{ value: NEAR, label: t.search.nearYou, icon: <MapPinIcon className="h-4 w-4 text-brand-blue" /> }] : []),
            { value: "all", label: t.search.all(cityName), icon: <MapPinIcon className="h-4 w-4 text-foreground/50" /> },
            ...districts.map((d) => ({ value: d.slug, label: d.label })),
          ]}
          onChange={(v) => (v === NEAR ? undefined : pickDistrict(v === "all" ? null : v))}
          className="mt-2"
        />
        {geoMessage && <p className="mt-2 px-1 text-sm text-brand-orange-deep">{geoMessage}</p>}

        <button
          type="button"
          onClick={() => (categorySlug ? goSearch() : setServiceNudge((n) => n + 1))}
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-brand-orange px-6 font-semibold text-white transition hover:bg-brand-orange-deep"
        >
          <SearchIcon className="h-5 w-5" />
          {categorySlug ? t.search.showResults : t.search.pickService}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: one compact card - pet, then service and place */}
      <div className="rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-[var(--shadow-panel)] md:hidden">
        <p className={stepLabel}>{t.search.stepPet}</p>
        {petChips}

        <p className={`mt-4 ${stepLabel}`}>{t.search.stepService}</p>
        <button
          type="button"
          onClick={() => setOverlay("category")}
          className="mt-2 flex min-h-12 w-full items-center justify-between rounded-[var(--radius-control)] bg-surface-sunken px-4 text-left font-medium"
        >
          <span className={categoryLabel ? "text-foreground" : "text-foreground/55"}>
            {categoryLabel ?? t.search.servicePlaceholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-foreground/50" />
        </button>

        <div className={`mt-4 flex items-center justify-between gap-2 ${stepLabel}`}>
          {t.search.stepWhere}
          {nearButton}
        </div>
        <button
          type="button"
          onClick={() => setOverlay("district")}
          className="mt-2 flex min-h-12 w-full items-center justify-between rounded-[var(--radius-control)] bg-surface-sunken px-4 text-left font-medium"
        >
          <span className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-foreground/50" />
            {districtLabel ?? t.search.all(cityName)}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-foreground/50" />
        </button>
        {geoMessage && <p className="mt-2 px-1 text-sm text-brand-orange-deep">{geoMessage}</p>}

        <button
          type="button"
          onClick={() => (categorySlug ? goSearch() : setOverlay("category"))}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-brand-orange px-6 font-semibold text-white transition hover:bg-brand-orange-deep"
        >
          <SearchIcon className="h-5 w-5" />
          {categorySlug ? t.search.showResults : t.search.pickService}
        </button>
      </div>

      {/* Desktop: one pill-shaped bar, three labelled segments (Zocdoc pattern) */}
      <div className="hidden items-center rounded-[var(--radius-pill)] bg-surface p-2 shadow-[var(--shadow-panel)] ring-1 ring-line md:flex">
        <Dropdown
          variant="bar"
          label={t.search.pet}
          ariaLabel={t.search.pet}
          placeholder={t.search.petPlaceholder}
          value={animal}
          options={visibleAnimals.map((value) => ({
            value,
            label: t.animalSingular[value],
            icon: <AnimalIcon animal={value} className="h-5 w-5 text-brand-orange" />,
          }))}
          onChange={(v) => setAnimal(v as Animal)}
          className="min-w-0 flex-1"
        />
        <span aria-hidden="true" className="h-8 w-px bg-line" />
        <Dropdown
          key={serviceNudge}
          defaultOpen={serviceNudge > 0}
          variant="bar"
          label={t.search.service}
          ariaLabel={t.search.service}
          placeholder={t.search.servicePlaceholder}
          value={categorySlug}
          options={visibleCategories.map((c) => ({ value: c.slug, label: c.label }))}
          onChange={setCategorySlug}
          className="min-w-0 flex-[1.25]"
        />
        <span aria-hidden="true" className="h-8 w-px bg-line" />
        <Dropdown
          variant="bar"
          label={t.search.where}
          ariaLabel={t.search.where}
          placeholder={geoStatus === "locating" ? t.search.locatingYou : t.search.all(cityName)}
          value={near ? NEAR : districtSlug}
          options={[
            ...(canLocate
              ? [{ value: NEAR, label: near ? t.search.nearYou : t.search.nearMe, icon: <MapPinIcon className="h-4 w-4 text-brand-blue" /> }]
              : []),
            ...districts.map((d) => ({ value: d.slug, label: d.label })),
          ]}
          onChange={(v) => (v === NEAR ? locate() : pickDistrict(v))}
          className="min-w-0 flex-[1.1]"
        />
        <button
          type="button"
          // Always clickable: without a service it opens the Service list
          // instead of looking broken (a faded, disabled button).
          onClick={() => (categorySlug ? goSearch() : setServiceNudge((n) => n + 1))}
          title={categorySlug ? undefined : t.search.chooseServiceFirst}
          className="ml-2 flex h-14 shrink-0 items-center gap-2 rounded-[var(--radius-pill)] bg-brand-orange px-7 font-semibold text-white shadow-[0_8px_20px_-8px_rgba(255,107,53,0.7)] transition hover:-translate-y-0.5 hover:bg-brand-orange-deep"
        >
          <SearchIcon className="h-5 w-5" />
          {t.search.search}
        </button>
      </div>
      {geoMessage && (
        <p className="mt-3 hidden px-6 text-left text-sm text-brand-orange-deep md:block">{geoMessage}</p>
      )}

      {overlay && (
        <StepOverlay
          title={overlay === "category" ? t.search.servicePlaceholder : t.search.where}
          options={
            overlay === "category" ? visibleCategories : [{ slug: "", label: t.search.all(cityName) }, ...districts]
          }
          popularSlugs={overlay === "category" ? popularCategorySlugs : popularDistrictSlugs}
          labels={{ close: t.search.close, popular: t.search.popular }}
          onClose={() => setOverlay(null)}
          onSelect={(slug) => {
            if (overlay === "category") setCategorySlug(slug);
            else pickDistrict(slug || null);
            setOverlay(null);
          }}
        />
      )}
    </>
  );
}

function StepOverlay({
  title,
  options,
  popularSlugs,
  labels,
  onClose,
  onSelect,
}: {
  title: string;
  options: SearchOption[];
  popularSlugs: string[];
  labels: { close: string; popular: string };
  onClose: () => void;
  onSelect: (slug: string) => void;
}) {
  // Preserve popularSlugs' own (popularity-ranked) order - filtering
  // `options` directly would silently re-sort these back into list order.
  const popular = popularSlugs
    .map((slug) => options.find((o) => o.slug === slug))
    .filter((o): o is SearchOption => Boolean(o));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-foreground/60 hover:bg-gray-100"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {popular.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/50">{labels.popular}</p>
            <div className="flex flex-wrap gap-2">
              {popular.map((o) => (
                <button
                  key={o.slug}
                  type="button"
                  onClick={() => onSelect(o.slug)}
                  className="rounded-[var(--radius-pill)] bg-brand-orange-muted px-4 py-2 text-sm font-medium text-brand-orange hover:bg-brand-orange-muted-border/40"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <ul className="divide-y divide-gray-100">
          {options.map((o) => (
            <li key={o.slug || "all"}>
              <button
                type="button"
                onClick={() => onSelect(o.slug)}
                className="min-h-11 w-full py-3 text-left text-base hover:text-brand-blue"
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
