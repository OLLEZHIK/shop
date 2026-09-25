import type { BusinessCategory } from "@prisma/client";

// District pages exist for every district, but we only link to one when
// it has at least this many places in the category (owner, 2026-09-25):
// thinner pages stay noindex and out of the sitemap, and nothing leads
// visitors to a near-empty list.
export const MIN_DISTRICT_LISTINGS = 3;

/** /<vets>/<city>/nonstop - a listing page in the district URL slot. No
 *  district may use this slug. */
export const NONSTOP_SEGMENT = "nonstop";

export interface DistrictCounts {
  slug: string;
  byCategory: { category: BusinessCategory; count: number }[];
}

export function districtCount(districts: DistrictCounts[], districtSlug: string, category: BusinessCategory): number {
  return districts.find((d) => d.slug === districtSlug)?.byCategory.find((c) => c.category === category)?.count ?? 0;
}

export function isDistrictLinkable(districts: DistrictCounts[], districtSlug: string, category: BusinessCategory): boolean {
  return districtCount(districts, districtSlug, category) >= MIN_DISTRICT_LISTINGS;
}

/** { districtSlug: { CATEGORY: count } } - a plain object for client components. */
export function districtCountMap(districts: DistrictCounts[]): Record<string, Partial<Record<BusinessCategory, number>>> {
  return Object.fromEntries(
    districts.map((d) => [d.slug, Object.fromEntries(d.byCategory.map((c) => [c.category, c.count]))])
  );
}
