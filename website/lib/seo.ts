import type { Metadata } from "next";
import { SITE_URL } from "./site";
import type { Locale } from "./i18n";

/**
 * canonical + hreflang for a page that exists in several locales.
 * `paths` maps each available locale to that version's path; English
 * doubles as x-default.
 */
export function localeAlternates(
  current: Locale,
  paths: Partial<Record<Locale, string>>,
  /** x-default: the home page passes "/" (the root picks the visitor's
   *  language, docs/design-plan.md 2.2); other pages default to English. */
  xDefault?: string
): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const [locale, path] of Object.entries(paths)) {
    if (path) languages[locale] = `${SITE_URL}${path}`;
  }
  const fallback = xDefault ?? paths.en;
  if (fallback) languages["x-default"] = `${SITE_URL}${fallback}`;
  return {
    canonical: `${SITE_URL}${paths[current]}`,
    languages,
  };
}

const OG_LOCALE: Record<Locale, string> = { en: "en_US", sk: "sk_SK" };

/** Link preview image for a page: app/og/route.tsx draws it from these texts. */
export function ogImageUrl(title: string, subtitle?: string, category?: string): string {
  const q = new URLSearchParams({ title });
  if (subtitle) q.set("sub", subtitle);
  if (category) q.set("cat", category);
  return `${SITE_URL}/api/og/?${q.toString()}`;
}

/**
 * Open Graph + Twitter card for a page (SEO audit T27): what Facebook,
 * WhatsApp, Reddit, Slack and X show when someone shares the link. The
 * image is drawn per page from `image` (defaults to title/description).
 */
export function socialMeta({
  title,
  description,
  path,
  locale,
  image,
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  image?: { title: string; subtitle?: string; category?: string };
}): Pick<Metadata, "openGraph" | "twitter"> {
  const url = ogImageUrl(image?.title ?? title, image?.subtitle ?? description.slice(0, 110), image?.category);
  return {
    openGraph: {
      type: "website",
      siteName: "Pawenn",
      title,
      description,
      url: `${SITE_URL}${path}`,
      locale: OG_LOCALE[locale],
      alternateLocale: (Object.keys(OG_LOCALE) as Locale[]).filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [{ url, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [url] },
  };
}
