import Link from "next/link";
import {
  getDefaultCity,
  getAllDistricts,
  getPopularNearby,
  getFeaturedBusinesses,
  getBusinessCount,
} from "@/lib/data";
import { ALL_CATEGORY_SLUGS, CATEGORY_LABELS, categoryEnumFromSlug } from "@/lib/categories";
import { HomeSearch } from "@/components/HomeSearch";
import { AmbientBackground } from "@/components/AmbientBackground";
import { BusinessCard } from "@/components/BusinessCard";
import { MapPinIcon } from "@/components/icons";

const CARE_TIPS = [
  {
    format: "tip" as const,
    title: "Trim nails every 3-4 weeks",
    body: "Overgrown nails change how dogs and cats walk and are more likely to split. A quick trim every few weeks keeps paws comfortable.",
  },
  {
    format: "qa" as const,
    question: "Why does my cat need a scratching post?",
    answer: "It's not about your furniture - scratching stretches muscles, sheds the outer claw layer, and marks territory. Cats do it whether or not you give them a post.",
  },
  {
    format: "checklist" as const,
    title: "Signs it's time for a vet visit",
    items: [
      "Eating or drinking noticeably more or less than usual",
      "Limping or reluctance to jump",
      "Any change that lasts more than a couple of days",
    ],
  },
  {
    format: "tip" as const,
    title: "Brush short-haired dogs weekly, long-haired daily",
    body: "Regular brushing catches mats before they need to be shaved out, and it's a lot cheaper than a grooming visit for a tangled coat.",
  },
  {
    format: "myth" as const,
    myth: "A warm, dry nose means a sick dog.",
    fact: "Nose temperature and moisture change constantly through the day for healthy dogs. Watch behavior and appetite instead.",
  },
];

export default async function HomePage() {
  const [city, districts, popularNearby, featured, counts] = await Promise.all([
    getDefaultCity(),
    getAllDistricts(),
    getPopularNearby(),
    getFeaturedBusinesses(),
    getBusinessCount(),
  ]);

  const cityName = city?.name ?? "Bratislava";
  const citySlug = city?.slug ?? "";

  const categories = ALL_CATEGORY_SLUGS.map((slug) => ({
    slug,
    label: CATEGORY_LABELS[categoryEnumFromSlug(slug)!],
  }));
  // Real counts, used only to rank the mobile overlay's "Popular"
  // shortcuts - the numeric stats block itself is removed from this page.
  const popularCategorySlugs = [...categories]
    .sort(
      (a, b) =>
        (counts.byCategory[categoryEnumFromSlug(b.slug)!] ?? 0) -
        (counts.byCategory[categoryEnumFromSlug(a.slug)!] ?? 0)
    )
    .slice(0, 3)
    .map((c) => c.slug);

  const districtOptions = districts.map((d) => ({ slug: d.slug, label: d.name }));

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBackground />

      <div className="mx-auto max-w-4xl px-4 pb-8 pt-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Find pet services in {cityName}
        </h1>
        <p className="mb-10 text-lg text-foreground/70">
          Discover trusted groomers, vets, hotels and trainers for your pets
        </p>

        <HomeSearch
          citySlug={citySlug}
          cityName={cityName}
          categories={categories}
          popularCategorySlugs={popularCategorySlugs}
          districts={districtOptions}
          popularDistrictSlugs={popularNearby.map((p) => p.districtSlug)}
        />
      </div>

      {popularNearby.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground">Popular nearby</h2>
          <p className="mt-1 text-foreground/60">The most-listed services by district, right now.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularNearby.map((item) => (
              <Link
                key={item.districtSlug}
                href={`/${item.categorySlug}/${citySlug}/${item.districtSlug}/`}
                className="group rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="flex items-center gap-1.5 text-sm text-foreground/60">
                  <MapPinIcon className="h-4 w-4" />
                  {item.districtName}
                </div>
                <p className="mt-2 font-semibold text-foreground group-hover:text-brand-blue">
                  {item.categoryLabel}
                </p>
                <p className="mt-1 text-sm text-foreground/60">{item.count} listed</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground">Featured partners</h2>
          <div className="mt-6 space-y-4">
            {featured.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">Pet care basics</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARE_TIPS.map((tip, i) => (
            <div key={i} className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
              {tip.format === "tip" && (
                <>
                  <p className="font-semibold text-foreground">{tip.title}</p>
                  <p className="mt-2 text-sm text-foreground/70">{tip.body}</p>
                </>
              )}
              {tip.format === "qa" && (
                <>
                  <p className="font-semibold text-brand-blue">{tip.question}</p>
                  <p className="mt-2 text-sm text-foreground/70">{tip.answer}</p>
                </>
              )}
              {tip.format === "checklist" && (
                <>
                  <p className="font-semibold text-foreground">{tip.title}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-foreground/70">
                    {tip.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
              {tip.format === "myth" && (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-amber">Myth</p>
                  <p className="mt-1 text-sm text-foreground/70 line-through decoration-foreground/30">{tip.myth}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-brand-green">Fact</p>
                  <p className="mt-1 text-sm text-foreground/70">{tip.fact}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
