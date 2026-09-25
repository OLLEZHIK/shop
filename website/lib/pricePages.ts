import type { BusinessCategory } from "@prisma/client";
import type { Locale } from "./locales";
import { getMarketPrices, getServicePriceRows, type ServicePriceRow } from "./data";
import { formatDate, getDictionary } from "./i18n";
import type { MarketPrice } from "./priceMarket";

// Price pages: data-backed summary. URLs and slugs (no database, safe for
// client components) live in lib/priceSlugs.ts and are re-exported here.
export { PRICES_SEGMENT, pricesPath, serviceCodeFromSlug, serviceSlugFor } from "./priceSlugs";

export function money(value: number, currency: string, locale: Locale): string {
  const digits = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export const comparable = (r: ServicePriceRow) => !r.partial && r.unit === null && !r.note;

export interface PriceSummary {
  market: MarketPrice | undefined;
  rows: ServicePriceRow[];
  checked: Date | null;
}

export async function getPriceSummary(category: BusinessCategory, citySlug: string, code: string): Promise<PriceSummary> {
  const [market, rows] = await Promise.all([
    getMarketPrices(category, citySlug).then((m) => m.get(code)),
    getServicePriceRows(category, citySlug, code),
  ]);
  const dates = rows.filter(comparable).map((r) => r.observedAt.getTime());
  return { market, rows, checked: dates.length ? new Date(Math.max(...dates)) : null };
}

/** "Costs from 70 € to 150 €, median 79 €. We compared 8 places…" */
export function answerText(locale: Locale, summary: PriceSummary): string | null {
  const { market, checked } = summary;
  if (!market || !checked) return null;
  const t = getDictionary(locale).prices;
  return t.answer(
    money(market.min, market.currency, locale),
    money(market.max, market.currency, locale),
    money(market.median, market.currency, locale),
    market.places,
    formatDate(checked, locale)
  );
}

