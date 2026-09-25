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

// The business's own logo on a white tile when we have one (collected
// from its official site), otherwise its initials on a category-tinted
// tile - honest, no stock photo pretending to be the place. The category
// icon sits as a small corner badge either way.
export function BusinessAvatar({
  name,
  category,
  logoUrl = null,
  className,
}: {
  name: string;
  category: BusinessCategory;
  logoUrl?: string | null;
  className?: string;
}) {
  const accent = CATEGORY_THEME[category].accent;
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center rounded-2xl font-heading font-extrabold ${
        logoUrl ? "bg-white ring-1 ring-line" : ""
      } ${className ?? ""}`}
      style={
        logoUrl
          ? undefined
          : {
              background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 16%, white), color-mix(in srgb, ${accent} 30%, white))`,
              color: accent,
            }
      }
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- small static logos, mixed SVG/PNG/WebP
        <img src={logoUrl} alt="" loading="lazy" className="h-[78%] w-[78%] rounded-lg object-contain" />
      ) : (
        initialsFor(name)
      )}
      <span
        className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-surface"
        style={{ background: accent }}
      >
        <CategoryIcon category={category} className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}
