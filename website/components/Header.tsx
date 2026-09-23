import Link from "next/link";
import { getDefaultCity } from "@/lib/data";
import { ALL_CATEGORY_SLUGS, CATEGORY_LABELS, CATEGORY_THEME, categoryEnumFromSlug } from "@/lib/categories";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export async function Header() {
  const city = await getDefaultCity();
  const citySlug = city?.slug ?? "";

  const links = ALL_CATEGORY_SLUGS.map((slug) => {
    const category = categoryEnumFromSlug(slug)!;
    return {
      href: `/${slug}/${citySlug}/`,
      label: CATEGORY_LABELS[category],
      category,
      blurb: CATEGORY_THEME[category].blurb,
      accent: CATEGORY_THEME[category].accent,
    };
  });

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="pawenn home" className="flex shrink-0 items-center">
          <Logo className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-0.5 text-sm lg:flex" aria-label="Categories">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="pill-hover px-3 py-1.5 font-medium text-foreground/75">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/how-it-works/"
            className="pill-hover hidden px-3 py-1.5 text-sm font-medium text-foreground/75 sm:inline-flex"
          >
            How it works
          </Link>
          <Link
            href="/add-or-fix-listing/"
            className="hidden rounded-[var(--radius-pill)] bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue md:inline-flex"
          >
            List your business
          </Link>
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
