import { prisma } from "./prisma";
import type { Business, BusinessCategory, District, City } from "@prisma/client";

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

export async function getCityBySlug(slug: string) {
  return prisma.city.findUnique({ where: { slug } });
}

export async function getAllCities() {
  return prisma.city.findMany();
}

export async function getDistrictBySlug(slug: string) {
  return prisma.district.findUnique({ where: { slug }, include: { city: true } });
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
