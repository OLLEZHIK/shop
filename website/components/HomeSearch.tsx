"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <div className="space-y-6 md:hidden">
        <div className="rounded-lg border-2 border-brand-blue/20 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">1. Choose your pet</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAnimal("dog")}
              className={`rounded-lg py-8 px-4 text-center font-medium transition ${
                animal === "dog" ? "bg-brand-orange text-white" : "bg-gray-100 text-foreground"
              }`}
            >
              {"🐕"} Dog
            </button>
            <button
              type="button"
              onClick={() => setAnimal("cat")}
              className={`rounded-lg py-8 px-4 text-center font-medium transition ${
                animal === "cat" ? "bg-brand-orange text-white" : "bg-gray-100 text-foreground"
              }`}
            >
              {"🐈"} Cat
            </button>
          </div>
        </div>

        <div className="rounded-lg border-2 border-brand-blue/20 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">2. What do you need?</h2>
          <button
            type="button"
            onClick={() => setOverlay("category")}
            className="block w-full rounded-lg bg-gray-100 px-4 py-4 text-left font-medium hover:bg-gray-200"
          >
            {categoryLabel ?? "Choose a service"}
          </button>
        </div>

        <div className="rounded-lg border-2 border-brand-blue/20 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">3. Where?</h2>
          <button
            type="button"
            onClick={() => setOverlay("district")}
            className="block w-full rounded-lg bg-gray-100 px-4 py-4 text-left font-medium hover:bg-gray-200"
          >
            {districtLabel ?? `All ${cityName}`}
          </button>
        </div>

        <button
          type="button"
          disabled={!categorySlug}
          onClick={() => goSearch()}
          className="block w-full rounded-lg bg-brand-orange px-6 py-4 text-center font-medium text-white transition hover:bg-brand-orange/90 disabled:opacity-40"
        >
          Search
        </button>
      </div>

      {/* Desktop: unified search bar */}
      <div className="hidden rounded-lg bg-white p-6 shadow-lg md:block">
        <div className="flex gap-4">
          <select
            value={animal ?? ""}
            onChange={(e) => setAnimal((e.target.value || null) as "dog" | "cat" | null)}
            className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-brand-blue focus:outline-none"
          >
            <option value="">Choose pet</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
          </select>
          <select
            value={categorySlug ?? ""}
            onChange={(e) => setCategorySlug(e.target.value || null)}
            className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-brand-blue focus:outline-none"
          >
            <option value="">Service needed</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={districtSlug ?? ""}
            onChange={(e) => setDistrictSlug(e.target.value || null)}
            className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-brand-blue focus:outline-none"
          >
            <option value="">All {cityName}</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!categorySlug}
            onClick={() => goSearch()}
            className="rounded-lg bg-brand-orange px-8 py-3 font-medium text-white transition hover:bg-brand-orange/90 disabled:opacity-40"
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
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
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
                  className="rounded-full bg-brand-orange/10 px-4 py-2 text-sm font-medium text-brand-orange hover:bg-brand-orange/20"
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
