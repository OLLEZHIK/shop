import Link from "next/link";
import type { BusinessCategory } from "@prisma/client";
import {
  searchBusinesses,
  getCategoryAggregates,
  getAllDistricts,
  getPriceTierMap,
  getDistrictCounts,
  distanceKm,
  parseNear,
} from "@/lib/data";
import {
  ALL_CATEGORIES,
  CATEGORY_THEME,
  categoryBlurb,
  categoryLabel,
  categorySingular,
  listingPath,
} from "@/lib/categories";
import { getDictionary, inCity, localePath, type Locale } from "@/lib/i18n";
import { animalsForService, isAnimal } from "@/lib/animals";
import { BusinessCard } from "./BusinessCard";
import { FilterPanel } from "./FilterPanel";
import { EmptyState } from "./EmptyState";
import { Breadcrumbs } from "./Breadcrumbs";
import { CategoryIcon } from "./CategoryIcon";
import { AnimalIcon } from "./AnimalIcon";
import { ArrowRightIcon, RouteIcon } from "./icons";

interface CategoryListingProps {
  locale: Locale;
  category: BusinessCategory;
  citySlug: string;
  cityName: string;
  districtSlug?: string;
  districtName?: string;
  animal?: string;
  near?: string;
}

/** "in Bratislava" / "v Bratislave", or "Petržalka, Bratislava" for a district. */
export function whereLabel(locale: Locale, citySlug: string, cityName: string, districtName?: string): string {
  if (!districtName) return inCity(locale, citySlug, cityName);
  return locale === "en" ? `in ${districtName}, ${cityName}` : `– ${districtName}, ${cityName}`;
}

export async function CategoryListing({
  locale,
  category,
  citySlug,
  cityName,
  districtSlug,
  districtName,
  near,
  animal: requestedAnimal,
}: CategoryListingProps) {
  // Ignore a pet this service isn't for (e.g. ?animal=bird on dog training).
  const animal =
    isAnimal(requestedAnimal) && animalsForService(category).includes(requestedAnimal) ? requestedAnimal : undefined;
  // With a pet filter we still load the whole list: most places haven't
  // told us every pet they cater for yet (Business.animals is mostly just
  // dog/cat), so an unconfirmed place is shown in a second, clearly
  // labelled group instead of vanishing from an empty result.
  const [all, aggregates, districts, priceTiers, districtCounts] = await Promise.all([
    searchBusinesses({ category, citySlug, districtSlug }),
    getCategoryAggregates(category, districtSlug),
    getAllDistricts(),
    getPriceTierMap(category),
    getDistrictCounts(category),
  ]);

  const t = getDictionary(locale);
  const label = categoryLabel(category, locale);
  const theme = CATEGORY_THEME[category];
  const where = whereLabel(locale, citySlug, cityName, districtName);
  const resetHref = listingPath(locale, category, citySlug, districtSlug);
  const symbol = aggregates.currency === "EUR" ? "€" : aggregates.currency;
  const listedDistricts = districtCounts.filter((d) => d.count > 0);

  // "Near me": sort by distance from the visitor, places without
  // coordinates last (in their usual daily order).
  const origin = parseNear(near);
  const found = animal ? all.filter((b) => b.animals.includes(animal)) : all;
  const unconfirmed = animal ? all.filter((b) => !b.animals.includes(animal)) : [];
  const toItem = (b: (typeof all)[number]) => ({
    business: b,
    km: origin && b.lat !== null && b.lng !== null ? distanceKm(origin.lat, origin.lng, b.lat, b.lng) : null,
  });
  const byDistance = (a: { km: number | null }, b: { km: number | null }) => (a.km ?? Infinity) - (b.km ?? Infinity);
  const withDistance = found.map(toItem);
  const unconfirmedItems = unconfirmed.map(toItem);
  if (origin) unconfirmedItems.sort(byDistance);
  if (origin) withDistance.sort(byDistance);

  const faqs = buildFaqs({ locale, category, where, aggregates });
  const countLabel = aggregates.count === 1 ? categorySingular(category, locale) : label.toLowerCase();

  return (
    <main style={{ "--accent": theme.accent } as React.CSSProperties}>
      {/* ---------- Header band ---------- */}
      <section className="under-header relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full opacity-[0.14] blur-3xl"
          style={{ background: theme.accent }}
        />
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 md:pb-10 md:pt-10">
          <Breadcrumbs
            items={[
              { label: t.listing.home, href: localePath(locale, "/") },
              { label, href: listingPath(locale, category, citySlug) },
              ...(districtName ? [{ label: districtName }] : [{ label: cityName }]),
            ]}
          />

          <div className="mt-6 flex items-start gap-4">
            <span className="accent-solid hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-[var(--shadow-card)] sm:flex">
              <CategoryIcon category={category} className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground md:text-5xl">
                {label} <span className="text-foreground/40">{where.split(" ")[0]}</span>{" "}
                {where.split(" ").slice(1).join(" ")}
              </h1>
              <p className="mt-2 text-lg text-foreground/65">
                {t.listing.browseCount(aggregates.count, countLabel, where)} {categoryBlurb(category, locale)}.
              </p>
            </div>
          </div>

          <dl className="mt-6 flex flex-wrap gap-2">
            <Stat label={t.listing.listed} value={String(aggregates.count)} />
            {aggregates.verifiedCount > 0 && <Stat label={t.listing.verified} value={String(aggregates.verifiedCount)} />}
            {aggregates.priceFrom !== null && (
              <Stat
                label={t.listing.priceRange}
                value={
                  aggregates.priceTo && aggregates.priceTo !== aggregates.priceFrom
                    ? `${symbol}${aggregates.priceFrom}–${symbol}${aggregates.priceTo}`
                    : `${t.listing.from} ${symbol}${aggregates.priceFrom}`
                }
              />
            )}
            {!districtName && listedDistricts.length > 0 && (
              <Stat label={t.listing.districts} value={String(listedDistricts.length)} />
            )}
          </dl>

          {/* Switch service, keep the location */}
          <nav aria-label={t.listing.otherServices} className="-mx-4 mt-6 overflow-x-auto px-4 [scrollbar-width:none]">
            <ul className="flex gap-2">
              {ALL_CATEGORIES.map((other) => {
                const active = other === category;
                return (
                  <li key={other} className="shrink-0">
                    <Link
                      href={listingPath(locale, other, citySlug, districtSlug)}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3.5 py-2 text-sm font-medium transition ${
                        active
                          ? "accent-solid border-transparent"
                          : "border-line bg-surface text-foreground/70 hover:border-brand-blue-muted-border hover:text-brand-blue"
                      }`}
                    >
                      <CategoryIcon category={other} className="h-4 w-4" />
                      {categoryLabel(other, locale)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <FilterPanel
            locale={locale}
            category={category}
            citySlug={citySlug}
            cityName={cityName}
            districts={districts}
            currentDistrictSlug={districtSlug}
            currentAnimal={animal}
            near={origin ? near : undefined}
          />

          <p className="mt-6 flex items-center gap-1.5 text-sm text-foreground/60">
            {origin && <RouteIcon className="h-4 w-4 text-brand-blue" />}
            {animal ? t.listing.confirmedFor(found.length, t.animals[animal]) : t.listing.results(found.length)}
            {unconfirmed.length > 0 ? ` · ${t.listing.moreToCheck(unconfirmed.length)}` : ""} ·{" "}
            {origin ? t.listing.nearest : t.listing.fairTurn}
          </p>

          <div className="mt-3 space-y-4">
            {found.length === 0 && unconfirmed.length === 0 ? (
              <EmptyState resetHref={resetHref} locale={locale} />
            ) : (
              withDistance.map(({ business, km }) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  priceTier={priceTiers.get(business.id) ?? null}
                  locale={locale}
                  distanceKm={km}
                />
              ))
            )}
          </div>

          {animal && unconfirmedItems.length > 0 && (
            <section className="mt-10">
              <div className="rounded-[var(--radius-card)] border border-dashed border-brand-amber/50 bg-brand-amber/5 p-5">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
                  <AnimalIcon animal={animal} className="h-5 w-5 text-brand-amber" />
                  {t.listing.unconfirmedTitle(t.animals[animal])}
                </h2>
                <p className="mt-1 text-sm text-foreground/70">{t.listing.unconfirmedBody}</p>
              </div>
              <div className="mt-4 space-y-4">
                {unconfirmedItems.map(({ business, km }) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    priceTier={priceTiers.get(business.id) ?? null}
                    locale={locale}
                    distanceKm={km}
                  />
                ))}
              </div>
            </section>
          )}

          {faqs.length > 0 && (
            <section className="mt-16">
              <p className="eyebrow">{t.listing.goodToKnow}</p>
              <h2 className="mt-2 text-2xl font-extrabold text-foreground md:text-3xl">{t.listing.faqTitle}</h2>
              <div className="mt-6 space-y-3">
                {faqs.map((faq, i) => (
                  <details
                    key={faq.question}
                    open={i === 0}
                    className="group rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-foreground">
                      {faq.question}
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-foreground/60 transition group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-foreground/70">{faq.answer}</p>
                  </details>
                ))}
              </div>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    inLanguage: locale,
                    mainEntity: faqs.map((faq) => ({
                      "@type": "Question",
                      name: faq.question,
                      acceptedAnswer: { "@type": "Answer", text: faq.answer },
                    })),
                  }),
                }}
              />
            </section>
          )}
        </div>

        {/* ---------- Sidebar ---------- */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {listedDistricts.length > 0 && (
            <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
              <h2 className="font-heading text-base font-bold text-foreground">{t.listing.byDistrict}</h2>
              <ul className="mt-3 space-y-0.5">
                <li>
                  <DistrictLink
                    href={listingPath(locale, category, citySlug)}
                    label={t.listing.allOf(cityName)}
                    count={listedDistricts.reduce((acc, d) => acc + d.count, 0)}
                    active={!districtSlug}
                  />
                </li>
                {listedDistricts.map((d) => (
                  <li key={d.slug}>
                    <DistrictLink
                      href={listingPath(locale, category, citySlug, d.slug)}
                      label={d.name}
                      count={d.count}
                      active={d.slug === districtSlug}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-[var(--radius-card)] bg-ink p-5 text-white">
            <h2 className="font-heading text-base font-bold">{t.listing.missingTitle}</h2>
            <p className="mt-1.5 text-sm text-white/70">{t.listing.missingBody}</p>
            <Link
              href="/add-or-fix-listing/"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:underline"
            >
              {t.listing.missingLink}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-[var(--radius-pill)] bg-surface px-4 py-2 shadow-[var(--shadow-card)]">
      <dd className="font-heading font-extrabold text-foreground">{value}</dd>
      <dt className="text-sm text-foreground/60">{label}</dt>
    </div>
  );
}

function DistrictLink({ href, label, count, active }: { href: string; label: string; count: number; active: boolean }) {
  return (
    <Link
      href={href}
      // Next 16 re-prefetches a child of the current [category]/[city]
      // route behind the proxy.ts rewrite in an endless loop (hundreds of
      // requests per second); these links load on click instead.
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between rounded-[var(--radius-control)] px-3 py-2 text-sm transition ${
        active ? "accent-soft font-semibold" : "text-foreground/75 hover:bg-surface-sunken hover:text-foreground"
      }`}
    >
      {label}
      <span className={active ? "" : "text-foreground/45"}>{count}</span>
    </Link>
  );
}

interface Faq {
  question: string;
  answer: string;
}

// FAQ generated from real aggregates (docs/design-plan.md section 8.3),
// in the page's language.
function buildFaqs({
  locale,
  category,
  where,
  aggregates,
}: {
  locale: Locale;
  category: BusinessCategory;
  where: string;
  aggregates: Awaited<ReturnType<typeof getCategoryAggregates>>;
}): Faq[] {
  const t = getDictionary(locale).listing;
  const faqs: Faq[] = [];
  const label = categoryLabel(category, locale).toLowerCase();
  const singular = categorySingular(category, locale);

  if (aggregates.count > 0) {
    faqs.push({
      question: t.faqCount(label, where),
      answer: t.faqCountAnswer(aggregates.count, singular, where),
    });
  }

  if (aggregates.priceFrom !== null) {
    const symbol = aggregates.currency === "EUR" ? "€" : aggregates.currency;
    const range =
      aggregates.priceTo && aggregates.priceTo !== aggregates.priceFrom
        ? `${symbol}${aggregates.priceFrom}–${symbol}${aggregates.priceTo}`
        : `${t.from} ${symbol}${aggregates.priceFrom}`;
    faqs.push({ question: t.faqPrice(singular, where, label), answer: t.faqPriceAnswer(range) });
  }

  if (aggregates.count > 0) {
    const pct = Math.round((aggregates.verifiedCount / aggregates.count) * 100);
    faqs.push({
      question: t.faqVerified(label, where),
      answer:
        aggregates.verifiedCount > 0
          ? t.faqVerifiedAnswer(aggregates.verifiedCount, aggregates.count, pct)
          : t.faqNoneVerified,
    });
  }

  return faqs;
}
