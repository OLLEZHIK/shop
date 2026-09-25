import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryFromSlug } from "@/lib/categories";
import { getCityBySlug } from "@/lib/data";
import { getDictionary, inCity, isLocale, localesForCity } from "@/lib/i18n";
import { PRICES_SEGMENT, answerText, getPriceSummary, pricesPath, serviceCodeFromSlug } from "@/lib/pricePages";
import { MIN_PLACES } from "@/lib/priceMarket";
import { serviceLabel } from "@/lib/services";
import { localeAlternates, socialMeta } from "@/lib/seo";
import { ServicePricePage } from "@/components/PricePages";

// /<category>/<city>/prices/<service>/ - what one service costs in one
// city (lib/pricePages.ts). Exists while at least one place publishes the
// price; indexed from MIN_PLACES comparable prices (docs/seo/README.md).

interface PageParams {
  lang: string;
  category: string;
  city: string;
  district: string;
  service: string;
}

async function resolve(params: Promise<PageParams>) {
  const { lang, category: slug, city: citySlug, district: segment, service: serviceSlug } = await params;
  if (!isLocale(lang) || segment !== PRICES_SEGMENT[lang]) return null;
  const category = categoryFromSlug(slug, lang);
  if (!category) return null;
  const code = serviceCodeFromSlug(category, serviceSlug, lang);
  if (!code) return null;
  const city = await getCityBySlug(citySlug);
  if (!city || !localesForCity(city).includes(lang)) return null;
  const summary = await getPriceSummary(category, citySlug, code);
  if (summary.rows.length === 0) return null;
  return { locale: lang, category, city, code, summary };
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { locale, category, city, code, summary } = resolved;
  const tp = getDictionary(locale).prices;
  const where = inCity(locale, city);
  const service = serviceLabel(category, code, locale);
  const market = summary.market;
  const from = market
    ? new Intl.NumberFormat(locale, { style: "currency", currency: market.currency, maximumFractionDigits: Number.isInteger(market.min) ? 0 : 2 }).format(market.min)
    : null;
  const title = from ? tp.serviceMetaTitle(service, where, from) : `${tp.serviceH1(service, where)} | Pawenn`;
  const description = answerText(locale, summary) ?? tp.fewPlaces(summary.rows.length);
  const path = pricesPath(locale, category, city.slug, code);
  return {
    title: { absolute: title },
    description,
    alternates: localeAlternates(
      locale,
      Object.fromEntries(localesForCity(city).map((l) => [l, pricesPath(l, category, city.slug, code)]))
    ),
    robots: !market || market.places < MIN_PLACES ? { index: false, follow: true } : undefined,
    ...socialMeta({ title, description, path, locale, image: { title: tp.serviceH1(service, where), subtitle: description.split(". ")[0], category } }),
  };
}

export default async function ServicePrices({ params }: { params: Promise<PageParams> }) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  return <ServicePricePage locale={resolved.locale} category={resolved.category} city={resolved.city} code={resolved.code} />;
}
