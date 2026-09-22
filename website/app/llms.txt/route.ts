import { getDefaultCity } from "@/lib/data";
import { ALL_CATEGORY_SLUGS, CATEGORY_LABELS, categoryEnumFromSlug } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

export async function GET() {
  const city = await getDefaultCity();
  const citySlug = city?.slug ?? "";
  const cityName = city?.name ?? "Bratislava";

  const categoryLines = ALL_CATEGORY_SLUGS.map((slug) => {
    const label = CATEGORY_LABELS[categoryEnumFromSlug(slug)!];
    return `- [${label} in ${cityName}](${SITE_URL}/${slug}/${citySlug}/)`;
  }).join("\n");

  const body = `# pawenn

> A directory of verified pet services in ${cityName}, Slovakia: grooming salons, veterinary clinics, pet hotels, dog trainers, pet shops and pet sitters, with real contact details and prices sourced directly from each business.

- [Home](${SITE_URL}/)
${categoryLines}
- [How it works](${SITE_URL}/how-it-works/)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
