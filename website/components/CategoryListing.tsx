import type { BusinessCategory } from "@prisma/client";
import Link from "next/link";
import {
  searchBusinesses,
  getCategoryAggregates,
  getAllDistricts,
  getPriceTierMap,
  getDistrictCounts,
} from "@/lib/data";
import {
  ALL_CATEGORY_SLUGS,
  CATEGORY_LABELS,
  CATEGORY_LABELS_SINGULAR,
  CATEGORY_THEME,
  categoryEnumFromSlug,
} from "@/lib/categories";
import { BusinessCard } from "./BusinessCard";
import { FilterPanel } from "./FilterPanel";
import { EmptyState } from "./EmptyState";
import { Breadcrumbs } from "./Breadcrumbs";
import { CategoryIcon } from "./CategoryIcon";
import { ArrowRightIcon } from "./icons";

interface CategoryListingProps {
  category: BusinessCategory;
  categorySlug: string;
  citySlug: string;
  cityName: string;
  districtSlug?: string;
  districtName?: string;
  animal?: string;
}

export async function CategoryListing({
  category,
  categorySlug,
  citySlug,
  cityName,
  districtSlug,
  districtName,
  animal,
}: CategoryListingProps) {
  const [businesses, aggregates, districts, priceTiers, districtCounts] = await Promise.all([
    searchBusinesses({ category, citySlug, districtSlug, animal }),
    getCategoryAggregates(category, districtSlug),
    getAllDistricts(),
    getPriceTierMap(category),
    getDistrictCounts(category),
  ]);

  const categoryLabel = CATEGORY_LABELS[category];
  const theme = CATEGORY_THEME[category];
  const locationLabel = districtName ? `${districtName}, ${cityName}` : cityName;
  const resetHref = districtSlug ? `/${categorySlug}/${citySlug}/${districtSlug}/` : `/${categorySlug}/${citySlug}/`;
  const symbol = aggregates.currency === "EUR" ? "€" : aggregates.currency;
  const listedDistricts = districtCounts.filter((d) => d.count > 0);

  const faqs = buildFaqs({ category, categoryLabel, locationLabel, aggregates });

  return (
    <main style={{ "--accent": theme.accent } as React.CSSProperties}>
      {/* ---------- Header band ---------- */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full opacity-[0.14] blur-3xl"
          style={{ background: theme.accent }}
        />
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 md:pb-10 md:pt-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: categoryLabel, href: `/${categorySlug}/${citySlug}/` },
              ...(districtName ? [{ label: districtName }] : [{ label: cityName }]),
            ]}
          />

          <div className="mt-6 flex items-start gap-4">
            <span className="accent-solid hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-[var(--shadow-card)] sm:flex">
              <CategoryIcon category={category} className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground md:text-5xl">
                {categoryLabel} <span className="text-foreground/40">in</span> {locationLabel}
              </h1>
              <p className="mt-2 text-lg text-foreground/65">{theme.blurb} - checked and kept up to date.</p>
            </div>
          </div>

          <dl className="mt-6 flex flex-wrap gap-2">
            <Stat label="listed" value={String(aggregates.count)} />
            {aggregates.verifiedCount > 0 && <Stat label="verified" value={String(aggregates.verifiedCount)} />}
            {aggregates.priceFrom !== null && (
              <Stat
                label="price range"
                value={
                  aggregates.priceTo && aggregates.priceTo !== aggregates.priceFrom
                    ? `${symbol}${aggregates.priceFrom}–${symbol}${aggregates.priceTo}`
                    : `from ${symbol}${aggregates.priceFrom}`
                }
              />
            )}
            {!districtName && listedDistricts.length > 0 && (
              <Stat label="districts" value={String(listedDistricts.length)} />
            )}
          </dl>

          {/* Switch service, keep the location */}
          <nav aria-label="Other services" className="-mx-4 mt-6 overflow-x-auto px-4 [scrollbar-width:none]">
            <ul className="flex gap-2">
              {ALL_CATEGORY_SLUGS.map((slug) => {
                const other = categoryEnumFromSlug(slug)!;
                const active = other === category;
                return (
                  <li key={slug} className="shrink-0">
                    <Link
                      href={districtSlug ? `/${slug}/${citySlug}/${districtSlug}/` : `/${slug}/${citySlug}/`}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3.5 py-2 text-sm font-medium transition ${
                        active
                          ? "border-transparent accent-solid"
                          : "border-line bg-surface text-foreground/70 hover:border-brand-blue-muted-border hover:text-brand-blue"
                      }`}
                    >
                      <CategoryIcon category={other} className="h-4 w-4" />
                      {CATEGORY_LABELS[other]}
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
            categorySlug={categorySlug}
            citySlug={citySlug}
            cityName={cityName}
            districts={districts}
            currentDistrictSlug={districtSlug}
            currentAnimal={animal}
          />

          <p className="mt-6 text-sm text-foreground/60">
            {businesses.length} {businesses.length === 1 ? "result" : "results"}
            {animal ? ` for ${animal}s` : ""} · order changes daily so everyone gets a fair turn
          </p>

          <div className="mt-3 space-y-4">
            {businesses.length === 0 ? (
              <EmptyState resetHref={resetHref} />
            ) : (
              businesses.map((business) => (
                <BusinessCard key={business.id} business={business} priceTier={priceTiers.get(business.id) ?? null} />
              ))
            )}
          </div>

          {faqs.length > 0 && (
            <section className="mt-16">
              <p className="eyebrow">Good to know</p>
              <h2 className="mt-2 text-2xl font-extrabold text-foreground md:text-3xl">Frequently asked questions</h2>
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
              <h2 className="font-heading text-base font-bold text-foreground">By district</h2>
              <ul className="mt-3 space-y-0.5">
                <li>
                  <DistrictLink
                    href={`/${categorySlug}/${citySlug}/`}
                    label={`All of ${cityName}`}
                    count={listedDistricts.reduce((acc, d) => acc + d.count, 0)}
                    active={!districtSlug}
                  />
                </li>
                {listedDistricts.map((d) => (
                  <li key={d.slug}>
                    <DistrictLink
                      href={`/${categorySlug}/${citySlug}/${d.slug}/`}
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
            <h2 className="font-heading text-base font-bold">Know a place we&apos;re missing?</h2>
            <p className="mt-1.5 text-sm text-white/70">Tell us about it, or flag details that look out of date.</p>
            <Link
              href="/add-or-fix-listing/"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:underline"
            >
              Add or fix a listing
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

function buildFaqs({
  category,
  categoryLabel,
  locationLabel,
  aggregates,
}: {
  category: BusinessCategory;
  categoryLabel: string;
  locationLabel: string;
  aggregates: Awaited<ReturnType<typeof getCategoryAggregates>>;
}): Faq[] {
  const faqs: Faq[] = [];
  const singular = CATEGORY_LABELS_SINGULAR[category];

  if (aggregates.count > 0) {
    faqs.push({
      question: `How many ${categoryLabel.toLowerCase()} are there in ${locationLabel}?`,
      answer: `There are currently ${aggregates.count} listed ${singular}${aggregates.count === 1 ? "" : "s"} in ${locationLabel}.`,
    });
  }

  if (aggregates.priceFrom !== null) {
    const symbol = aggregates.currency === "EUR" ? "€" : aggregates.currency;
    const range =
      aggregates.priceTo && aggregates.priceTo !== aggregates.priceFrom
        ? `${symbol}${aggregates.priceFrom}–${symbol}${aggregates.priceTo}`
        : `from ${symbol}${aggregates.priceFrom}`;
    faqs.push({
      question: `How much does ${singular} cost in ${locationLabel}?`,
      answer: `Prices among listed businesses range ${range}, based on published price lists.`,
    });
  }

  if (aggregates.count > 0) {
    const pct = Math.round((aggregates.verifiedCount / aggregates.count) * 100);
    faqs.push({
      question: `Which ${categoryLabel.toLowerCase()} in ${locationLabel} are verified?`,
      answer:
        aggregates.verifiedCount > 0
          ? `${aggregates.verifiedCount} out of ${aggregates.count} listings (${pct}%) have had their details manually verified.`
          : `None of the current listings have been manually verified yet.`,
    });
  }

  return faqs;
}
