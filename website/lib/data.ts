import { prisma } from "./prisma";
import type { Business, BusinessCategory, District, City } from "@prisma/client";
import { CATEGORY_LABELS, categorySlugFromEnum } from "./categories";

export type BusinessWithRelations = Business & {
  district: (District & { city: City }) | null;
  priceItems: {
    id: number;
    priceFrom: unknown;
    priceTo: unknown;
    currency: string;
    sizeClass: string | null;
  }[];
  reviews: { id: number; rating: number; authorName: string; comment: string; createdAt: Date }[];
};

const PUBLISHED_REVIEWS = { where: { status: "PUBLISHED" as const } };

const BUSINESS_INCLUDE = {
  district: { include: { city: true } },
  priceItems: true,
  reviews: PUBLISHED_REVIEWS,
} as const;

export interface BusinessFilters {
  category: BusinessCategory;
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
const INTERNAL_NOTE_PATTERN = /docs\/concept\.md|per instructions|district omitted|district neur/i;

export function publicDescription(notes: string | null): string | null {
  if (!notes) return null;
  if (INTERNAL_NOTE_PATTERN.test(notes)) return null;
  return notes;
}

export async function getCityBySlug(slug: string) {
  return prisma.city.findUnique({ where: { slug } });
}

export async function getAllCities() {
  return prisma.city.findMany();
}

// Single source for "the city to link to" across Header/Footer/homepage
// search, instead of each caller hardcoding "bratislava" - see
// docs/design-plan.md 2.2. With one city this is just the first row;
// once a second city exists, this call site is where routing/geo-IP
// logic for picking a default would go.
export async function getDefaultCity() {
  return prisma.city.findFirst({ orderBy: { id: "asc" } });
}

export async function getDistrictBySlug(slug: string) {
  return prisma.district.findUnique({ where: { slug }, include: { city: true } });
}

// Real listing counts per district, optionally scoped to one category -
// used to surface genuinely popular districts (most businesses) instead of
// a made-up "popular searches" list.
export async function getDistrictCounts(
  category?: BusinessCategory
): Promise<{ slug: string; name: string; count: number }[]> {
  const districts = await prisma.district.findMany();
  const counts = await Promise.all(
    districts.map((d) =>
      prisma.business.count({
        where: {
          status: "PUBLISHED",
          districtId: d.id,
          ...(category ? { category } : {}),
        },
      })
    )
  );
  return districts
    .map((d, i) => ({ slug: d.slug, name: d.name, count: counts[i] }))
    .sort((a, b) => b.count - a.count);
}

export interface PopularNearby {
  districtSlug: string;
  districtName: string;
  categorySlug: string;
  categoryLabel: string;
  count: number;
}

const ALL_BUSINESS_CATEGORIES: BusinessCategory[] = [
  "GROOMING",
  "VET_CLINIC",
  "PET_HOTEL",
  "PET_SHOP",
  "DOG_TRAINING",
  "PET_SITTING",
];

// "Popular nearby" for the homepage: real top districts by listing
// count, each paired with its single most-listed category there - not
// geolocation-based (see tasks/cli-redesign-homepage.md), just what
// the data actually shows for the default city.
export async function getPopularNearby(limit = 4): Promise<PopularNearby[]> {
  const topDistricts = (await getDistrictCounts()).filter((d) => d.count > 0).slice(0, limit);

  // Sequential, not Promise.all: each district picks its best category
  // that a higher-ranked district hasn't already claimed, so the grid
  // doesn't just repeat "Veterinary Clinics" four times - still real
  // per-district counts, just diversified in the order districts are
  // considered rather than picking the literal global max every time.
  const usedCategories = new Set<BusinessCategory>();
  const results: PopularNearby[] = [];

  for (const district of topDistricts) {
    const counts = await Promise.all(
      ALL_BUSINESS_CATEGORIES.map((category) =>
        prisma.business.count({
          where: { status: "PUBLISHED", category, district: { is: { slug: district.slug } } },
        })
      )
    );
    const ranked = ALL_BUSINESS_CATEGORIES.map((category, i) => ({ category, count: counts[i] }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    const pick = ranked.find((c) => !usedCategories.has(c.category)) ?? ranked[0];
    if (!pick) continue;

    usedCategories.add(pick.category);
    results.push({
      districtSlug: district.slug,
      districtName: district.name,
      categorySlug: categorySlugFromEnum(pick.category),
      categoryLabel: CATEGORY_LABELS[pick.category],
      count: pick.count,
    });
  }

  return results;
}

export async function getAllDistricts() {
  return prisma.district.findMany({ orderBy: { name: "asc" } });
}

// City-level listing intentionally does NOT join-filter by city: the schema
// only ties a Business to a city indirectly via District, and district is
// nullable (some addresses have no resolved district yet). With a single
// city (Bratislava) that's a no-op; once a second city exists, businesses
// with a null district would need their own direct city reference to be
// placed correctly - flagged as an open question in PR #28, not solved here
// (out of this task's scope). The caller is still responsible for checking
// the city slug resolves to a real City (see getCityBySlug) before calling
// this, to 404 on typos.
export async function searchBusinesses(filters: BusinessFilters): Promise<BusinessWithRelations[]> {
  const where = {
    status: "PUBLISHED" as const,
    category: filters.category,
    ...(filters.animal ? { animals: { has: filters.animal } } : {}),
    ...(filters.districtSlug ? { district: { is: { slug: filters.districtSlug } } } : {}),
  };

  const businesses = await prisma.business.findMany({
    where,
    include: BUSINESS_INCLUDE,
  });

  return shuffleDeterministically(businesses) as BusinessWithRelations[];
}

export async function getAllPublishedBusinessSlugs(): Promise<{ slug: string; verifiedAt: Date | null }[]> {
  return prisma.business.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, verifiedAt: true },
  });
}

export async function getFeaturedBusinesses(limit = 4): Promise<BusinessWithRelations[]> {
  const businesses = await prisma.business.findMany({
    where: { status: "PUBLISHED", featured: true },
    include: BUSINESS_INCLUDE,
    take: limit,
  });
  return businesses as BusinessWithRelations[];
}

export async function getBusinessBySlug(slug: string): Promise<BusinessWithRelations | null> {
  return prisma.business.findUnique({
    where: { slug },
    include: BUSINESS_INCLUDE,
  }) as Promise<BusinessWithRelations | null>;
}

export async function getBusinessCount(): Promise<{ total: number; byCategory: Record<string, number> }> {
  const categories: BusinessCategory[] = [
    "GROOMING",
    "VET_CLINIC",
    "PET_HOTEL",
    "PET_SHOP",
    "DOG_TRAINING",
    "PET_SITTING",
  ];

  const counts = await Promise.all(
    categories.map((category) =>
      prisma.business.count({ where: { status: "PUBLISHED", category } })
    )
  );

  const byCategory: Record<string, number> = {};
  let total = 0;
  categories.forEach((category, i) => {
    byCategory[category] = counts[i];
    total += counts[i];
  });
  return { total, byCategory };
}

export interface CategoryAggregates {
  count: number;
  verifiedCount: number;
  priceFrom: number | null;
  priceTo: number | null;
  currency: string;
}

export async function getCategoryAggregates(
  category: BusinessCategory,
  districtSlug?: string
): Promise<CategoryAggregates> {
  const where = {
    status: "PUBLISHED" as const,
    category,
    ...(districtSlug ? { district: { is: { slug: districtSlug } } } : {}),
  };

  const [count, verifiedCount, priceItems] = await Promise.all([
    prisma.business.count({ where }),
    prisma.business.count({ where: { ...where, verifiedAt: { not: null } } }),
    prisma.priceItem.findMany({
      where: { business: where },
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

// Price tier (1-5 "$" signs) per business, relative to other businesses
// in the *same category* - quintiles of each business's cheapest
// priceFrom, not fixed EUR thresholds (those would be made up; nothing
// says what counts as "cheap" for pet hotels vs. grooming). Businesses
// with no PriceItem at all are simply absent from the returned map -
// callers render no price block for them, same as everywhere else data
// is missing.
export async function getPriceTierMap(category: BusinessCategory): Promise<Map<number, number>> {
  const items = await prisma.priceItem.findMany({
    where: { business: { category, status: "PUBLISHED" } },
    select: { businessId: true, priceFrom: true },
  });

  const cheapestByBusiness = new Map<number, number>();
  for (const item of items) {
    const price = Number(item.priceFrom);
    const current = cheapestByBusiness.get(item.businessId);
    if (current === undefined || price < current) cheapestByBusiness.set(item.businessId, price);
  }
  if (cheapestByBusiness.size === 0) return new Map();

  const sortedPrices = [...cheapestByBusiness.values()].sort((a, b) => a - b);
  function tierFor(price: number): number {
    const rank = sortedPrices.filter((p) => p <= price).length;
    const percentile = rank / sortedPrices.length;
    return Math.min(5, Math.max(1, Math.ceil(percentile * 5)));
  }

  const tierMap = new Map<number, number>();
  for (const [businessId, price] of cheapestByBusiness) {
    tierMap.set(businessId, tierFor(price));
  }
  return tierMap;
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
export async function getDistrictSummaries(): Promise<DistrictSummary[]> {
  const [districts, rows] = await Promise.all([
    prisma.district.findMany(),
    prisma.business.findMany({
      where: { status: "PUBLISHED", districtId: { not: null } },
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
