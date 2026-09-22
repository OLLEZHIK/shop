import Link from "next/link";
import { getBusinessCount, getDefaultCity, getAllDistricts, getDistrictCounts } from "@/lib/data";
import { ALL_CATEGORY_SLUGS, CATEGORY_LABELS, categoryEnumFromSlug } from "@/lib/categories";
import { HomeSearch } from "@/components/HomeSearch";

export default async function HomePage() {
  const [counts, city, districts, districtCounts] = await Promise.all([
    getBusinessCount(),
    getDefaultCity(),
    getAllDistricts(),
    getDistrictCounts(),
  ]);

  const cityName = city?.name ?? "Bratislava";
  const citySlug = city?.slug ?? "";

  const categories = ALL_CATEGORY_SLUGS.map((slug) => ({
    slug,
    label: CATEGORY_LABELS[categoryEnumFromSlug(slug)!],
  }));
  const popularCategorySlugs = [...categories]
    .sort((a, b) => (counts.byCategory[categoryEnumFromSlug(b.slug)!] ?? 0) - (counts.byCategory[categoryEnumFromSlug(a.slug)!] ?? 0))
    .slice(0, 3)
    .map((c) => c.slug);

  const districtOptions = districts.map((d) => ({ slug: d.slug, label: d.name }));
  const popularDistrictSlugs = districtCounts.slice(0, 3).map((d) => d.slug);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
          Find Pet Services in {cityName}
        </h1>
        <p className="mb-12 text-lg text-foreground/80">
          Discover trusted groomers, vets, hotels and training for your pets
        </p>

        <HomeSearch
          citySlug={citySlug}
          cityName={cityName}
          categories={categories}
          popularCategorySlugs={popularCategorySlugs}
          districts={districtOptions}
          popularDistrictSlugs={popularDistrictSlugs}
        />

        <div className="mt-12 grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          <div>
            <div className="text-3xl font-bold text-brand-blue">{counts.byCategory.GROOMING || 0}</div>
            <div className="text-sm text-foreground/60">Salons</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-blue">{counts.byCategory.VET_CLINIC || 0}</div>
            <div className="text-sm text-foreground/60">Vet Clinics</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-blue">{counts.byCategory.PET_HOTEL || 0}</div>
            <div className="text-sm text-foreground/60">Hotels</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-blue">{counts.total}</div>
            <div className="text-sm text-foreground/60">Total Services</div>
          </div>
        </div>

        <div className="mt-16 rounded-lg bg-white p-8 text-left shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">How it works</h2>
          <p className="mt-2 text-foreground/70">
            Pick a service and a district, compare verified contact details and prices, then call, visit the
            website, or get directions in one tap - no accounts, no middlemen.
          </p>
          <Link href="/how-it-works/" className="mt-3 inline-block text-brand-blue hover:underline">
            Learn more &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
