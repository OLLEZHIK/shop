import type { BusinessCategory } from "@prisma/client";
import { CITY_SEGMENT, categoryFromSlug, categorySlug, businessSegment } from "./categories";
import { LOCALES, type Locale } from "./i18n";
import { PRICES_SEGMENT, serviceCodeFromSlug, serviceSlugFor } from "./priceSlugs";

/** Locale of a browser path: its prefix (/en/..., /sk/...), English if none. */
export function localeOfPath(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return (LOCALES as readonly string[]).includes(first) ? (first as Locale) : "en";
}

/** Slugs after /<category>/<city>/ that differ per language: the prices
 *  segment and its service slug. Districts and "nonstop" are the same. */
function switchListingRest(category: BusinessCategory, rest: string[], from: Locale, target: Locale): string[] {
  const [city, segment, service, ...more] = rest;
  if (segment !== PRICES_SEGMENT[from]) return rest;
  const code = service ? serviceCodeFromSlug(category, service, from) : null;
  const serviceTarget = code ? serviceSlugFor(category, code, target) : null;
  return [city, PRICES_SEGMENT[target], ...(serviceTarget ? [serviceTarget] : []), ...more];
}

/**
 * The same page in another locale (language model v2: every language has
 * its prefix): swaps the prefix, category slug, business segment, city
 * hub segment and price slugs. Pages that exist in English only (Help,
 * legal) map to the target locale's home page.
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const from = localeOfPath(pathname);
  const parts = pathname.split("/").filter(Boolean);
  if ((LOCALES as readonly string[]).includes(parts[0])) parts.shift();

  const prefix = `/${target}`;
  if (parts.length === 0) return `${prefix}/`;

  const [first, ...rest] = parts;
  if (first === businessSegment(from)) {
    return `${prefix}/${businessSegment(target)}/${rest.join("/")}/`;
  }
  if (first === CITY_SEGMENT[from]) {
    return `${prefix}/${[CITY_SEGMENT[target], ...rest].join("/")}/`;
  }
  const category = categoryFromSlug(first, from);
  if (category) {
    return `${prefix}/${[categorySlug(category, target), ...switchListingRest(category, rest, from, target)].join("/")}/`;
  }
  return `${prefix}/`;
}
