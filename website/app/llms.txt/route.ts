import { getDefaultCity } from "@/lib/data";
import { ALL_CATEGORIES, categoryLabel, listingPath } from "@/lib/categories";
import { inCity, localePath, localesForCountry } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export async function GET() {
  const city = await getDefaultCity();
  const citySlug = city?.slug ?? "";
  const cityName = city?.name ?? "Bratislava";
  const locales = localesForCountry(city?.country);

  const sections = locales.map((locale) => {
    const lines = ALL_CATEGORIES.map(
      (category) =>
        `- [${categoryLabel(category, locale)} ${inCity(locale, citySlug, cityName)}](${SITE_URL}${listingPath(locale, category, citySlug)})`
    ).join("\n");
    const heading = locale === "en" ? "## English" : `## ${locale.toUpperCase()} (local language)`;
    return `${heading}\n\n- [Home](${SITE_URL}${localePath(locale, "/")})\n${lines}`;
  });

  const body = `# pawenn

> A directory of verified pet services in ${cityName}, Slovakia: grooming salons, veterinary clinics, pet hotels, dog trainers, pet shops and pet sitters, with real contact details and prices sourced directly from each business. Every page exists in English and in the city's local language.

${sections.join("\n\n")}

- [How it works](${SITE_URL}/how-it-works/)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
