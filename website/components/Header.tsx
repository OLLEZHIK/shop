import Link from "next/link";
import { getDefaultCity } from "@/lib/data";
import { ALL_CATEGORY_SLUGS, CATEGORY_LABELS, categoryEnumFromSlug } from "@/lib/categories";

export async function Header() {
  const city = await getDefaultCity();
  const citySlug = city?.slug ?? "";

  return (
    <header className="relative bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" aria-label="pawenn home" className="flex items-center">
          <svg viewBox="0 0 320 80" className="h-9 w-auto" role="img" aria-label="pawenn">
            <g transform="translate(18, 12)">
              <ellipse cx="28" cy="30" rx="22" ry="20" fill="#F7F9FB" stroke="#004E89" strokeWidth="2" />
              <path d="M12 16 C4 18 3 32 10 40 C14 43 18 38 17 28 C16 22 14 16 12 16 Z" fill="#004E89" />
              <path
                d="M13 21 C9 22.5 8.5 31 12 35.5 C14 37 15.5 34.5 15 29 C14.7 25.5 14 22 13 21 Z"
                fill="#F7F9FB"
                opacity="0.35"
              />
              <path d="M44 16 C52 18 53 32 46 40 C42 43 38 38 39 28 C40 22 42 16 44 16 Z" fill="#FF6B35" />
              <path
                d="M43 21 C47 22.5 47.5 31 44 35.5 C42 37 40.5 34.5 41 29 C41.3 25.5 42 22 43 21 Z"
                fill="#F7F9FB"
                opacity="0.35"
              />
              <circle cx="20.5" cy="23" r="2.2" fill="#1A202C" />
              <circle cx="35.5" cy="23" r="2.2" fill="#1A202C" />
              <path
                d="M17 19 Q20.5 17 24 19"
                stroke="#004E89"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M32 19 Q35.5 17 39 19"
                stroke="#FF6B35"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M22 32 C22 30 34 30 34 32 C34 34.5 30 38.5 28 38.5 C26 38.5 22 34.5 22 32 Z"
                fill="#1A202C"
              />
              <ellipse cx="25.5" cy="32.3" rx="1.6" ry="1" fill="#F7F9FB" opacity="0.6" />
              <path
                d="M28 38.5 V42 C28 44 24 45 22 43"
                stroke="#1A202C"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M28 42 C28 44 32 45 34 43"
                stroke="#1A202C"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <text
              x="88"
              y="52"
              fontFamily="system-ui, -apple-system, 'Inter', sans-serif"
              fontSize="34"
              fontWeight="800"
              fill="#004E89"
              letterSpacing="-0.5"
            >
              Paw<tspan fill="#FF6B35">enn</tspan>
            </text>
          </svg>
        </Link>

        <nav className="hidden gap-1 text-sm md:flex" aria-label="Categories">
          {ALL_CATEGORY_SLUGS.map((slug) => {
            const category = categoryEnumFromSlug(slug)!;
            return (
              <Link
                key={slug}
                href={`/${slug}/${citySlug}/`}
                className="pill-hover px-3 py-1.5 text-foreground/80"
              >
                {CATEGORY_LABELS[category]}
              </Link>
            );
          })}
          <Link href="/how-it-works/" className="pill-hover px-3 py-1.5 text-foreground/80">
            How it Works
          </Link>
        </nav>
      </div>
    </header>
  );
}
