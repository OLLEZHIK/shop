"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "./Dropdown";
import { ChevronDownIcon, MapPinIcon, SearchIcon } from "./icons";
import { AnimalIcon } from "./AnimalIcon";
import { ANIMALS, type Animal } from "@/lib/animals";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

interface Option {
  slug: string;
  label: string;
}

interface HomeSearchProps {
  locale: Locale;
  citySlug: string;
  cityName: string;
  categories: Option[];
  popularCategorySlugs: string[];
  districts: Option[];
  popularDistrictSlugs: string[];
}

type Overlay = "category" | "district" | null;


export function HomeSearch({
  locale,
  citySlug,
  cityName,
  categories,
  popularCategorySlugs,
  districts,
  popularDistrictSlugs,
}: HomeSearchProps) {
  const router = useRouter();
  const t = getDictionary(locale);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const animalOptions = ANIMALS.map((value) => ({
    value,
    label: t.animalSingular[value],
    icon: <AnimalIcon animal={value} className="h-5 w-5 text-brand-orange" />,
  }));
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [districtSlug, setDistrictSlug] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);

  const categoryLabel = categories.find((c) => c.slug === categorySlug)?.label;
  const districtLabel = districts.find((d) => d.slug === districtSlug)?.label;

  function goSearch(overrides?: { category?: string; district?: string | null }) {
    const finalCategory = overrides?.category ?? categorySlug;
    if (!finalCategory) return;
    const finalDistrict = overrides?.district !== undefined ? overrides.district : districtSlug;

    let path = localePath(locale, `/${finalCategory}/${citySlug}/`);
    if (finalDistrict) path += `${finalDistrict}/`;
    if (animal) path += `?animal=${animal}`;
    router.push(path);
  }

  return (
    <>
      {/* Mobile: one compact card - pet toggle, then service and place */}
      <div className="rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-[var(--shadow-panel)] md:hidden">
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-foreground/50">{t.search.stepPet}</p>
        <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
          {ANIMALS.map((value) => {
            const active = animal === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setAnimal(active ? null : value)}
                className={`flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 font-semibold transition ${
                  active ? "bg-brand-orange text-white" : "bg-surface-sunken text-foreground hover:bg-brand-orange-muted"
                }`}
              >
                <AnimalIcon animal={value} className="h-5 w-5" />
                {t.animalSingular[value]}
              </button>
            );
          })}
        </div>

        <p className="mt-4 px-1 text-xs font-semibold uppercase tracking-wider text-foreground/50">{t.search.stepService}</p>
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

        <p className="mt-4 px-1 text-xs font-semibold uppercase tracking-wider text-foreground/50">{t.search.stepWhere}</p>
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

        <button
          type="button"
          disabled={!categorySlug}
          onClick={() => goSearch()}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-brand-orange px-6 font-semibold text-white transition hover:bg-brand-orange-deep disabled:opacity-40"
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
          options={animalOptions}
          onChange={(v) => setAnimal(v as Animal)}
          className="flex-1"
        />
        <span aria-hidden="true" className="h-8 w-px bg-line" />
        <Dropdown
          variant="bar"
          label={t.search.service}
          ariaLabel={t.search.service}
          placeholder={t.search.servicePlaceholder}
          value={categorySlug}
          options={categories.map((c) => ({ value: c.slug, label: c.label }))}
          onChange={setCategorySlug}
          className="flex-[1.2]"
        />
        <span aria-hidden="true" className="h-8 w-px bg-line" />
        <Dropdown
          variant="bar"
          label={t.search.where}
          ariaLabel={t.search.where}
          placeholder={t.search.all(cityName)}
          value={districtSlug}
          options={districts.map((d) => ({ value: d.slug, label: d.label }))}
          onChange={setDistrictSlug}
          className="flex-1"
        />
        <button
          type="button"
          disabled={!categorySlug}
          onClick={() => goSearch()}
          title={categorySlug ? undefined : t.search.chooseServiceFirst}
          className="ml-2 flex h-14 shrink-0 items-center gap-2 rounded-[var(--radius-pill)] bg-brand-orange px-7 font-semibold text-white transition hover:bg-brand-orange-deep disabled:opacity-50"
        >
          <SearchIcon className="h-5 w-5" />
          {t.search.search}
        </button>
      </div>

      {overlay && (
        <StepOverlay
          title={overlay === "category" ? t.search.servicePlaceholder : t.search.where}
          options={overlay === "category" ? categories : [{ slug: "", label: t.search.all(cityName) }, ...districts]}
          popularSlugs={overlay === "category" ? popularCategorySlugs : popularDistrictSlugs}
          labels={{ close: t.search.close, popular: t.search.popular }}
          onClose={() => setOverlay(null)}
          onSelect={(slug) => {
            if (overlay === "category") {
              setCategorySlug(slug);
              setOverlay(null);
            } else {
              setDistrictSlug(slug || null);
              setOverlay(null);
            }
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
  options: Option[];
  popularSlugs: string[];
  labels: { close: string; popular: string };
  onClose: () => void;
  onSelect: (slug: string) => void;
}) {
  // Preserve popularSlugs' own (popularity-ranked) order - filtering
  // `options` directly would silently re-sort these back into list order.
  const popular = popularSlugs
    .map((slug) => options.find((o) => o.slug === slug))
    .filter((o): o is Option => Boolean(o));

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
