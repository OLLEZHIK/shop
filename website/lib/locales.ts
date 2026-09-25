// The site's languages. Kept free of imports so proxy.ts can use it.
// Adding a language: docs/playbooks/add-language.md.

export const LOCALES = ["en", "sk"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** BCP 47 tag for dates and plural rules. */
export const DATE_LOCALE: Record<Locale, string> = { en: "en-GB", sk: "sk-SK" };

/** Prefix a locale-neutral path ("/grooming/bratislava/") for a locale. */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}/` : `/${locale}${path}`;
}

/** Count form by the language's own rules (Intl.PluralRules): English
 *  one/other, Slovak one/few (2-4)/other, Czech and Polish also many. */
export function plural(
  locale: Locale,
  n: number,
  forms: { one: string; few?: string; many?: string; other: string }
): string {
  const form = new Intl.PluralRules(DATE_LOCALE[locale]).select(n);
  if (form === "one") return forms.one;
  if (form === "few") return forms.few ?? forms.other;
  if (form === "many") return forms.many ?? forms.other;
  return forms.other;
}
