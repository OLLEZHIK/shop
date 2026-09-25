// Vet clinic specialty codes (tasks/mac-collect-hours-and-vet-services.md,
// docs/card-spec.md section 8) with their labels.
import type { Locale } from "./locales";

export const VET_SPECIALTIES = [
  "surgery",
  "orthopedics",
  "dentistry",
  "dermatology",
  "cardiology",
  "ophthalmology",
  "oncology",
  "neurology",
  "internal-medicine",
  "reproduction",
  "rehabilitation",
  "exotics",
  "ultrasound",
  "x-ray",
  "ct",
  "mri",
  "endoscopy",
  "laboratory",
  "hospitalization",
] as const;

export type VetSpecialty = (typeof VET_SPECIALTIES)[number];

const LABELS: Record<VetSpecialty, Record<Locale, string>> = {
  surgery: { en: "Surgery", sk: "Chirurgia" },
  orthopedics: { en: "Orthopaedics", sk: "Ortopédia" },
  dentistry: { en: "Dentistry", sk: "Stomatológia" },
  dermatology: { en: "Dermatology", sk: "Dermatológia" },
  cardiology: { en: "Cardiology", sk: "Kardiológia" },
  ophthalmology: { en: "Ophthalmology", sk: "Oftalmológia" },
  oncology: { en: "Oncology", sk: "Onkológia" },
  neurology: { en: "Neurology", sk: "Neurológia" },
  "internal-medicine": { en: "Internal medicine", sk: "Interná medicína" },
  reproduction: { en: "Reproduction", sk: "Reprodukcia" },
  rehabilitation: { en: "Rehabilitation", sk: "Rehabilitácia" },
  exotics: { en: "Exotic animals", sk: "Exotické zvieratá" },
  ultrasound: { en: "Ultrasound", sk: "Sonografia" },
  "x-ray": { en: "X-ray", sk: "RTG" },
  ct: { en: "CT", sk: "CT" },
  mri: { en: "MRI", sk: "Magnetická rezonancia" },
  endoscopy: { en: "Endoscopy", sk: "Endoskopia" },
  laboratory: { en: "Laboratory", sk: "Laboratórium" },
  hospitalization: { en: "Hospitalisation", sk: "Hospitalizácia" },
};

export function specialtyLabel(code: string, locale: string): string {
  const l = LABELS[code as VetSpecialty];
  return l ? (l[locale as Locale] ?? l.en) : code;
}
