import { categoryFromSlug, categorySlug, businessSegment } from "./categories";
import { LOCALES, type Locale } from "./i18n";

/** Locale of a browser path ("/sk/..." -> "sk", else "en"). */
export function localeOfPath(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return (LOCALES as readonly string[]).includes(first) && first !== "en" ? (first as Locale) : "en";
}

/**
 * The same page in another locale: swaps the prefix, the category slug
 * and the business segment. Pages that exist in English only (Help,
 * legal) map to the target locale's home page.
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const from = localeOfPath(pathname);
  const parts = pathname.split("/").filter(Boolean);
  if (from !== "en") parts.shift();

  const prefix = target === "en" ? "" : `/${target}`;
  if (parts.length === 0) return `${prefix}/`;

  const [first, ...rest] = parts;
  if (first === businessSegment(from)) {
    return `${prefix}/${businessSegment(target)}/${rest.join("/")}/`;
  }
  const category = categoryFromSlug(first, from);
  if (category) {
    return `${prefix}/${[categorySlug(category, target), ...rest].join("/")}/`;
  }
  return `${prefix}/`;
}
