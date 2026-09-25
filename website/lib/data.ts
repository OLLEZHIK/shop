import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import type { Business, BusinessCategory, District, City } from "@prisma/client";
import { CATEGORY_LABELS, categorySlugFromEnum } from "./categories";
import type { Locale } from "./i18n";
import { SERVICES } from "./services";
import { CATEGORY_ATTRIBUTES, hasAttribute, type AttributeKey } from "./attributePages";
import { marketPrices, priceLevels, type ComparablePrice, type MarketPrice, type PriceLevel } from "./priceMarket";

export type BusinessWithRelations = Business & {
  district: (District & { city: City }) | null;
  city: City | null;
  priceItems: {
    id: number;
    priceFrom: unknown;
    priceTo: unknown;
    currency: string;
    sizeClass: string | null;
    weightFromKg: number | null;
    weightToKg: number | null;
    sourceUrl: string;
    observedAt: Date;
    unit: string | null;
    partial: boolean;
    note: string | null;
    noteLocal: string | null;
    service: { code: string | null };
  }[];
  reviews: { id: number; rating: number; authorName: string; comment: string; createdAt: Date }[];
};

// Only whole-service prices are compared (ranges, market, tiers): not per
// hour or per km, not partial ones like surgery without anaesthesia, and
// not ones that include more than the standard (a `note` such as "incl.
// hospitalisation") - docs/card-spec.md, "Цены".
const COMPARABLE_PRICE = { partial: false, unit: null, note: null } as const;

const PUBLISHED_REVIEWS = { where: { status: "PUBLISHED" as const } };

const BUSINESS_INCLUDE = {
  district: { include: { city: true } },
  city: true,
  priceItems: { include: { service: { select: { code: true } } } },
  reviews: PUBLISHED_REVIEWS,
} as const;

export interface BusinessFilters {
  /** Left out: every service in the city (the city page). */
  category?: BusinessCategory;
  citySlug: string;
  districtSlug?: string;
  animal?: string;
}

// Deterministic pseudo-random order, stable within a day (changes daily) so
// SSG/ISR doesn't reshuffle the list on every regeneration.
function dailySeed(): number {
  const d = new Date();
  return d.getUTCFullYear() * 10000 + d.getUTCMonth() * 100 + d.getUTCDate();
}

function seededHash(id: number, seed: number): number {
  let h = (id * 2654435761 + seed * 40503) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

export function shuffleDeterministically<T extends { id: number }>(items: T[]): T[] {
  const seed = dailySeed();
  return [...items].sort((a, b) => seededHash(a.id, seed) - seededHash(b.id, seed));
}

export function averageRating(reviews: { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// `Business.notes` is data-collection metadata (in a mix of English and
// Slovak - e.g. "email not listed on website, call instead"), not a
// business description written for visitors - confirmed by inspecting
// the actual seeded data (36/76 rows literally read "docs/concept.md
// absent; district omitted per instructions", a leftover from the
// district-backfill task). Filters out the unambiguous internal-artifact
// pattern before using notes as a public short description anywhere
// (BusinessCard, business detail page) - doesn't attempt to translate or
// rewrite the rest, just avoids showing obvious internal boilerplate.
// Visitor-facing texts. `notes` is the collectors' internal field and is
// never shown. On a local-language page only local text is used (no
// English fallback); on English pages English first, local as fallback
// (docs/design-plan.md §2.2, language model).
type BusinessTexts = Pick<
  BusinessWithRelations,
  "description" | "descriptionLocal" | "shortDescription" | "shortDescriptionLocal"
>;

export function cardDescription(b: BusinessTexts, locale: Locale): string | null {
  return locale === "en" ? (b.shortDescription ?? b.shortDescriptionLocal) : b.shortDescriptionLocal;
}

export function aboutDescription(b: BusinessTexts, locale: Locale): string | null {
  return locale === "en"
    ? (b.description ?? b.shortDescription ?? b.descriptionLocal ?? b.shortDescriptionLocal)
    : (b.descriptionLocal ?? b.shortDescriptionLocal);
}

export function logoUrl(logoFile: string | null): string | null {
  return logoFile ? `/logos/${logoFile}` : null;
}

/** Business filter for "in this city" (every seeded place has cityId). */
function inCityWhere(citySlug: string) {
  return { city: { is: { slug: citySlug } } };
}

/** District filter scoped to its city: district slugs repeat across cities. */
function inDistrictWhere(citySlug: string, districtSlug: string) {
  return { district: { is: { slug: districtSlug, city: { slug: citySlug } } } };
}

async function getCityBySlugRaw(slug: string) {
  return prisma.city.findUnique({ where: { slug } });
}

async function getAllCitiesRaw() {
  return prisma.city.findMany();
}

// The city the site opens with (homepage, header, footer): the first one
// added. Every other page works on the city in its URL; see
// docs/architecture/multi-city.md.
async function getDefaultCityRaw() {
  return prisma.city.findFirst({ orderBy: { id: "asc" } });
}

async function getDistrictBySlugRaw(citySlug: string, slug: string) {
  return prisma.district.findFirst({ where: { slug, city: { slug: citySlug } }, include: { city: true } });
}

// Real listing counts per district, optionally scoped to one category -
// used to surface genuinely popular districts (most businesses) instead of
// a made-up "popular searches" list.
async function getDistrictCountsRaw(
  citySlug: string,
  category?: BusinessCategory
): Promise<{ slug: string; name: string; count: number }[]> {
  // One query + an in-memory tally (was one count query per district).
  const [districts, rows] = await Promise.all([
    prisma.district.findMany({ where: { city: { slug: citySlug } } }),
    prisma.business.findMany({
      where: {
        status: "PUBLISHED",
        districtId: { not: null },
        ...inCityWhere(citySlug),
        ...(category ? { category } : {}),
      },
      select: { districtId: true },
    }),
  ]);
  const tally = new Map<number, number>();
  for (const r of rows) if (r.districtId !== null) tally.set(r.districtId, (tally.get(r.districtId) ?? 0) + 1);
  return districts
    .map((d) => ({ slug: d.slug, name: d.name, count: tally.get(d.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

const ALL_BUSINESS_CATEGORIES: BusinessCategory[] = [
  "GROOMING",
  "VET_CLINIC",
  "PET_HOTEL",
  "PET_SHOP",
  "DOG_TRAINING",
  "PET_SITTING",
];

async function getAllDistrictsRaw() {
  return prisma.district.findMany({ orderBy: { name: "asc" } });
}

async function searchBusinessesRaw(filters: BusinessFilters): Promise<BusinessWithRelations[]> {
  const where = {
    status: "PUBLISHED" as const,
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.animal ? { animals: { has: filters.animal } } : {}),
    ...(filters.districtSlug ? inDistrictWhere(filters.citySlug, filters.districtSlug) : inCityWhere(filters.citySlug)),
  };

  const businesses = await prisma.business.findMany({
    where,
    include: BUSINESS_INCLUDE,
  });

  return shuffleDeterministically(businesses) as BusinessWithRelations[];
}

// verifiedAt is the latest date anything on the place page was checked
// (manual verification, hours, rating, prices): the sitemap's lastmod
// (SEO audit T03), never "today" for everything.
async function getAllPublishedBusinessSlugsRaw(): Promise<
  { slug: string; verifiedAt: Date | null; city: { country: string; locales: string[] } | null }[]
> {
  const rows = await prisma.business.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      verifiedAt: true,
      hoursObservedAt: true,
      ratingObservedAt: true,
      priceItems: { select: { observedAt: true }, orderBy: { observedAt: "desc" }, take: 1 },
      city: { select: { country: true, locales: true } },
    },
  });
  return rows.map((r) => {
    const dates = [r.verifiedAt, r.hoursObservedAt, r.ratingObservedAt, r.priceItems[0]?.observedAt].filter(
      (d): d is Date => d instanceof Date
    );
    const latest = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
    return { slug: r.slug, verifiedAt: latest, city: r.city };
  });
}

async function getFeaturedBusinessesRaw(citySlug: string, limit = 4): Promise<BusinessWithRelations[]> {
  const businesses = await prisma.business.findMany({
    where: { status: "PUBLISHED", featured: true, ...inCityWhere(citySlug) },
    include: BUSINESS_INCLUDE,
    take: limit,
  });
  return businesses as BusinessWithRelations[];
}

async function getBusinessBySlugRaw(slug: string): Promise<BusinessWithRelations | null> {
  return prisma.business.findUnique({
    where: { slug },
    include: BUSINESS_INCLUDE,
  }) as Promise<BusinessWithRelations | null>;
}

async function getBusinessCountRaw(citySlug: string): Promise<{ total: number; byCategory: Record<string, number> }> {
  const rows = await prisma.business.findMany({
    where: { status: "PUBLISHED", ...inCityWhere(citySlug) },
    select: { category: true },
  });
  const byCategory: Record<string, number> = {};
  for (const category of ALL_BUSINESS_CATEGORIES) byCategory[category] = 0;
  for (const r of rows) byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  return { total: rows.length, byCategory };
}

export interface CategoryAggregates {
  count: number;
  verifiedCount: number;
  priceFrom: number | null;
  priceTo: number | null;
  currency: string;
}

// Price range and € tiers compare like with like: only the category's
// headline service (full grooming, check-up, dog night...). No main
// service (pet shops) -> no prices.
function mainServiceCode(category: BusinessCategory): string {
  return SERVICES[category]?.[0]?.code ?? "__none__";
}

async function getCategoryAggregatesRaw(
  category: BusinessCategory,
  citySlug: string,
  districtSlug?: string
): Promise<CategoryAggregates> {
  const where = {
    status: "PUBLISHED" as const,
    category,
    ...(districtSlug ? inDistrictWhere(citySlug, districtSlug) : inCityWhere(citySlug)),
  };

  const [count, verifiedCount, priceItems] = await Promise.all([
    prisma.business.count({ where }),
    prisma.business.count({ where: { ...where, verifiedAt: { not: null } } }),
    prisma.priceItem.findMany({
      where: { business: where, service: { code: mainServiceCode(category) }, ...COMPARABLE_PRICE },
      select: { priceFrom: true, priceTo: true, currency: true },
    }),
  ]);

  if (priceItems.length === 0) {
    return { count, verifiedCount, priceFrom: null, priceTo: null, currency: "EUR" };
  }

  const froms = priceItems.map((p) => Number(p.priceFrom));
  const tos = priceItems.map((p) => Number(p.priceTo ?? p.priceFrom));
  return {
    count,
    verifiedCount,
    priceFrom: Math.min(...froms),
    priceTo: Math.max(...tos),
    currency: priceItems[0].currency,
  };
}

// Prices against the city market: market price per service (median of
// places) and each place's level, "+40 % above market" and 1-5 € signs.
// Logic and thresholds: lib/priceMarket.ts, docs/card-spec.md
// ("Сравнение с рынком города"). All 6 services of the category count,
// not only the headline one.
async function getPriceMarketRaw(
  category: BusinessCategory,
  citySlug: string
): Promise<{ market: [string, MarketPrice][]; levels: [number, PriceLevel][] }> {
  const items = await prisma.priceItem.findMany({
    where: {
      business: { category, status: "PUBLISHED", ...inCityWhere(citySlug) },
      service: { code: { in: (SERVICES[category] ?? []).map((s) => s.code) } },
      ...COMPARABLE_PRICE,
    },
    select: { businessId: true, priceFrom: true, currency: true, service: { select: { code: true } } },
  });
  const prices: ComparablePrice[] = items
    .filter((i) => i.service.code)
    .map((i) => ({ businessId: i.businessId, code: i.service.code!, priceFrom: Number(i.priceFrom), currency: i.currency }));
  return { market: [...marketPrices(prices)], levels: [...priceLevels(prices)] };
}

export interface ServicePriceRow {
  priceFrom: number;
  priceTo: number | null;
  currency: string;
  weightFromKg: number | null;
  weightToKg: number | null;
  unit: string | null;
  partial: boolean;
  note: string | null;
  noteLocal: string | null;
  observedAt: Date;
  sourceUrl: string;
  business: { id: number; name: string; slug: string; phone: string | null; districtName: string | null };
}

// Every published price of one service in one city, with its place -
// the price page of that service (lib/pricePages.ts). Comparable or not:
// the page shows all, compares only whole-service prices.
async function getServicePriceRowsRaw(category: BusinessCategory, citySlug: string, code: string): Promise<ServicePriceRow[]> {
  const items = await prisma.priceItem.findMany({
    where: {
      business: { category, status: "PUBLISHED", ...inCityWhere(citySlug) },
      service: { code },
    },
    select: {
      priceFrom: true,
      priceTo: true,
      currency: true,
      weightFromKg: true,
      weightToKg: true,
      unit: true,
      partial: true,
      note: true,
      noteLocal: true,
      observedAt: true,
      sourceUrl: true,
      business: { select: { id: true, name: true, slug: true, phone: true, district: { select: { name: true } } } },
    },
  });
  return items.map((i) => ({
    priceFrom: Number(i.priceFrom),
    priceTo: i.priceTo === null ? null : Number(i.priceTo),
    currency: i.currency,
    weightFromKg: i.weightFromKg === null ? null : Number(i.weightFromKg),
    weightToKg: i.weightToKg === null ? null : Number(i.weightToKg),
    unit: i.unit,
    partial: i.partial,
    note: i.note,
    noteLocal: i.noteLocal,
    observedAt: i.observedAt,
    sourceUrl: i.sourceUrl,
    business: {
      id: i.business.id,
      name: i.business.name,
      slug: i.business.slug,
      phone: i.business.phone,
      districtName: i.business.district?.name ?? null,
    },
  }));
}

// How many places in the city have each attribute of the category (lib/
// attributePages.ts): whether a page exists, is indexed, gets a chip.
async function getAttributeCountsRaw(category: BusinessCategory, citySlug: string): Promise<[AttributeKey, number][]> {
  const keys = CATEGORY_ATTRIBUTES[category] ?? [];
  if (keys.length === 0) return [];
  const places = await searchBusinessesRaw({ category, citySlug });
  return keys.map((key) => [key, places.filter((b) => hasAttribute(b, key)).length]);
}

export interface DistrictSummary {
  slug: string;
  name: string;
  total: number;
  byCategory: { categorySlug: string; categoryLabel: string; category: BusinessCategory; count: number }[];
}

// Per-district, per-category listing counts for the homepage
// "Explore by district" block - real counts only, tallied from one
// lightweight select (a few dozen rows; groupBy doesn't type-check
// through the Accelerate extension). Districts with no listings are
// dropped; categories within a district are ranked by count.
async function getDistrictSummariesRaw(citySlug: string): Promise<DistrictSummary[]> {
  const [districts, rows] = await Promise.all([
    prisma.district.findMany({ where: { city: { slug: citySlug } } }),
    prisma.business.findMany({
      where: { status: "PUBLISHED", districtId: { not: null }, ...inCityWhere(citySlug) },
      select: { districtId: true, category: true },
    }),
  ]);

  return districts
    .map((d) => {
      const tally = new Map<BusinessCategory, number>();
      for (const row of rows) {
        if (row.districtId === d.id) tally.set(row.category, (tally.get(row.category) ?? 0) + 1);
      }
      const byCategory = [...tally.entries()]
        .map(([category, count]) => ({
          category,
          categorySlug: categorySlugFromEnum(category),
          categoryLabel: CATEGORY_LABELS[category],
          count,
        }))
        .sort((a, b) => b.count - a.count);
      return {
        slug: d.slug,
        name: d.name,
        total: byCategory.reduce((acc, c) => acc + c.count, 0),
        byCategory,
      };
    })
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);
}

export interface CityPoint {
  slug: string;
  name: string;
  lat: number;
  lng: number;
}

// City centres for "Near me" (nearest covered city) and the search's
// city suggestions.
async function getCityPointsRaw(): Promise<CityPoint[]> {
  const [cities, rows] = await Promise.all([
    prisma.city.findMany({ orderBy: { id: "asc" } }),
    prisma.business.findMany({
      where: { status: "PUBLISHED", lat: { not: null }, lng: { not: null }, cityId: { not: null } },
      select: { lat: true, lng: true, cityId: true },
    }),
  ]);
  return cities.flatMap((city) => {
    // city.json centre first; else the mean of the city's geocoded places.
    if (city.lat !== null && city.lng !== null) return [{ slug: city.slug, name: city.name, lat: city.lat, lng: city.lng }];
    const points = rows.filter((r) => r.cityId === city.id);
    if (points.length === 0) return [];
    return [
      {
        slug: city.slug,
        name: city.name,
        lat: points.reduce((acc, p) => acc + (p.lat ?? 0), 0) / points.length,
        lng: points.reduce((acc, p) => acc + (p.lng ?? 0), 0) / points.length,
      },
    ];
  });
}

export { distanceKmClient as distanceKm } from "./geo";

/** Parse a "lat,lng" query value; null if malformed or out of range. */
export function parseNear(value: string | undefined): { lat: number; lng: number } | null {
  if (!value) return null;
  const [lat, lng] = value.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

// ---------------------------------------------------------------------
// Cached public API. Every page render used to hit the database directly
// (~35 operations for one listing page); on Prisma Postgres' metered
// plan that burned the monthly quota and took the listing pages down
// (P6003, 2026-09-24). Results are cached for a day across requests
// and deployments; the data only changes when the CSV seed is re-run.
// unstable_cache stores JSON, so Dates come back as strings and are
// revived below; Decimal prices come back as strings (read via
// Number()/String() everywhere already).
// ---------------------------------------------------------------------
const REVALIDATE_SECONDS = 24 * 60 * 60;
// The data cache outlives deployments, so without this a deploy that
// adds columns or reseeds the CSVs would keep serving day-old objects.
// Scoping keys to the deployment starts every deploy with a fresh cache.
const CACHE_VERSION = process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "local";

function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) {
  return unstable_cache(fn, ["db", CACHE_VERSION, key], { revalidate: REVALIDATE_SECONDS, tags: ["db"] });
}

function toDate(value: Date | string | null): Date | null {
  return value === null ? null : new Date(value);
}

function reviveBusiness(b: BusinessWithRelations): BusinessWithRelations {
  return {
    ...b,
    verifiedAt: toDate(b.verifiedAt),
    ratingObservedAt: toDate(b.ratingObservedAt),
    hoursObservedAt: toDate(b.hoursObservedAt),
    priceItems: b.priceItems.map((p) => ({ ...p, observedAt: new Date(p.observedAt) })),
    reviews: b.reviews.map((r) => ({ ...r, createdAt: new Date(r.createdAt) })),
  };
}


// Pets that at least one place in the category says it serves: the pet
// filter hides the others (animals are no longer collected, so a pet with
// no confirmed place would only ever show an empty list).
async function getAnimalsInCategoryRaw(category: BusinessCategory, citySlug: string): Promise<string[]> {
  const rows = await prisma.business.findMany({
    where: { status: "PUBLISHED", category, ...inCityWhere(citySlug) },
    select: { animals: true },
  });
  return [...new Set(rows.flatMap((r) => r.animals))];
}

export const getCityBySlug = cached(getCityBySlugRaw, "getCityBySlug");
export const getAnimalsInCategory = cached(getAnimalsInCategoryRaw, "getAnimalsInCategory");
export const getAllCities = cached(getAllCitiesRaw, "getAllCities");
export const getDefaultCity = cached(getDefaultCityRaw, "getDefaultCity");
export const getDistrictBySlug = cached(getDistrictBySlugRaw, "getDistrictBySlug");
export const getDistrictCounts = cached(getDistrictCountsRaw, "getDistrictCounts");
export const getAllDistricts = cached(getAllDistrictsRaw, "getAllDistricts");
export const getBusinessCount = cached(getBusinessCountRaw, "getBusinessCount");
export const getCategoryAggregates = cached(getCategoryAggregatesRaw, "getCategoryAggregates");
export const getDistrictSummaries = cached(getDistrictSummariesRaw, "getDistrictSummaries");
export const getCityPoints = cached(getCityPointsRaw, "getCityPoints");

const searchBusinessesCached = cached(searchBusinessesRaw, "searchBusinesses");
export async function searchBusinesses(filters: BusinessFilters): Promise<BusinessWithRelations[]> {
  return (await searchBusinessesCached(filters)).map(reviveBusiness);
}

const getFeaturedBusinessesCached = cached(getFeaturedBusinessesRaw, "getFeaturedBusinesses");
export async function getFeaturedBusinesses(citySlug: string, limit = 4): Promise<BusinessWithRelations[]> {
  return (await getFeaturedBusinessesCached(citySlug, limit)).map(reviveBusiness);
}

const getBusinessBySlugCached = cached(getBusinessBySlugRaw, "getBusinessBySlug");
export async function getBusinessBySlug(slug: string): Promise<BusinessWithRelations | null> {
  const business = await getBusinessBySlugCached(slug);
  return business ? reviveBusiness(business) : null;
}

const getAllPublishedBusinessSlugsCached = cached(getAllPublishedBusinessSlugsRaw, "getAllPublishedBusinessSlugs");
export async function getAllPublishedBusinessSlugs() {
  return (await getAllPublishedBusinessSlugsCached()).map((b) => ({ ...b, verifiedAt: toDate(b.verifiedAt) }));
}

const getPriceMarketCached = cached(getPriceMarketRaw, "getPriceMarket");
/** Price level per place against the city market (only places with a comparable price). */
export async function getPriceTierMap(category: BusinessCategory, citySlug: string): Promise<Map<number, PriceLevel>> {
  return new Map((await getPriceMarketCached(category, citySlug)).levels);
}
/** Market price per service code in the city (only services with enough places). */
export async function getMarketPrices(category: BusinessCategory, citySlug: string): Promise<Map<string, MarketPrice>> {
  return new Map((await getPriceMarketCached(category, citySlug)).market);
}

const getServicePriceRowsCached = cached(getServicePriceRowsRaw, "getServicePriceRows");
export async function getServicePriceRows(category: BusinessCategory, citySlug: string, code: string): Promise<ServicePriceRow[]> {
  return (await getServicePriceRowsCached(category, citySlug, code)).map((r) => ({ ...r, observedAt: new Date(r.observedAt) }));
}

const getAttributeCountsCached = cached(getAttributeCountsRaw, "getAttributeCounts");
/** Places per attribute page of the category in the city (0 = no page). */
export async function getAttributeCounts(category: BusinessCategory, citySlug: string): Promise<Map<AttributeKey, number>> {
  return new Map(await getAttributeCountsCached(category, citySlug));
}
