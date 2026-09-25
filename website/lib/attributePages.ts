import type { BusinessCategory } from "@prisma/client";
import type { Locale } from "./locales";
import { listingPath } from "./categories";
import { hoursFromStored, type DayHours } from "./hours";

// Attribute pages (owner, 2026-09-25; docs/seo/README.md 2.3): a listing
// of one category in one city narrowed to one attribute people search
// for - "vet open on Sunday", "vet for exotic animals". Same list as the
// category page, with its own URL, title and one-sentence answer. The
// slug sits in the district slot like "prices"; no district may use it.
// Pure module (no database): safe for client components.

export type AttributeKey = "nonstop" | "saturday" | "sunday" | "exotics" | "home-visits";

/** URL slug per attribute and language - as people search it. */
const SLUGS: Record<AttributeKey, Record<Locale, string>> = {
  nonstop: { en: "nonstop", sk: "nonstop" },
  saturday: { en: "open-saturday", sk: "sobota" },
  sunday: { en: "open-sunday", sk: "nedela" },
  exotics: { en: "exotic-animals", sk: "exoticke-zvierata" },
  "home-visits": { en: "home-visits", sk: "vyjazd-domov" },
};

/** Which attributes each category offers, in chip order. Only attributes
 *  with real search demand - not one page per specialty (thin content). */
export const CATEGORY_ATTRIBUTES: Partial<Record<BusinessCategory, AttributeKey[]>> = {
  VET_CLINIC: ["nonstop", "saturday", "sunday", "exotics", "home-visits"],
};

/** Places a page needs to be indexed. Nonstop is indexed from one: an
 *  emergency answer is worth a page even with a single clinic. */
export function minToIndex(key: AttributeKey): number {
  return key === "nonstop" ? 1 : 3;
}

export function attributeSlug(key: AttributeKey, locale: Locale): string {
  return SLUGS[key][locale];
}

export function attributeFromSlug(category: BusinessCategory, slug: string, locale: Locale): AttributeKey | null {
  return (CATEGORY_ATTRIBUTES[category] ?? []).find((key) => SLUGS[key][locale] === slug) ?? null;
}

export function attributePath(locale: Locale, category: BusinessCategory, citySlug: string, key: AttributeKey): string {
  return listingPath(locale, category, citySlug, SLUGS[key][locale]);
}

const isOpenDay = (h: DayHours | undefined) => h !== undefined && (h.kind === "24h" || h.kind === "intervals");

/** Does a place have the attribute? Nonstop places count as open every day. */
export function hasAttribute(
  b: { emergency247: boolean; homeVisits: boolean; specialties: string[]; openingHours: unknown },
  key: AttributeKey
): boolean {
  switch (key) {
    case "nonstop":
      return b.emergency247;
    case "saturday":
      return b.emergency247 || isOpenDay(hoursFromStored(b.openingHours)?.sa);
    case "sunday":
      return b.emergency247 || isOpenDay(hoursFromStored(b.openingHours)?.su);
    case "exotics":
      return b.specialties.includes("exotics");
    case "home-visits":
      return b.homeVisits;
  }
}
