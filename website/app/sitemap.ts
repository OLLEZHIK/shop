import type { MetadataRoute } from "next";
import { getAllCities, getAllDistricts, getCategoryAggregates, getAllPublishedBusinessSlugs, getBusinessCount, getMarketPrices, getNonstopVetCount } from "@/lib/data";
import { getPriceSummary, pricesPath } from "@/lib/pricePages";
import { NONSTOP_SEGMENT } from "@/lib/districts";
import { ALL_CATEGORIES, businessPath, cityPath, listingPath } from "@/lib/categories";
import { localePath, localesForCity, type Locale } from "@/lib/i18n";
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
  const homeLocales = [...new Set(cities.flatMap((c) => localesForCity(c)))];
  const entries: MetadataRoute.Sitemap = [
    ...localized(homeLocales.length ? homeLocales : ["en"], (l) => localePath(l, "/"), {
      changeFrequency: "weekly",
      priority: 1,
    }),
    { url: `${SITE_URL}/en/how-it-works/`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/en/add-or-fix-listing/`, changeFrequency: "monthly", priority: 0.3 },
  ];

  for (const city of cities) {
    const total = (await getBusinessCount(city.slug)).total;
    if (total >= MIN_LISTED_FOR_INDEX) {
      entries.push(
        ...localized(localesForCity(city), (l) => cityPath(l, city.slug), { changeFrequency: "weekly", priority: 0.9 })
      );
    }
  }

  for (const category of ALL_CATEGORIES) {
    for (const city of cities) {
      const locales = localesForCity(city);
      const cityAggregates = await getCategoryAggregates(category, city.slug);
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

      // Price pages: the overview and each service with a market price
      // (at least 3 comparable prices) - lib/pricePages.ts.
      const market = await getMarketPrices(category, city.slug);
      if (market.size > 0) {
        const summaries = await Promise.all([...market.keys()].map((code) => getPriceSummary(category, city.slug, code)));
        const checked = summaries.map((s) => s.checked).filter((d): d is Date => d !== null);
        entries.push(
          ...localized(locales, (l) => pricesPath(l, category, city.slug), {
            lastModified: checked.length ? new Date(Math.max(...checked.map((d) => d.getTime()))) : undefined,
            changeFrequency: "weekly",
            priority: 0.8,
          })
        );
        [...market.keys()].forEach((code, i) => {
          entries.push(
            ...localized(locales, (l) => pricesPath(l, category, city.slug, code), {
              lastModified: summaries[i].checked ?? undefined,
              changeFrequency: "weekly",
              priority: 0.8,
            })
          );
        });
      }

      for (const district of districts.filter((d) => d.cityId === city.id)) {
        const districtAggregates = await getCategoryAggregates(category, city.slug, district.slug);
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
      ...localized(localesForCity(business.city), (l) => businessPath(l, business.slug), {
        lastModified: business.verifiedAt ?? undefined,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    );
  }

  return entries;
}
