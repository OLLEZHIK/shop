import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_CATEGORIES, categoryFromSlug, categoryLabel, categorySingular, categorySlug, listingPath } from "@/lib/categories";
import { getCityBySlug, getAllCities, getCategoryAggregates } from "@/lib/data";
import { getDictionary, isLocale, localesForCountry } from "@/lib/i18n";
import { localeAlternates } from "@/lib/seo";
import { CategoryListing, whereLabel } from "@/components/CategoryListing";

interface PageParams {
  lang: string;
  category: string;
  city: string;
}

async function resolve(params: Promise<PageParams>) {
  const { lang, category: slug, city: citySlug } = await params;
  if (!isLocale(lang)) return null;
  const category = categoryFromSlug(slug, lang);
  if (!category) return null;
  const city = await getCityBySlug(citySlug);
  // A locale is only served for cities whose country speaks it.
  if (!city || !localesForCountry(city.country).includes(lang)) return null;
  return { locale: lang, category, city, citySlug };
}

export async function generateStaticParams() {
  const cities = await getAllCities();
  return cities.flatMap((city) =>
    localesForCountry(city.country).flatMap((lang) =>
      ALL_CATEGORIES.map((category) => ({ lang, category: categorySlug(category, lang), city: city.slug }))
    )
  );
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};

  const { locale, category, city } = resolved;
  const t = getDictionary(locale).listing;
  const aggregates = await getCategoryAggregates(category);
  const where = whereLabel(locale, city.slug, city.name);
  const what = aggregates.count === 1 ? categorySingular(category, locale) : categoryLabel(category, locale).toLowerCase();
  const locales = localesForCountry(city.country);

  return {
    // Filter variants (?animal=dog, ?near=) point at the unfiltered page.
    alternates: localeAlternates(
      locale,
      Object.fromEntries(locales.map((l) => [l, listingPath(l, category, city.slug)]))
    ),
    title: t.metaTitle(categoryLabel(category, locale), where),
    description: t.metaDescription(aggregates.count, what, where),
    robots: aggregates.count < 3 ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryCityPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ animal?: string; near?: string }>;
}) {
  const resolved = await resolve(params);
  if (!resolved) notFound();

  const { animal, near } = await searchParams;
  const { locale, category, city, citySlug } = resolved;

  return (
    <CategoryListing
      locale={locale}
      category={category}
      citySlug={citySlug}
      cityName={city.name}
      animal={animal}
      near={near}
    />
  );
}
