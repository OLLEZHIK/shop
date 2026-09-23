import type { BusinessCategory } from "@prisma/client";

// The five pet types pawenn covers (owner decision 2026-09-23: the most
// popular pets). Values match Business.animals in the database/CSVs;
// labels live in lib/i18n.ts (`animals`, `animalSingular`).
export const ANIMALS = ["dog", "cat", "small-pet", "bird", "fish"] as const;
export type Animal = (typeof ANIMALS)[number];

export function isAnimal(value: string | undefined | null): value is Animal {
  return !!value && (ANIMALS as readonly string[]).includes(value);
}

// Which services make sense for which pet (owner: "why would birds need
// dog training?"). Drives the search, the filter chips and which pet
// filters a listing page offers. Product decision, not business data.
export const ANIMAL_SERVICES: Record<Animal, BusinessCategory[]> = {
  dog: ["GROOMING", "VET_CLINIC", "PET_HOTEL", "DOG_TRAINING", "PET_SHOP", "PET_SITTING"],
  cat: ["GROOMING", "VET_CLINIC", "PET_HOTEL", "PET_SHOP", "PET_SITTING"],
  "small-pet": ["VET_CLINIC", "PET_HOTEL", "PET_SHOP", "PET_SITTING"],
  bird: ["VET_CLINIC", "PET_HOTEL", "PET_SHOP", "PET_SITTING"],
  fish: ["PET_SHOP", "PET_SITTING"],
};

export function servicesForAnimal(animal: Animal | null): BusinessCategory[] | null {
  return animal ? ANIMAL_SERVICES[animal] : null;
}

export function animalsForService(category: BusinessCategory): Animal[] {
  return ANIMALS.filter((a) => ANIMAL_SERVICES[a].includes(category));
}
