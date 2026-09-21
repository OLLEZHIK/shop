import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryEnumFromSlug, CATEGORY_LABELS, ALL_CATEGORY_SLUGS } from "@/lib/categories";
import { getCityBySlug, getAllCities, getAllDistricts, getDistrictBySlug, getCategoryAggregates } from "@/lib/data";
import { CategoryListing } from "@/components/CategoryListing";

interface PageParams {
  category: string;
  city: string;
  district: string;
}

async function resolve(params: Promise<PageParams>) {
  const { category: categorySlug, city: citySlug, district: districtSlug } = await params;
  const category = categoryEnumFromSlug(categorySlug);
  if (!category) return null;
  const city = await getCityBySlug(citySlug);
  if (!city) return null;
  const district = await getDistrictBySlug(districtSlug);
  if (!district || district.city.slug !== citySlug) return null;
  return { category, categorySlug, city, citySlug, district, districtSlug };
}

export async function generateStaticParams() {
  const [cities, districts] = await Promise.all([getAllCities(), getAllDistricts()]);
  return ALL_CATEGORY_SLUGS.flatMap((category) =>
    cities.flatMap((city) => districts.map((district) => ({ category, city: city.slug, district: district.slug })))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};

  const { category, city, district } = resolved;
  const aggregates = await getCategoryAggregates(category, district.slug);
  const title = `${CATEGORY_LABELS[category]} in ${district.name}, ${city.name}`;

  return {
    title,
    description: `Browse ${aggregates.count} ${CATEGORY_LABELS[category].toLowerCase()} in ${district.name}, ${city.name}.`,
    robots: aggregates.count < 3 ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryCityDistrictPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ animal?: string }>;
}) {
  const resolved = await resolve(params);
  if (!resolved) notFound();

  const { animal } = await searchParams;
  const { category, categorySlug, city, citySlug, district, districtSlug } = resolved;

  return (
    <CategoryListing
      category={category}
      categorySlug={categorySlug}
      citySlug={citySlug}
      cityName={city.name}
      districtSlug={districtSlug}
      districtName={district.name}
      animal={animal}
    />
  );
}
