import type { BusinessCategory } from "@prisma/client";
import type { Locale } from "./locales";
import { listingPath } from "./categories";
import { SERVICES } from "./services";
import { getMarketPrices, getServicePriceRows, type ServicePriceRow } from "./data";
import { formatDate, getDictionary } from "./i18n";
import type { MarketPrice } from "./priceMarket";

// Price pages (owner, 2026-09-25; docs/seo/README.md, "Страницы цен"):
//   /<category>/<city>/prices/            what each service costs in the city
//   /<category>/<city>/prices/<service>/  one service, every place compared
// The "prices" segment sits in the district slot, like "nonstop"; no
// district may use it.
export const PRICES_SEGMENT: Record<Locale, string> = { en: "prices", sk: "ceny" };

/** URL slug per service code and language - written by hand, as people
 *  search it ("kastracia-kocura"), not generated from labels. */
const SERVICE_SLUGS: Partial<Record<BusinessCategory, Record<string, Record<Locale, string>>>> = {
  GROOMING: {
    full_groom: { en: "full-grooming", sk: "kompletna-uprava" },
    bath_dry: { en: "bath-and-blow-dry", sk: "kupanie-a-fenovanie" },
    hand_stripping: { en: "hand-stripping", sk: "trimovanie" },
    deshedding: { en: "de-shedding", sk: "vycesavanie-podsady" },
    nail_trim: { en: "nail-trim", sk: "strihanie-pazurikov" },
    cat_groom: { en: "cat-grooming", sk: "uprava-macky" },
  },
  VET_CLINIC: {
    exam: { en: "check-up", sk: "vysetrenie" },
    vaccination_dog: { en: "dog-vaccination", sk: "ockovanie-psa" },
    microchip: { en: "microchip", sk: "cipovanie" },
    neuter_cat: { en: "cat-neutering", sk: "kastracia-kocura" },
    spay_cat: { en: "cat-spaying", sk: "kastracia-macky" },
    spay_dog: { en: "dog-spaying", sk: "kastracia-suky" },
  },
  PET_HOTEL: {
    dog_night: { en: "dog-per-night", sk: "pes-noc" },
    cat_night: { en: "cat-per-night", sk: "macka-noc" },
    daycare_day: { en: "dog-daycare", sk: "psia-skolka" },
    daycare_pass: { en: "daycare-pass", sk: "permanentka-do-skolky" },
    pickup: { en: "pick-up-and-drop-off", sk: "dovoz-a-odvoz" },
    extra_walk: { en: "extra-walk", sk: "vencenie-navyse" },
  },
  DOG_TRAINING: {
    puppy_course: { en: "puppy-course", sk: "stenacia-skolka" },
    obedience_course: { en: "obedience-course", sk: "kurz-poslusnosti" },
    group_lesson: { en: "group-lesson", sk: "skupinova-hodina" },
    private_lesson: { en: "private-lesson", sk: "individualna-hodina" },
    behavior_consult: { en: "behaviour-consultation", sk: "konzultacia-spravania" },
    membership: { en: "club-membership", sk: "clensky-poplatok" },
  },
  PET_SITTING: {
    walk_30: { en: "dog-walk-30-min", sk: "vencenie-30-min" },
    walk_60: { en: "dog-walk-60-min", sk: "vencenie-60-min" },
    cat_visit: { en: "cat-visit", sk: "navsteva-macky" },
    house_sitting_night: { en: "overnight-at-your-home", sk: "strazenie-u-vas-doma" },
    boarding_night: { en: "overnight-at-sitters-home", sk: "strazenie-u-opatrovatela" },
    daycare_day: { en: "day-care", sk: "denne-strazenie" },
  },
};

export function serviceSlugFor(category: BusinessCategory, code: string, locale: Locale): string | null {
  return SERVICE_SLUGS[category]?.[code]?.[locale] ?? null;
}

export function serviceCodeFromSlug(category: BusinessCategory, slug: string, locale: Locale): string | null {
  const entry = Object.entries(SERVICE_SLUGS[category] ?? {}).find(([, slugs]) => slugs[locale] === slug);
  return entry && SERVICES[category]?.some((s) => s.code === entry[0]) ? entry[0] : null;
}

/** /vet-clinics/bratislava/prices/ or, with a code, /…/prices/cat-neutering/. */
export function pricesPath(locale: Locale, category: BusinessCategory, citySlug: string, code?: string): string {
  const base = listingPath(locale, category, citySlug, PRICES_SEGMENT[locale]);
  if (!code) return base;
  const slug = serviceSlugFor(category, code, locale);
  return slug ? `${base}${slug}/` : base;
}

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

