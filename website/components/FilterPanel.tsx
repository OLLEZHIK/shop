"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown } from "./Dropdown";
import { CatIcon, DogIcon, MapPinIcon } from "./icons";

interface FilterPanelProps {
  categorySlug: string;
  citySlug: string;
  cityName: string;
  districts: { slug: string; name: string }[];
  currentDistrictSlug?: string;
  currentAnimal?: string;
}

const ANIMALS = [
  { value: null, label: "Any pet", icon: null },
  { value: "dog", label: "Dogs", icon: DogIcon },
  { value: "cat", label: "Cats", icon: CatIcon },
] as const;

export function FilterPanel({
  categorySlug,
  citySlug,
  cityName,
  districts,
  currentDistrictSlug,
  currentAnimal,
}: FilterPanelProps) {
  const router = useRouter();
  const base = `/${categorySlug}/${citySlug}`;
  const locationPath = currentDistrictSlug ? `${base}/${currentDistrictSlug}/` : `${base}/`;

  function withAnimal(path: string) {
    return currentAnimal ? `${path}?animal=${currentAnimal}` : path;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        className="inline-flex self-start rounded-[var(--radius-pill)] bg-surface p-1 shadow-[var(--shadow-card)]"
        role="group"
        aria-label="Filter by animal"
      >
        {ANIMALS.map(({ value, label, icon: Icon }) => {
          const active = (currentAnimal ?? null) === value;
          return (
            <Link
              key={label}
              href={value ? `${locationPath}?animal=${value}` : locationPath}
              aria-current={active ? "true" : undefined}
              scroll={false}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-pill)] px-4 text-sm font-semibold transition ${
                active ? "bg-ink text-white" : "text-foreground/70 hover:text-brand-blue"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </Link>
          );
        })}
      </div>

      <Dropdown
        ariaLabel="Filter by district"
        placeholder={`All of ${cityName}`}
        value={currentDistrictSlug ?? "all"}
        options={[
          { value: "all", label: `All of ${cityName}`, icon: <MapPinIcon className="h-4 w-4 text-foreground/50" /> },
          ...districts.map((d) => ({ value: d.slug, label: d.name })),
        ]}
        onChange={(value) => router.push(withAnimal(value === "all" ? `${base}/` : `${base}/${value}/`))}
        className="sm:w-64"
      />
    </div>
  );
}
