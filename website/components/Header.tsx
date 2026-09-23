import Link from "next/link";
import { getDefaultCity } from "@/lib/data";
import { ALL_CATEGORY_SLUGS, CATEGORY_LABELS, CATEGORY_THEME, categoryEnumFromSlug } from "@/lib/categories";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { BrowseMenu } from "./BrowseMenu";

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
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <Link href="/" aria-label="pawenn home" className="flex shrink-0 items-center">
          <Logo className="h-9 w-auto md:h-10" />
        </Link>

        {/* Zocdoc-style: Browse dropdown, plain text links, a divider,
            then one bright primary button. No log in / sign up - the
            product has no accounts (PRODUCT.md). */}
        <nav className="hidden items-center gap-2 lg:flex" aria-label="Main">
          <BrowseMenu links={links} />
          <Link
            href="/how-it-works/"
            className="inline-flex h-12 items-center rounded-[var(--radius-control)] px-5 text-[17px] font-medium text-foreground transition hover:bg-surface-sunken"
          >
            Help
          </Link>
          <Link
            href="/add-or-fix-listing/"
            className="inline-flex h-12 items-center rounded-[var(--radius-control)] px-5 text-[17px] font-medium text-foreground transition hover:bg-surface-sunken"
          >
            List your business on pawenn
          </Link>
          <span aria-hidden="true" className="mx-3 h-8 w-px bg-foreground/15" />
          <Link
            href="/#search"
            className="inline-flex h-12 items-center rounded-[var(--radius-control)] bg-brand-orange px-7 text-[17px] font-semibold text-white transition hover:bg-brand-orange-deep"
          >
            Find pet care
          </Link>
        </nav>

        <MobileMenu links={links} />
      </div>
    </header>
  );
}
