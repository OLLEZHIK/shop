import Link from "next/link";
import type { City } from "@prisma/client";
import { ALL_CATEGORIES, CATEGORY_THEME, categoryBlurb, categoryLabel, listingPath } from "@/lib/categories";
import { NONSTOP_SEGMENT } from "@/lib/districts";
import { getDictionary, inCity, localePath, type Locale } from "@/lib/i18n";
import { Breadcrumbs } from "./Breadcrumbs";
import { CategoryIcon } from "./CategoryIcon";
import { ArrowRightIcon } from "./icons";

// City hub (/city/<slug>/): one indexable page per city linking to its
// six service lists - the entry point for "pet services <city>" searches
// and for the footer's city list (docs/architecture/multi-city.md).
export function CityHub({
  locale,
  city,
  counts,
  nonstopCount,
}: {
  locale: Locale;
  city: City;
  counts: Record<string, number>;
  nonstopCount: number;
}) {
  const t = getDictionary(locale);
  const where = inCity(locale, city);

  return (
    <main>
      <section className="under-header relative overflow-hidden border-b border-line">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 md:pt-10">
          <Breadcrumbs items={[{ label: t.listing.home, href: localePath(locale, "/") }, { label: city.name }]} />
          <h1 className="mt-6 text-3xl font-extrabold text-foreground md:text-5xl">
            {t.cityHub.h1Before} <span className="text-foreground/40">{where.split(" ")[0]}</span>{" "}
            {where.split(" ").slice(1).join(" ")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-foreground/65">{t.cityHub.intro}</p>
          {nonstopCount > 0 && (
            <Link
              href={listingPath(locale, "VET_CLINIC", city.slug, NONSTOP_SEGMENT)}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
            >
              {t.cityHub.nonstop}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-10 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={listingPath(locale, category, city.slug)}
            className="group flex items-start gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
            style={{ "--accent": CATEGORY_THEME[category].accent } as React.CSSProperties}
          >
            <span className="accent-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <CategoryIcon category={category} className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-lg font-bold text-foreground group-hover:text-brand-blue">
                {categoryLabel(category, locale)}
              </span>
              <span className="mt-0.5 block text-sm text-foreground/60">{categoryBlurb(category, locale)}</span>
              <span className="mt-2 block text-sm font-semibold text-foreground/70">
                {t.home.places(counts[category] ?? 0)}
              </span>
            </span>
            <ArrowRightIcon className="mt-1 h-5 w-5 shrink-0 text-foreground/25 transition group-hover:translate-x-0.5 group-hover:text-brand-blue" />
          </Link>
        ))}
      </section>
    </main>
  );
}
