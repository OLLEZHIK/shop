import type { Metadata } from "next";
import { SITE_URL } from "./site";
import type { Locale } from "./i18n";

/**
 * canonical + hreflang for a page that exists in several locales.
 * `paths` maps each available locale to that version's path; English
 * doubles as x-default.
 */
export function localeAlternates(current: Locale, paths: Partial<Record<Locale, string>>): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const [locale, path] of Object.entries(paths)) {
    if (path) languages[locale] = `${SITE_URL}${path}`;
  }
  if (paths.en) languages["x-default"] = `${SITE_URL}${paths.en}`;
  return {
    canonical: `${SITE_URL}${paths[current]}`,
    languages,
  };
}
