import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryFromSlug, categoryLabel, categoryPlural, categorySeoTitle, categorySingular, listingPath } from "@/lib/categories";
import { getCityBySlug, getDistrictBySlug, getCategoryAggregates, getNonstopVetCount } from "@/lib/data";
import { NONSTOP_SEGMENT } from "@/lib/districts";
import { getDictionary, isLocale, localesForCity } from "@/lib/i18n";
import { localeAlternates, socialMeta } from "@/lib/seo";
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
  if (!city || !localesForCity(city).includes(lang)) return null;
  // /<vets>/<city>/nonstop: the 24/7 clinics page, while the city has any.
  if (districtSlug === NONSTOP_SEGMENT) {
    if (category !== "VET_CLINIC" || (await getNonstopVetCount(citySlug)) === 0) return null;
    return { locale: lang, category, city, citySlug, district: null, districtSlug, nonstop: true as const };
  }
  const district = await getDistrictBySlug(citySlug, districtSlug);
  if (!district) return null;
  return { locale: lang, category, city, citySlug, district, districtSlug, nonstop: false as const };
}

// Rendered per request (filters come from the query string) with data
// from the per-deploy cache (lib/data.ts). Nothing is prerendered per
// city or district, so builds don't grow with cities
// (docs/architecture/multi-city.md).

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};

  const { locale, category, city } = resolved;
  const t = getDictionary(locale).listing;
  const locales = localesForCity(city);

  if (resolved.nonstop) {
    const where = whereLabel(locale, city);
    const count = await getNonstopVetCount(city.slug);
    return {
      alternates: localeAlternates(
        locale,
        Object.fromEntries(locales.map((l) => [l, listingPath(l, category, city.slug, NONSTOP_SEGMENT)]))
      ),
      title: { absolute: t.nonstopMetaTitle(where) },
      description: t.nonstopMetaDescription(count, where),
      ...socialMeta({
        title: t.nonstopMetaTitle(where),
        description: t.nonstopMetaDescription(count, where),
        path: listingPath(locale, category, city.slug, NONSTOP_SEGMENT),
        locale,
        image: { title: t.nonstopH1(where), category },
      }),
    };
  }

  const { district } = resolved;
  const aggregates = await getCategoryAggregates(category, city.slug, district.slug);
  const where = whereLabel(locale, city, district);
  const what = aggregates.count === 1 ? categorySingular(category, locale) : categoryPlural(category, locale);

  return {
    // Filter variants (?animal=, ?near=, ?sort=, ?rating=) point at the unfiltered page.
    alternates: localeAlternates(
      locale,
      Object.fromEntries(locales.map((l) => [l, listingPath(l, category, city.slug, district.slug)]))
    ),
    title: t.metaTitle(categorySeoTitle(category, locale), where),
    description: t.metaDescription(aggregates.count, what, where),
    ...socialMeta({
      title: t.metaTitle(categorySeoTitle(category, locale), where),
      description: t.metaDescription(aggregates.count, what, where),
      path: listingPath(locale, category, city.slug, district.slug),
      locale,
      image: { title: `${categoryLabel(category, locale)} – ${district.name}`, subtitle: city.name, category },
    }),
    robots: aggregates.count < 3 ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryCityDistrictPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ animal?: string; near?: string; sort?: string; rating?: string; open?: string }>;
}) {
  const resolved = await resolve(params);
  if (!resolved) notFound();

  const { animal, near, sort, rating, open } = await searchParams;
  const { locale, category, city } = resolved;

  return (
    <CategoryListing
      locale={locale}
      category={category}
      city={city}
      districtSlug={resolved.nonstop ? undefined : resolved.districtSlug}
      districtName={resolved.nonstop ? undefined : resolved.district.name}
      districtInPhrases={resolved.nonstop ? undefined : resolved.district.inPhrases}
      nonstopPage={resolved.nonstop}
      open={open}
      animal={animal}
      near={near}
      sort={sort}
      rating={rating}
    />
  );
}
