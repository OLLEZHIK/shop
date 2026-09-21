"use client";

import { useRouter } from "next/navigation";

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

  function handleDistrictChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const path = value === "all" ? `${base}/` : `${base}/${value}/`;
    router.push(withAnimal(path));
  }

  function handleAnimalChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const path = currentDistrictSlug ? `${base}/${currentDistrictSlug}/` : `${base}/`;
    router.push(value === "all" ? path : `${path}?animal=${value}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={currentDistrictSlug ?? "all"}
        onChange={handleDistrictChange}
        aria-label="Filter by district"
        className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
      >
        <option value="all">All districts</option>
        {districts.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        value={currentAnimal ?? "all"}
        onChange={handleAnimalChange}
        aria-label="Filter by animal"
        className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
      >
        <option value="all">Any animal</option>
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
      </select>

      {hasPriceData && priceFrom !== null && priceFrom !== undefined && (
        <span className="flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm text-foreground/70">
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
