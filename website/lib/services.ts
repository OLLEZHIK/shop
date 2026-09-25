import type { BusinessCategory } from "@prisma/client";

// The 6 priced services per category - docs/card-spec.md, "Цены"
// (owner, 2026-09-25). Pet shops have no prices. Codes are the contract
// with data agents (prices.csv price_code); labels are ours, per locale.
export interface ServiceDef {
  code: string;
  en: string;
  sk: string;
}

export const SERVICES: Partial<Record<BusinessCategory, ServiceDef[]>> = {
  GROOMING: [
    { code: "full_groom", en: "Full grooming", sk: "Kompletná úprava" },
    { code: "bath_dry", en: "Bath & blow-dry", sk: "Kúpanie a fénovanie" },
    { code: "hand_stripping", en: "Hand stripping", sk: "Trimovanie" },
    { code: "deshedding", en: "De-shedding", sk: "Vyčesávanie podsady" },
    { code: "nail_trim", en: "Nail trim", sk: "Strihanie pazúrikov" },
    { code: "cat_groom", en: "Cat grooming", sk: "Úprava mačky" },
  ],
  VET_CLINIC: [
    { code: "exam", en: "Check-up", sk: "Klinické vyšetrenie" },
    { code: "vaccination_dog", en: "Dog vaccination", sk: "Očkovanie psa" },
    { code: "microchip", en: "Microchip", sk: "Čipovanie" },
    { code: "neuter_cat", en: "Cat neutering (male)", sk: "Kastrácia kocúra" },
    { code: "spay_cat", en: "Cat spaying (female)", sk: "Kastrácia mačky" },
    { code: "spay_dog", en: "Dog spaying (female)", sk: "Kastrácia suky" },
  ],
  PET_HOTEL: [
    { code: "dog_night", en: "Dog, per night", sk: "Pes, noc" },
    { code: "cat_night", en: "Cat, per night", sk: "Mačka, noc" },
    { code: "daycare_day", en: "Dog daycare, per day", sk: "Psia škôlka, deň" },
    { code: "daycare_pass", en: "Daycare pass", sk: "Permanentka do škôlky" },
    { code: "pickup", en: "Pick-up & drop-off", sk: "Dovoz a odvoz" },
    { code: "extra_walk", en: "Extra walk / individual care", sk: "Venčenie navyše / individuálna starostlivosť" },
  ],
  DOG_TRAINING: [
    { code: "puppy_course", en: "Puppy course", sk: "Šteňacia škôlka" },
    { code: "obedience_course", en: "Basic obedience course", sk: "Kurz základnej poslušnosti" },
    { code: "group_lesson", en: "Group lesson", sk: "Skupinová hodina" },
    { code: "private_lesson", en: "Private lesson", sk: "Individuálna hodina" },
    { code: "behavior_consult", en: "Behaviour consultation", sk: "Konzultácia problémového správania" },
    { code: "membership", en: "Club membership", sk: "Členský poplatok" },
  ],
  PET_SITTING: [
    { code: "walk_30", en: "Dog walk, 30 min", sk: "Venčenie 30 min" },
    { code: "walk_60", en: "Dog walk, 60 min", sk: "Venčenie 60 min" },
    { code: "cat_visit", en: "Cat visit", sk: "Návšteva mačky" },
    { code: "house_sitting_night", en: "Overnight at your home", sk: "Stráženie u vás doma, noc" },
    { code: "boarding_night", en: "Overnight at sitter's home", sk: "Stráženie u opatrovateľa, noc" },
    { code: "daycare_day", en: "Day care", sk: "Denné stráženie" },
  ],
};

/** Service.slug in the database: codes repeat across categories. */
export function serviceSlug(category: BusinessCategory, code: string): string {
  return `${category}:${code}`;
}

export function findService(category: BusinessCategory, code: string): ServiceDef | undefined {
  return SERVICES[category]?.find((s) => s.code === code);
}

/** Label for a price row; falls back to English, then the raw code. */
export function serviceLabel(category: BusinessCategory, code: string, locale: string): string {
  const def = findService(category, code);
  if (!def) return code;
  return locale === "sk" ? def.sk : def.en;
}
