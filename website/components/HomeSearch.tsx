"use client";

import { useId, useRef, useState } from "react";
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
  /** "hero" = homepage (pill bar on desktop, card on phones).
   *  "dialog" = the stepped card at every size, for the Find pet care dialog. */
  layout?: "hero" | "dialog";
  /** Called right before navigating to the results (e.g. to close a dialog). */
  onNavigate?: () => void;
  /** Covered cities (name + centre): the city field's suggestions and "Near me". */
  cities?: CityPointLite[];
}

type GeoStatus = "idle" | "locating" | "denied" | "far";

// "Where" is a city, typed (owner, 2026-09-25): no district picker. The
// visitor types a city (suggestions from the cities we cover) or taps
// "Near me"; an empty field means the default city.

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function HomeSearch({
  locale,
  citySlug,
  cityName,
  categories,
  popularCategorySlugs,
  layout = "hero",
  onNavigate,
  cities = [],
}: HomeSearchProps) {
  const router = useRouter();
  const t = getDictionary(locale);
  const listId = useId();
  // Phone card / dialog field and desktop bar field: both render (one is
  // hidden by CSS), so focus goes to whichever is visible.
  const boxedInput = useRef<HTMLInputElement>(null);
  const barInput = useRef<HTMLInputElement>(null);
  const focusCity = () =>
    [boxedInput.current, barInput.current].find((el) => el && el.offsetParent !== null)?.focus();
  const [animal, setAnimalState] = useState<Animal | null>(null);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [categoryOverlay, setCategoryOverlay] = useState(false);
  // Bumped when Search is pressed with no service: remounts the Service
  // dropdown already open.
  const [serviceNudge, setServiceNudge] = useState(0);
  const [cityText, setCityText] = useState("");
  const [cityError, setCityError] = useState<string | null>(null);
  // "Near me": asked only when the visitor taps it (never on page load),
  // then results open in the nearest covered city sorted by distance.
  const [near, setNear] = useState<{ lat: number; lng: number; citySlug: string } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const canLocate = cities.length > 0;

  // Location refused, unavailable or outside our cities: never a dead
  // end - send the visitor to the city field.
  function typeByHand(status: "denied" | "far") {
    setNear(null);
    setGeoStatus(status);
    focusCity();
  }

  function locate() {
    if (!("geolocation" in navigator)) return typeByHand("denied");
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const city = nearestCity(cities, latitude, longitude);
        if (!city) return typeByHand("far");
        setNear({ lat: latitude, lng: longitude, citySlug: city.slug });
        setCityText("");
        setCityError(null);
        setGeoStatus("idle");
      },
      () => typeByHand("denied"),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  }

  function onCityChange(value: string) {
    setCityText(value);
    setCityError(null);
    setNear(null);
    setGeoStatus("idle");
  }

  /** The covered city the visitor typed: exact name/slug, else a unique prefix. */
  function resolveCity(text: string): string | null {
    const q = normalize(text);
    if (!q) return citySlug;
    const named = cities.map((c) => ({ slug: c.slug, key: normalize(c.name ?? c.slug) }));
    const exact = named.find((c) => c.key === q || c.slug === q);
    if (exact) return exact.slug;
    const prefix = named.filter((c) => c.key.startsWith(q));
    return prefix.length === 1 ? prefix[0].slug : null;
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

  function goSearch() {
    if (!categorySlug) return;
    const targetCity = near?.citySlug ?? resolveCity(cityText);
    if (!targetCity) {
      const covered = cities.map((c) => c.name ?? c.slug).join(", ") || cityName;
      setCityError(t.search.cityNotCovered(cityText.trim(), covered));
      focusCity();
      return;
    }
    let path = localePath(locale, `/${categorySlug}/${targetCity}/`);
    const params = new URLSearchParams();
    if (animal) params.set("animal", animal);
    if (near) params.set("near", `${near.lat.toFixed(4)},${near.lng.toFixed(4)}`);
    const query = params.toString();
    if (query) path += `?${query}`;
    onNavigate?.();
    router.push(path);
  }

  const petChips = (
    // Wraps instead of scrolling sideways, so every pet stays visible on
    // a phone; py-2 keeps room for the hover lift.
    <div className="mt-0.5 flex flex-wrap gap-2 py-2">
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
      className={`inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold normal-case tracking-normal transition ${
        near ? "bg-brand-blue text-white" : "bg-brand-blue-muted text-brand-blue hover:bg-brand-blue hover:text-white"
      }`}
    >
      <MapPinIcon className={`h-3.5 w-3.5 ${geoStatus === "locating" ? "animate-pulse" : ""}`} />
      {geoStatus === "locating" ? t.search.locatingYou : near ? t.search.nearYou : t.search.nearMe}
    </button>
  );

  const message =
    cityError ??
    (geoStatus === "denied" ? t.search.geoDenied : geoStatus === "far" ? t.search.geoFar(cityName) : null);

  const suggestions = (id: string) => (
    <datalist id={id}>
      {cities.map((c) => (
        <option key={c.slug} value={c.name ?? c.slug} />
      ))}
    </datalist>
  );

  // Boxed city field for the phone card and the dialog.
  const cityField = (
    <label className="mt-2 flex min-h-12 w-full items-center gap-2 rounded-[var(--radius-control)] bg-surface-sunken px-4 focus-within:ring-2 focus-within:ring-brand-blue/40">
      <MapPinIcon className={`h-4 w-4 shrink-0 ${near ? "text-brand-blue" : "text-foreground/50"}`} />
      <span className="sr-only">{t.search.cityLabel}</span>
      <input
        ref={boxedInput}
        list={`${listId}-boxed`}
        value={near ? t.search.nearYou : cityText}
        onChange={(e) => onCityChange(e.target.value)}
        onFocus={() => near && onCityChange("")}
        onKeyDown={(e) => e.key === "Enter" && (categorySlug ? goSearch() : setServiceNudge((n) => n + 1))}
        placeholder={cityName}
        autoComplete="off"
        className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 font-medium text-foreground outline-none placeholder:text-foreground/55 search-city"
      />
      {suggestions(`${listId}-boxed`)}
    </label>
  );

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
        {cityField}
        {message && <p className="mt-2 px-1 text-sm text-foreground/70">{message}</p>}

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
      {/* Mobile: one compact card - pet, then service and city */}
      <div className="rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-[var(--shadow-panel)] md:hidden">
        <p className={stepLabel}>{t.search.stepPet}</p>
        {petChips}

        <p className={`mt-4 ${stepLabel}`}>{t.search.stepService}</p>
        <button
          type="button"
          onClick={() => setCategoryOverlay(true)}
          className="mt-2 flex min-h-12 w-full items-center justify-between rounded-[var(--radius-control)] bg-surface-sunken px-4 text-left font-medium"
        >
          <span className={selectedCategory ? "text-foreground" : "text-foreground/55"}>
            {selectedCategory?.label ?? t.search.servicePlaceholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-foreground/50" />
        </button>

        <div className={`mt-4 flex items-center justify-between gap-2 ${stepLabel}`}>
          {t.search.stepWhere}
          {nearButton}
        </div>
        {cityField}
        {message && <p className="mt-2 px-1 text-sm text-foreground/70">{message}</p>}

        <button
          type="button"
          onClick={() => (categorySlug ? goSearch() : setCategoryOverlay(true))}
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
        <label className="flex min-w-0 flex-[1.1] cursor-text flex-col rounded-[var(--radius-pill)] px-4 py-2.5 transition-colors hover:bg-surface-sunken focus-within:bg-surface-sunken focus-within:ring-2 focus-within:ring-brand-blue/40">
          <span className="block text-xs font-semibold uppercase tracking-wider text-foreground/50">{t.search.where}</span>
          <span className="flex items-center gap-1.5">
            <input
              ref={barInput}
              list={`${listId}-bar`}
              value={near ? t.search.nearYou : cityText}
              onChange={(e) => onCityChange(e.target.value)}
              onFocus={() => near && onCityChange("")}
              onKeyDown={(e) => e.key === "Enter" && (categorySlug ? goSearch() : setServiceNudge((n) => n + 1))}
              placeholder={cityName}
              autoComplete="off"
              className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-[15px] font-medium text-foreground outline-none placeholder:text-foreground/60 search-city"
            />
            {canLocate && (
              <button
                type="button"
                onClick={locate}
                aria-pressed={!!near}
                title={t.search.nearMe}
                aria-label={t.search.nearMe}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                  near ? "bg-brand-blue text-white" : "bg-brand-blue-muted text-brand-blue hover:bg-brand-blue hover:text-white"
                }`}
              >
                <MapPinIcon className={`h-4 w-4 ${geoStatus === "locating" ? "animate-pulse" : ""}`} />
              </button>
            )}
          </span>
          {suggestions(`${listId}-bar`)}
        </label>
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
      {message && <p className="mt-3 hidden px-6 text-left text-sm text-foreground/70 md:block">{message}</p>}

      {categoryOverlay && (
        <StepOverlay
          title={t.search.servicePlaceholder}
          options={visibleCategories}
          popularSlugs={popularCategorySlugs}
          labels={{ close: t.search.close, popular: t.search.popular }}
          onClose={() => setCategoryOverlay(false)}
          onSelect={(slug) => {
            setCategorySlug(slug);
            setCategoryOverlay(false);
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
            <li key={o.slug}>
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
