import type { MetadataRoute } from "next";
import { getAllCities, getAllDistricts, getCategoryAggregates, getAllPublishedBusinessSlugs, getNonstopVetCount } from "@/lib/data";
import { NONSTOP_SEGMENT } from "@/lib/districts";
import { ALL_CATEGORIES, businessPath, listingPath } from "@/lib/categories";
import { localePath, localesForCountry, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const MIN_LISTED_FOR_INDEX = 3;

type Entry = MetadataRoute.Sitemap[number];

// One entry per language version, each carrying hreflang alternates for
// the whole set (Google's sitemap flavour of hreflang).
function localized(
  locales: Locale[],
  pathFor: (locale: Locale) => string,
  extra: Omit<Entry, "url" | "alternates">
): Entry[] {
  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}${pathFor(l)}`]));
  return locales.map((l) => ({ url: `${SITE_URL}${pathFor(l)}`, alternates: { languages }, ...extra }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, districts, businesses] = await Promise.all([
    getAllCities(),
    getAllDistricts(),
    getAllPublishedBusinessSlugs(),
  ]);

  // Home is shared by all cities; offer every language any city has.
  const homeLocales = [...new Set(cities.flatMap((c) => localesForCountry(c.country)))];
  const entries: MetadataRoute.Sitemap = [
    ...localized(homeLocales.length ? homeLocales : ["en"], (l) => localePath(l, "/"), {
      changeFrequency: "weekly",
      priority: 1,
    }),
    { url: `${SITE_URL}/how-it-works/`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/add-or-fix-listing/`, changeFrequency: "monthly", priority: 0.3 },
  ];

  for (const category of ALL_CATEGORIES) {
    for (const city of cities) {
      const locales = localesForCountry(city.country);
      // getCategoryAggregates isn't city-scoped (same known gap as PR #28/#32
      // - Business has no direct city reference) - harmless with one city.
      const cityAggregates = await getCategoryAggregates(category);
      if (cityAggregates.count >= MIN_LISTED_FOR_INDEX) {
        entries.push(
          ...localized(locales, (l) => listingPath(l, category, city.slug), { changeFrequency: "daily", priority: 0.9 })
        );
      }

      if (category === "VET_CLINIC" && (await getNonstopVetCount(city.slug)) > 0) {
        entries.push(
          ...localized(locales, (l) => listingPath(l, category, city.slug, NONSTOP_SEGMENT), {
            changeFrequency: "daily",
            priority: 0.8,
          })
        );
      }

      for (const district of districts.filter((d) => d.cityId === city.id)) {
        const districtAggregates = await getCategoryAggregates(category, district.slug);
        if (districtAggregates.count >= MIN_LISTED_FOR_INDEX) {
          entries.push(
            ...localized(locales, (l) => listingPath(l, category, city.slug, district.slug), {
              changeFrequency: "daily",
              priority: 0.7,
            })
          );
        }
      }
    }
  }

  for (const business of businesses) {
    entries.push(
      ...localized(localesForCountry(business.country), (l) => businessPath(l, business.slug), {
        lastModified: business.verifiedAt ?? undefined,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    );
  }

  return entries;
}
