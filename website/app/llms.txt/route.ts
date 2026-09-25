import { getAllCities, getMarketPrices } from "@/lib/data";
import { pricesPath } from "@/lib/pricePages";
import { serviceLabel } from "@/lib/services";
import { ALL_CATEGORIES, categoryLabel, listingPath } from "@/lib/categories";
import { getDictionary, inCity, localePath, localesForCity } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

// Machine-readable site summary for LLM crawlers: every city, every
// language it has, every category page (docs/seo/README.md, 2.6).
export async function GET() {
  const cities = await getAllCities();

  const sections = await Promise.all(cities.map(async (city) => {
    const blocks = await Promise.all(
      localesForCity(city).map(async (locale) => {
        const lines = ALL_CATEGORIES.map(
          (category) =>
            `- [${categoryLabel(category, locale)} ${inCity(locale, city)}](${SITE_URL}${listingPath(locale, category, city.slug)})`
        ).join("\n");
        // Price pages: comparable prices per service, our own data.
        const priceLines: string[] = [];
        for (const category of ALL_CATEGORIES) {
          const market = await getMarketPrices(category, city.slug);
          for (const code of market.keys()) {
            priceLines.push(
              `- [${serviceLabel(category, code, locale)} ${inCity(locale, city)}](${SITE_URL}${pricesPath(locale, category, city.slug, code)})`
            );
          }
        }
        const prices = priceLines.length ? `\n\n#### ${getDictionary(locale).prices.crumb}\n\n${priceLines.join("\n")}` : "";
        return `### ${locale === "en" ? "English" : locale.toUpperCase()}\n\n${lines}${prices}`;
      })
    );
    return `## ${city.name} (${city.country})\n\n${blocks.join("\n\n")}`;
  }));

  const homeLocales = [...new Set(cities.flatMap((c) => localesForCity(c)))];
  const body = `# pawenn

> A directory of pet services: grooming salons, veterinary clinics, pet hotels, dog trainers, pet shops and pet sitters, with real contact details, opening hours and prices sourced from each business, and price pages that compare what each service costs across a city (median, range, date checked). Cities: ${cities.map((c) => c.name).join(", ")}. Every page is in English, and also in the city's local language where it has one.

${homeLocales.map((l) => `- [Home${l === "en" ? "" : ` (${l.toUpperCase()})`}](${SITE_URL}${localePath(l, "/")})`).join("\n")}
- [How it works](${SITE_URL}/how-it-works/)

${sections.join("\n\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
