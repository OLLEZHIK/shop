import type { BusinessCategory } from "@prisma/client";

// The duo-companion mark from components/Logo.tsx as a standalone SVG, for
// images rendered outside React DOM (Open Graph cards, the Organization
// logo in JSON-LD). Keep in sync with Logo.tsx.
export const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 6 52 48">
<ellipse cx="28" cy="30" rx="22" ry="20" fill="#F7F9FB" stroke="#004E89" stroke-width="2"/>
<path d="M12 16 C4 18 3 32 10 40 C14 43 18 38 17 28 C16 22 14 16 12 16 Z" fill="#004E89"/>
<path d="M44 16 C52 18 53 32 46 40 C42 43 38 38 39 28 C40 22 42 16 44 16 Z" fill="#FF6B35"/>
<circle cx="20.5" cy="23" r="2.2" fill="#1A202C"/>
<circle cx="35.5" cy="23" r="2.2" fill="#1A202C"/>
<path d="M22 32 C22 30 34 30 34 32 C34 34.5 30 38.5 28 38.5 C26 38.5 22 34.5 22 32 Z" fill="#1A202C"/>
<path d="M28 38.5 V42 C28 44 24 45 22 43" stroke="#1A202C" stroke-width="2" stroke-linecap="round" fill="none"/>
<path d="M28 42 C28 44 32 45 34 43" stroke="#1A202C" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`;

export const MARK_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

/** Category accent colours (app/design-tokens.css --cat-*), as hex for images. */
export const CATEGORY_HEX: Record<BusinessCategory, string> = {
  GROOMING: "#D6457F",
  VET_CLINIC: "#0E8A8C",
  PET_HOTEL: "#6A56D6",
  DOG_TRAINING: "#E8731E",
  PET_SHOP: "#2B74D1",
  PET_SITTING: "#1E9A62",
};
