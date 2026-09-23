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
