"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "./Dropdown";
import { DogIcon, CatIcon } from "./icons";

interface Option {
  slug: string;
  label: string;
}

interface HomeSearchProps {
  citySlug: string;
  cityName: string;
  categories: Option[];
  popularCategorySlugs: string[];
  districts: Option[];
  popularDistrictSlugs: string[];
}

type Overlay = "category" | "district" | null;

const ANIMAL_OPTIONS = [
  { value: "dog", label: "Dog", icon: <DogIcon className="h-5 w-5 text-brand-orange" /> },
  { value: "cat", label: "Cat", icon: <CatIcon className="h-5 w-5 text-brand-orange" /> },
];

export function HomeSearch({
  citySlug,
  cityName,
  categories,
  popularCategorySlugs,
  districts,
  popularDistrictSlugs,
}: HomeSearchProps) {
  const router = useRouter();
  const [animal, setAnimal] = useState<"dog" | "cat" | null>(null);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [districtSlug, setDistrictSlug] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);

  const categoryLabel = categories.find((c) => c.slug === categorySlug)?.label;
  const districtLabel = districts.find((d) => d.slug === districtSlug)?.label;

  function goSearch(overrides?: { category?: string; district?: string | null }) {
    const finalCategory = overrides?.category ?? categorySlug;
    if (!finalCategory) return;
    const finalDistrict = overrides?.district !== undefined ? overrides.district : districtSlug;

    let path = `/${finalCategory}/${citySlug}/`;
    if (finalDistrict) path += `${finalDistrict}/`;
    if (animal) path += `?animal=${animal}`;
    router.push(path);
  }

  return (
    <>
      {/* Mobile: 3-step vertical cards */}
      <div className="space-y-4 md:hidden">
        <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-xl font-semibold">1. Choose your pet</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAnimal("dog")}
              className={`flex flex-col items-center gap-2 rounded-[var(--radius-control)] py-6 font-medium transition ${
                animal === "dog" ? "bg-brand-orange text-white" : "bg-gray-50 text-foreground hover:bg-brand-orange-muted"
              }`}
            >
              <DogIcon className="h-7 w-7" />
              Dog
            </button>
            <button
              type="button"
              onClick={() => setAnimal("cat")}
              className={`flex flex-col items-center gap-2 rounded-[var(--radius-control)] py-6 font-medium transition ${
                animal === "cat" ? "bg-brand-orange text-white" : "bg-gray-50 text-foreground hover:bg-brand-orange-muted"
              }`}
            >
              <CatIcon className="h-7 w-7" />
              Cat
            </button>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-xl font-semibold">2. What do you need?</h2>
          <button
            type="button"
            onClick={() => setOverlay("category")}
            className="block w-full rounded-[var(--radius-control)] bg-gray-50 px-4 py-4 text-left font-medium hover:bg-brand-blue-muted"
          >
            {categoryLabel ?? "Choose a service"}
          </button>
        </div>

        <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-xl font-semibold">3. Where?</h2>
          <button
            type="button"
            onClick={() => setOverlay("district")}
            className="block w-full rounded-[var(--radius-control)] bg-gray-50 px-4 py-4 text-left font-medium hover:bg-brand-blue-muted"
          >
            {districtLabel ?? `All ${cityName}`}
          </button>
        </div>

        <button
          type="button"
          disabled={!categorySlug}
          onClick={() => goSearch()}
          className="block w-full rounded-[var(--radius-control)] bg-brand-orange px-6 py-4 text-center font-medium text-white transition hover:bg-brand-orange/90 disabled:opacity-40"
        >
          Search
        </button>
      </div>

      {/* Desktop: single search panel with custom dropdowns */}
      <div className="hidden rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-panel)] md:block">
        <div className="flex gap-3">
          <Dropdown
            ariaLabel="Choose pet"
            placeholder="Choose pet"
            value={animal}
            options={ANIMAL_OPTIONS}
            onChange={(v) => setAnimal(v as "dog" | "cat")}
            className="flex-1"
          />
          <Dropdown
            ariaLabel="Service needed"
            placeholder="Service needed"
            value={categorySlug}
            options={categories.map((c) => ({ value: c.slug, label: c.label }))}
            onChange={setCategorySlug}
            className="flex-1"
          />
          <Dropdown
            ariaLabel="Location"
            placeholder={`All ${cityName}`}
            value={districtSlug}
            options={districts.map((d) => ({ value: d.slug, label: d.label }))}
            onChange={setDistrictSlug}
            className="flex-1"
          />
          <button
            type="button"
            disabled={!categorySlug}
            onClick={() => goSearch()}
            className="shrink-0 rounded-[var(--radius-control)] bg-brand-orange px-8 py-3 font-medium text-white transition hover:bg-brand-orange/90 disabled:opacity-40"
          >
            Search
          </button>
        </div>
      </div>

      {overlay && (
        <StepOverlay
          title={overlay === "category" ? "What do you need?" : "Where?"}
          options={overlay === "category" ? categories : [{ slug: "", label: `All ${cityName}` }, ...districts]}
          popularSlugs={overlay === "category" ? popularCategorySlugs : popularDistrictSlugs}
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
  onClose,
  onSelect,
}: {
  title: string;
  options: Option[];
  popularSlugs: string[];
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
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-foreground/60 hover:bg-gray-100"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {popular.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/50">Popular</p>
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
