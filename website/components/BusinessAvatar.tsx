import type { BusinessCategory } from "@prisma/client";
import { CATEGORY_THEME } from "@/lib/categories";
import { CategoryIcon } from "./CategoryIcon";

// Generic words that make poor initials ("Psí salón X" -> "X").
const STOP_WORDS = new Set([
  "psi", "psí", "salon", "salón", "pre", "psov", "a", "&",
  "veterinarna", "veterinárna", "ambulancia", "klinika", "mvdr.", "mvdr", "s.r.o.", "-", "–",
]);

function initialsFor(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const meaningful = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
  const source = meaningful.length > 0 ? meaningful : words;
  return source
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Stand-in when a business has no photos: its initials on a
// category-tinted tile with the category icon as a small corner badge.
// Honest (no stock photo pretending to be the place), still scannable.
export function BusinessAvatar({
  name,
  category,
  className,
}: {
  name: string;
  category: BusinessCategory;
  className?: string;
}) {
  const accent = CATEGORY_THEME[category].accent;
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center rounded-2xl font-heading font-extrabold ${className ?? ""}`}
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 16%, white), color-mix(in srgb, ${accent} 30%, white))`,
        color: accent,
      }}
    >
      {initialsFor(name)}
      <span
        className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-surface"
        style={{ background: accent }}
      >
        <CategoryIcon category={category} className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}
