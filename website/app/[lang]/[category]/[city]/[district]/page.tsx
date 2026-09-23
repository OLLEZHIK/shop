import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_CATEGORIES, categoryFromSlug, categoryLabel, categorySingular, categorySlug, listingPath } from "@/lib/categories";
import { getCityBySlug, getAllCities, getAllDistricts, getDistrictBySlug, getCategoryAggregates } from "@/lib/data";
import { getDictionary, isLocale, localesForCountry } from "@/lib/i18n";
import { localeAlternates } from "@/lib/seo";
import { CategoryListing, whereLabel } from "@/components/CategoryListing";

interface PageParams {
  lang: string;
  category: string;
  city: string;
  district: string;
}

async function resolve(params: Promise<PageParams>) {
  const { lang, category: slug, city: citySlug, district: districtSlug } = await params;
  if (!isLocale(lang)) return null;
  const category = categoryFromSlug(slug, lang);
  if (!category) return null;
  const city = await getCityBySlug(citySlug);
  if (!city || !localesForCountry(city.country).includes(lang)) return null;
  const district = await getDistrictBySlug(districtSlug);
  if (!district || district.city.slug !== citySlug) return null;
  return { locale: lang, category, city, citySlug, district, districtSlug };
}

export async function generateStaticParams() {
  const [cities, districts] = await Promise.all([getAllCities(), getAllDistricts()]);
  return cities.flatMap((city) =>
    localesForCountry(city.country).flatMap((lang) =>
      ALL_CATEGORIES.flatMap((category) =>
        districts
          .filter((d) => d.cityId === city.id)
          .map((district) => ({
            lang,
            category: categorySlug(category, lang),
            city: city.slug,
            district: district.slug,
          }))
      )
    )
  );
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};

  const { locale, category, city, district } = resolved;
  const t = getDictionary(locale).listing;
  const aggregates = await getCategoryAggregates(category, district.slug);
  const where = whereLabel(locale, city.slug, city.name, district.name);
  const what = aggregates.count === 1 ? categorySingular(category, locale) : categoryLabel(category, locale).toLowerCase();
  const locales = localesForCountry(city.country);

  return {
    // Filter variants (?animal=dog, ?near=) point at the unfiltered page.
    alternates: localeAlternates(
      locale,
      Object.fromEntries(locales.map((l) => [l, listingPath(l, category, city.slug, district.slug)]))
    ),
    title: t.metaTitle(categoryLabel(category, locale), where),
    description: t.metaDescription(aggregates.count, what, where),
    robots: aggregates.count < 3 ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryCityDistrictPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ animal?: string; near?: string }>;
}) {
  const resolved = await resolve(params);
  if (!resolved) notFound();

  const { animal, near } = await searchParams;
  const { locale, category, city, citySlug, district, districtSlug } = resolved;

  return (
    <CategoryListing
      locale={locale}
      category={category}
      citySlug={citySlug}
      cityName={city.name}
      districtSlug={districtSlug}
      districtName={district.name}
      animal={animal}
      near={near}
    />
  );
}
