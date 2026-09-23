import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryEnumFromSlug, CATEGORY_LABELS, ALL_CATEGORY_SLUGS } from "@/lib/categories";
import { getCityBySlug, getAllCities, getCategoryAggregates } from "@/lib/data";
import { CategoryListing } from "@/components/CategoryListing";
import { SITE_URL } from "@/lib/site";

interface PageParams {
  category: string;
  city: string;
}

async function resolve(params: Promise<PageParams>) {
  const { category: categorySlug, city: citySlug } = await params;
  const category = categoryEnumFromSlug(categorySlug);
  if (!category) return null;
  const city = await getCityBySlug(citySlug);
  if (!city) return null;
  return { category, categorySlug, city, citySlug };
}

export async function generateStaticParams() {
  const cities = await getAllCities();
  return ALL_CATEGORY_SLUGS.flatMap((category) =>
    cities.map((city) => ({ category, city: city.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};

  const { category, city } = resolved;
  const aggregates = await getCategoryAggregates(category);
  const title = `${CATEGORY_LABELS[category]} in ${city.name}`;

  return {
    // Filter variants (?animal=dog) are crawlable links now - point them
    // at the unfiltered page so they don't count as duplicates.
    alternates: { canonical: `${SITE_URL}/${resolved.categorySlug}/${resolved.citySlug}/` },
    title,
    description: `Browse ${aggregates.count} ${CATEGORY_LABELS[category].toLowerCase()} in ${city.name}, checked and kept up to date.`,
    robots: aggregates.count < 3 ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryCityPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ animal?: string }>;
}) {
  const resolved = await resolve(params);
  if (!resolved) notFound();

  const { animal } = await searchParams;
  const { category, categorySlug, city, citySlug } = resolved;

  return (
    <CategoryListing
      category={category}
      categorySlug={categorySlug}
      citySlug={citySlug}
      cityName={city.name}
      animal={animal}
    />
  );
}
