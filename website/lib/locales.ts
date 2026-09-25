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

/** Prefix a locale-neutral path ("/grooming/bratislava/") for a locale.
 *  Every language has its prefix, English too (language model v2, owner
 *  2026-09-23/25; docs/design-plan.md 2.2): /en/..., /sk/... */
export function localePath(locale: Locale, path: string): string {
  return path === "/" ? `/${locale}/` : `/${locale}${path}`;
}

/** Cookie with the language the visitor last picked in the switcher. */
export const LANG_COOKIE = "pawenn_lang";

/**
 * Site languages per country (ISO 3166-1 alpha-2), first = default. Only
 * languages the site has a dictionary for; a country with several
 * (Switzerland, Belgium) lists them all. Adding a language:
 * docs/playbooks/add-language.md.
 */
export const COUNTRY_LANGUAGE: Record<string, Locale[]> = {
  SK: ["sk"],
};

/**
 * The language for the root "/" only (docs/design-plan.md 2.2, point 4):
 * the visitor's cookie, then the browser's Accept-Language, then the
 * country's language, then English. No other URL looks at any of this.
 */
export function pickLocale(input: { cookie?: string | null; acceptLanguage?: string | null; country?: string | null }): Locale {
  if (input.cookie && isLocale(input.cookie)) return input.cookie;
  const wanted = (input.acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { lang: tag.trim().toLowerCase().split("-")[0], q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter((w) => w.lang && !Number.isNaN(w.q) && w.q > 0)
    .sort((a, b) => b.q - a.q);
  const fromBrowser = wanted.find((w) => isLocale(w.lang));
  if (fromBrowser) return fromBrowser.lang as Locale;
  const fromCountry = input.country ? COUNTRY_LANGUAGE[input.country.toUpperCase()]?.[0] : undefined;
  return fromCountry ?? DEFAULT_LOCALE;
}

/**
 * First path segments that existed without a language prefix before v2
 * (English pages). proxy.ts sends them to /en/... with a 301; anything
 * else unprefixed is a 404, not a redirect. Keep in sync with the English
 * category slugs (lib/categories.ts) and page folders in app/[lang].
 */
export const LEGACY_EN_SEGMENTS: readonly string[] = [
  "grooming",
  "vet-clinics",
  "pet-hotels",
  "dog-training",
  "pet-shops",
  "pet-sitting",
  "business",
  "city",
  "how-it-works",
  "add-or-fix-listing",
  "privacy-policy",
  "terms-of-use",
];

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
