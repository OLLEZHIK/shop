"use client";

import { useRouter } from "next/navigation";
import { Dropdown } from "./Dropdown";
import { DogIcon, CatIcon } from "./icons";

interface FilterPanelProps {
  categorySlug: string;
  citySlug: string;
  districts: { slug: string; name: string }[];
  currentDistrictSlug?: string;
  currentAnimal?: string;
  hasPriceData: boolean;
  priceFrom?: number | null;
  priceTo?: number | null;
  currency?: string;
}

const ANIMAL_OPTIONS = [
  { value: "", label: "Any animal" },
  { value: "dog", label: "Dog", icon: <DogIcon className="h-5 w-5 text-brand-orange" /> },
  { value: "cat", label: "Cat", icon: <CatIcon className="h-5 w-5 text-brand-orange" /> },
];

export function FilterPanel({
  categorySlug,
  citySlug,
  districts,
  currentDistrictSlug,
  currentAnimal,
  hasPriceData,
  priceFrom,
  priceTo,
  currency = "EUR",
}: FilterPanelProps) {
  const router = useRouter();
  const base = `/${categorySlug}/${citySlug}`;

  function withAnimal(path: string) {
    return currentAnimal ? `${path}?animal=${currentAnimal}` : path;
  }

  function handleDistrictChange(value: string) {
    const path = `${base}/${value}/`;
    router.push(withAnimal(path));
  }

  function handleAnimalChange(value: string) {
    const path = currentDistrictSlug ? `${base}/${currentDistrictSlug}/` : `${base}/`;
    router.push(value ? `${path}?animal=${value}` : path);
  }

  const districtOptions = [
    { value: "", label: "All districts" },
    ...districts.map((d) => ({ value: d.slug, label: d.name })),
  ];

  return (
    <div className="flex flex-wrap gap-3">
      <Dropdown
        ariaLabel="Filter by district"
        placeholder="All districts"
        value={currentDistrictSlug ?? ""}
        options={districtOptions}
        onChange={handleDistrictChange}
        className="w-44"
      />

      <Dropdown
        ariaLabel="Filter by animal"
        placeholder="Any animal"
        value={currentAnimal ?? ""}
        options={ANIMAL_OPTIONS}
        onChange={handleAnimalChange}
        className="w-40"
      />

      {hasPriceData && priceFrom !== null && priceFrom !== undefined && (
        <span className="flex items-center rounded-[var(--radius-control)] bg-gray-100 px-3 py-2 text-sm text-foreground/70">
          {formatPrice(priceFrom, currency)}
          {priceTo && priceTo !== priceFrom ? ` – ${formatPrice(priceTo, currency)}` : ""}
        </span>
      )}
    </div>
  );
}

function formatPrice(amount: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency;
  return `${symbol}${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
}
