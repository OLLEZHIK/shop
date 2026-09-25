import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryFromSlug, categoryLabel, categoryPlural, categorySeoTitle, categorySingular, listingPath } from "@/lib/categories";
import { getAttributeCounts, getCityBySlug, getDistrictBySlug, getCategoryAggregates, getMarketPrices } from "@/lib/data";
import { PRICES_SEGMENT, pricesPath } from "@/lib/pricePages";
import { PriceOverviewPage } from "@/components/PricePages";
import { attributeFromSlug, attributePath, minToIndex } from "@/lib/attributePages";
import { getDictionary, inCity, isLocale, localesForCity } from "@/lib/i18n";
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
  // /<category>/<city>/prices: price overview, while any service has a
  // market price (at least 3 places) - lib/pricePages.ts.
  if (districtSlug === PRICES_SEGMENT[lang]) {
    if ((await getMarketPrices(category, citySlug)).size === 0) return null;
    return { locale: lang, category, city, citySlug, district: null, districtSlug, attribute: null, prices: true as const };
  }
  // /<vets>/<city>/nonstop, /sobota, /exoticke-zvierata...: attribute
  // pages, while at least one place has the attribute (lib/attributePages.ts).
  const attribute = attributeFromSlug(category, districtSlug, lang);
  if (attribute) {
    if (((await getAttributeCounts(category, citySlug)).get(attribute) ?? 0) === 0) return null;
    return { locale: lang, category, city, citySlug, district: null, districtSlug, attribute, prices: false as const };
  }
  const district = await getDistrictBySlug(citySlug, districtSlug);
  if (!district) return null;
  return { locale: lang, category, city, citySlug, district, districtSlug, attribute: null, prices: false as const };
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

  if (resolved.prices) {
    const tp = getDictionary(locale).prices;
    const where = inCity(locale, city);
    const label = categoryLabel(category, locale);
    const services = (await getMarketPrices(category, city.slug)).size;
    const title = tp.overviewMetaTitle(label, where);
    const description = tp.overviewMetaDescription(label, where, services);
    return {
      alternates: localeAlternates(locale, Object.fromEntries(locales.map((l) => [l, pricesPath(l, category, city.slug)]))),
      title: { absolute: title },
      description,
      ...socialMeta({ title, description, path: pricesPath(locale, category, city.slug), locale, image: { title: tp.overviewH1(label, where), category } }),
    };
  }

  if (resolved.attribute) {
    const key = resolved.attribute;
    const ta = getDictionary(locale).attributes[key];
    const where = whereLabel(locale, city);
    const count = (await getAttributeCounts(category, city.slug)).get(key) ?? 0;
    return {
      alternates: localeAlternates(
        locale,
        Object.fromEntries(locales.map((l) => [l, attributePath(l, category, city.slug, key)]))
      ),
      title: { absolute: ta.metaTitle(where) },
      description: ta.metaDescription(count, where),
      robots: count < minToIndex(key) ? { index: false, follow: true } : undefined,
      ...socialMeta({
        title: ta.metaTitle(where),
        description: ta.metaDescription(count, where),
        path: attributePath(locale, category, city.slug, key),
        locale,
        image: { title: ta.h1(where), category },
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
  if (resolved.prices) {
    return <PriceOverviewPage locale={resolved.locale} category={resolved.category} city={resolved.city} />;
  }

  const { animal, near, sort, rating, open } = await searchParams;
  const { locale, category, city } = resolved;

  return (
    <CategoryListing
      locale={locale}
      category={category}
      city={city}
      districtSlug={resolved.attribute ? undefined : resolved.districtSlug}
      districtName={resolved.attribute ? undefined : resolved.district.name}
      districtInPhrases={resolved.attribute ? undefined : resolved.district.inPhrases}
      attributePage={resolved.attribute ?? undefined}
      open={open}
      animal={animal}
      near={near}
      sort={sort}
      rating={rating}
    />
  );
}
