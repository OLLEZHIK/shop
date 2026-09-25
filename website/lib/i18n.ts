// Locales, URL helpers and UI dictionaries.
//
// URL scheme - language model v2 (owner 2026-09-23/25,
// docs/design-plan.md 2.2): every language has its prefix, English too
// (`/en/grooming/bratislava/`, `/sk/psi-salon/bratislava/`), versions are
// linked with hreflang. The root `/` sends the visitor to their language
// (cookie, browser, country - proxy.ts); pre-v2 English URLs without a
// prefix get a 301 to /en/.
//
// Scaling rule: a new city is data only (docs/architecture/multi-city.md).
// A new *language* is one dictionary file in lib/dictionaries/ plus slugs
// in lib/categories.ts (docs/playbooks/add-language.md) - effort grows
// with languages, not cities.

import { DATE_LOCALE, isLocale, type Locale } from "./locales";
import { en, type Dictionary } from "./dictionaries/en";
import { sk } from "./dictionaries/sk";

export { LOCALES, DEFAULT_LOCALE, isLocale, localePath, plural, type Locale } from "./locales";
export type { Dictionary };

// A city's languages come from its data (City.locales, from city.json);
// English is always available. Only languages the site has a dictionary
// for are used - see docs/playbooks/add-language.md.
export interface CityLanguages {
  locales?: string[] | null;
}

export function localesForCity(city: CityLanguages | null | undefined): Locale[] {
  const local = (city?.locales ?? []).filter((l): l is Locale => isLocale(l) && l !== "en");
  return ["en", ...new Set(local)];
}

export function formatDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(DATE_LOCALE[locale], { year: "numeric", month: "short", day: "numeric" });
}

export interface CityPhrases {
  name: string;
  /** "in <city>" per language, from city.json (in_city). */
  inPhrases?: unknown;
}

/** "in Bratislava" / "v Bratislave" from the city's data; without a phrase
 *  for this language: English "in <name>", others "– <name>". */
export function inCity(locale: Locale, city: CityPhrases): string {
  const phrase = (city.inPhrases as Record<string, string> | null | undefined)?.[locale];
  if (phrase) return phrase;
  return locale === "en" ? `in ${city.name}` : `– ${city.name}`;
}

const DICTIONARIES: Record<Locale, Dictionary> = { en, sk };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
