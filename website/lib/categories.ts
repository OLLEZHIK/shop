import type { Locale } from "./i18n";
import type { BusinessCategory } from "@prisma/client";

// URL slugs confirmed by keyword research (docs/seo/english-keywords.md) -
// docs/design-plan.md section 3 treats this list as final, not a draft.
export const CATEGORY_SLUG_TO_ENUM: Record<string, BusinessCategory> = {
  grooming: "GROOMING",
  "vet-clinics": "VET_CLINIC",
  "pet-hotels": "PET_HOTEL",
  "dog-training": "DOG_TRAINING",
  "pet-shops": "PET_SHOP",
  "pet-sitting": "PET_SITTING",
};

export const CATEGORY_ENUM_TO_SLUG: Record<BusinessCategory, string> = {
  GROOMING: "grooming",
  VET_CLINIC: "vet-clinics",
  PET_HOTEL: "pet-hotels",
  PET_SHOP: "pet-shops",
  DOG_TRAINING: "dog-training",
  PET_SITTING: "pet-sitting",
};

export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  GROOMING: "Grooming",
  VET_CLINIC: "Veterinary Clinics",
  PET_HOTEL: "Pet Hotels",
  PET_SHOP: "Pet Shops",
  DOG_TRAINING: "Dog Training",
  PET_SITTING: "Pet Sitting",
};

// Singular form, for copy like "Find a {label} in {city}".
export const CATEGORY_LABELS_SINGULAR: Record<BusinessCategory, string> = {
  GROOMING: "grooming salon",
  VET_CLINIC: "veterinary clinic",
  PET_HOTEL: "pet hotel",
  PET_SHOP: "pet shop",
  DOG_TRAINING: "dog trainer",
  PET_SITTING: "pet sitter",
};

export function categorySlugFromEnum(category: BusinessCategory): string {
  return CATEGORY_ENUM_TO_SLUG[category];
}

export function categoryEnumFromSlug(slug: string): BusinessCategory | null {
  return CATEGORY_SLUG_TO_ENUM[slug] ?? null;
}

export const ALL_CATEGORY_SLUGS = Object.keys(CATEGORY_SLUG_TO_ENUM);

// Visual identity per category: accent color (CSS var from
// design-tokens.css) and a one-line, fact-free description of what the
// service is - shown on category tiles and listing headers.
export const CATEGORY_THEME: Record<BusinessCategory, { accent: string; blurb: string }> = {
  GROOMING: { accent: "var(--cat-grooming)", blurb: "Baths, haircuts, trimming and nail care" },
  VET_CLINIC: { accent: "var(--cat-vet)", blurb: "Check-ups, vaccinations and emergencies" },
  PET_HOTEL: { accent: "var(--cat-hotel)", blurb: "Safe stays while you travel" },
  DOG_TRAINING: { accent: "var(--cat-training)", blurb: "Puppy classes, obedience and behaviour" },
  PET_SHOP: { accent: "var(--cat-shop)", blurb: "Food, toys and everyday supplies" },
  PET_SITTING: { accent: "var(--cat-sitting)", blurb: "Walks, visits and care at home" },
};

// ---------------------------------------------------------------------
// Per-locale slugs, labels and blurbs. English values mirror the maps
// above. Slovak slugs follow the original Slovak URL plan
// (docs/concept.md section 4, e.g. /psi-salon/) and the owner's example
// /sk/veterinar/bratislava/; they are provisional until the Slovak
// keyword research task confirms them.
// ---------------------------------------------------------------------

const SLUGS: Record<Locale, Record<BusinessCategory, string>> = {
  en: CATEGORY_ENUM_TO_SLUG,
  sk: {
    GROOMING: "psi-salon",
    VET_CLINIC: "veterinar",
    PET_HOTEL: "hotel-pre-zvierata",
    DOG_TRAINING: "vycvik-psov",
    PET_SHOP: "chovatelske-potreby",
    PET_SITTING: "opatrovanie-zvierat",
  },
};

const LABELS: Record<Locale, Record<BusinessCategory, string>> = {
  en: CATEGORY_LABELS,
  sk: {
    GROOMING: "Psie salóny",
    VET_CLINIC: "Veterinárne ambulancie",
    PET_HOTEL: "Hotely pre zvieratá",
    DOG_TRAINING: "Výcvik psov",
    PET_SHOP: "Chovateľské potreby",
    PET_SITTING: "Opatrovanie zvierat",
  },
};

const SINGULAR: Record<Locale, Record<BusinessCategory, string>> = {
  en: CATEGORY_LABELS_SINGULAR,
  sk: {
    GROOMING: "psí salón",
    VET_CLINIC: "veterinárna ambulancia",
    PET_HOTEL: "hotel pre zvieratá",
    DOG_TRAINING: "výcvik psa",
    PET_SHOP: "chovateľské potreby",
    PET_SITTING: "opatrovanie zvierat",
  },
};

// Plural noun for running copy ("Compare 10 grooming salons..."). The
// English labels are headings ("Grooming", "Dog Training") and read
// wrong after a number.
const PLURAL: Record<Locale, Record<BusinessCategory, string>> = {
  en: {
    GROOMING: "grooming salons",
    VET_CLINIC: "vet clinics",
    PET_HOTEL: "pet hotels",
    DOG_TRAINING: "dog trainers",
    PET_SHOP: "pet shops",
    PET_SITTING: "pet sitters",
  },
  sk: {
    GROOMING: "psie salóny",
    VET_CLINIC: "veterinárne ambulancie",
    PET_HOTEL: "hotely pre zvieratá",
    DOG_TRAINING: "výcvik psov",
    PET_SHOP: "chovateľské potreby",
    PET_SITTING: "opatrovanie zvierat",
  },
};

// Page <title> wording: the phrases people actually type. "Grooming in
// Bratislava" alone also matches barbershops, so the English titles say
// which animals. Slovak stays on the labels until the keyword research
// task (tasks/antigravity-slovak-keyword-research.md) says otherwise.
const SEO_TITLE: Record<Locale, Record<BusinessCategory, string>> = {
  en: {
    GROOMING: "Dog & Cat Grooming",
    VET_CLINIC: "Vets & Veterinary Clinics",
    PET_HOTEL: "Pet Hotels & Dog Boarding",
    DOG_TRAINING: "Dog Training & Puppy Classes",
    PET_SHOP: "Pet Shops",
    PET_SITTING: "Pet Sitters & Dog Walkers",
  },
  sk: LABELS.sk,
};

const BLURBS: Record<Locale, Record<BusinessCategory, string>> = {
  en: {
    GROOMING: CATEGORY_THEME.GROOMING.blurb,
    VET_CLINIC: CATEGORY_THEME.VET_CLINIC.blurb,
    PET_HOTEL: CATEGORY_THEME.PET_HOTEL.blurb,
    DOG_TRAINING: CATEGORY_THEME.DOG_TRAINING.blurb,
    PET_SHOP: CATEGORY_THEME.PET_SHOP.blurb,
    PET_SITTING: CATEGORY_THEME.PET_SITTING.blurb,
  },
  sk: {
    GROOMING: "Kúpanie, strihanie, trimovanie a starostlivosť o pazúry",
    VET_CLINIC: "Prehliadky, očkovanie a pohotovosť",
    PET_HOTEL: "Bezpečný pobyt, kým ste na cestách",
    DOG_TRAINING: "Kurzy pre šteňatá, poslušnosť a správanie",
    PET_SHOP: "Krmivo, hračky a potreby na každý deň",
    PET_SITTING: "Venčenie, návštevy a starostlivosť doma",
  },
};

export const ALL_CATEGORIES: BusinessCategory[] = [
  "GROOMING",
  "VET_CLINIC",
  "PET_HOTEL",
  "DOG_TRAINING",
  "PET_SHOP",
  "PET_SITTING",
];

export function categorySlug(category: BusinessCategory, locale: Locale): string {
  return SLUGS[locale][category];
}

export function categoryFromSlug(slug: string, locale: Locale): BusinessCategory | null {
  const entry = Object.entries(SLUGS[locale]).find(([, s]) => s === slug);
  return entry ? (entry[0] as BusinessCategory) : null;
}

export function categoryLabel(category: BusinessCategory, locale: Locale): string {
  return LABELS[locale][category];
}

export function categorySingular(category: BusinessCategory, locale: Locale): string {
  return SINGULAR[locale][category];
}

export function categoryPlural(category: BusinessCategory, locale: Locale): string {
  return PLURAL[locale][category];
}

export function categorySeoTitle(category: BusinessCategory, locale: Locale): string {
  return SEO_TITLE[locale][category];
}

export function categoryBlurb(category: BusinessCategory, locale: Locale): string {
  return BLURBS[locale][category];
}

// Locale-aware paths. English is unprefixed; see lib/i18n.ts.
const BUSINESS_SEGMENT: Record<Locale, string> = { en: "business", sk: "podnik" };

export function businessSegment(locale: Locale): string {
  return BUSINESS_SEGMENT[locale];
}

export function listingPath(
  locale: Locale,
  category: BusinessCategory,
  citySlug: string,
  districtSlug?: string | null
): string {
  const base = `/${categorySlug(category, locale)}/${citySlug}/${districtSlug ? `${districtSlug}/` : ""}`;
  return locale === "en" ? base : `/${locale}${base}`;
}

// City hub: /city/<slug>/, /sk/mesto/<slug>/ - served by the
// [category]/[city] route (this segment is never a category slug).
export const CITY_SEGMENT: Record<Locale, string> = { en: "city", sk: "mesto" };

export function isCitySegment(segment: string, locale: Locale): boolean {
  return CITY_SEGMENT[locale] === segment;
}

export function cityPath(locale: Locale, citySlug: string): string {
  const base = `/${CITY_SEGMENT[locale]}/${citySlug}/`;
  return locale === "en" ? base : `/${locale}${base}`;
}

export function businessPath(locale: Locale, slug: string): string {
  const base = `/${BUSINESS_SEGMENT[locale]}/${slug}/`;
  return locale === "en" ? base : `/${locale}${base}`;
}
