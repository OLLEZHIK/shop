import type { MetadataRoute } from "next";
import { getAllCities, getAllDistricts, getCategoryAggregates, getAllPublishedBusinessSlugs } from "@/lib/data";
import { ALL_CATEGORY_SLUGS, categoryEnumFromSlug } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

const MIN_LISTED_FOR_INDEX = 3;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, districts, businesses] = await Promise.all([
    getAllCities(),
    getAllDistricts(),
    getAllPublishedBusinessSlugs(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/how-it-works/`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/add-or-fix-listing/`, changeFrequency: "monthly", priority: 0.3 },
  ];

  for (const categorySlug of ALL_CATEGORY_SLUGS) {
    const category = categoryEnumFromSlug(categorySlug)!;

    for (const city of cities) {
      // getCategoryAggregates isn't city-scoped (same known gap as PR #28/#32
      // - Business has no direct city reference) - harmless with one city.
      const cityAggregates = await getCategoryAggregates(category);
      if (cityAggregates.count >= MIN_LISTED_FOR_INDEX) {
        entries.push({
          url: `${SITE_URL}/${categorySlug}/${city.slug}/`,
          changeFrequency: "daily",
          priority: 0.9,
        });
      }

      for (const district of districts.filter((d) => d.cityId === city.id)) {
        const districtAggregates = await getCategoryAggregates(category, district.slug);
        if (districtAggregates.count >= MIN_LISTED_FOR_INDEX) {
          entries.push({
            url: `${SITE_URL}/${categorySlug}/${city.slug}/${district.slug}/`,
            changeFrequency: "daily",
            priority: 0.7,
          });
        }
      }
    }
  }

  for (const business of businesses) {
    entries.push({
      url: `${SITE_URL}/business/${business.slug}/`,
      lastModified: business.verifiedAt ?? undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
