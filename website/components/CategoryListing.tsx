import Link from "next/link";
import type { BusinessCategory, City } from "@prisma/client";
import {
  searchBusinesses,
  getCategoryAggregates,
  getPriceTierMap,
  getAttributeCounts,
  getAnimalsInCategory,
  distanceKm,
  parseNear,
  getMarketPrices,
} from "@/lib/data";
import {
  ALL_CATEGORIES,
  CATEGORY_THEME,
  categoryBlurb,
  categoryLabel,
  categoryPlural, categorySingular,
  businessPath,
  cityPath,
  listingPath,
} from "@/lib/categories";
import { getDictionary, inCity, localePath, type Locale } from "@/lib/i18n";
import { ANIMALS, animalsForService, isAnimal } from "@/lib/animals";
import { BusinessCard } from "./BusinessCard";
import { SITE_URL } from "@/lib/site";
import { pricesPath } from "@/lib/priceSlugs";
import { FilterPanel } from "./FilterPanel";
import { CATEGORY_ATTRIBUTES, attributePath, attributeSlug, hasAttribute, type AttributeKey } from "@/lib/attributePages";
import { cityTimezone, hoursFromStored, isOpenAt, localNow } from "@/lib/hours";
import { meetsMinRating, parseMinRating, parseSort, sortByListing } from "@/lib/listingSort";
import { EmptyState } from "./EmptyState";
import { Breadcrumbs } from "./Breadcrumbs";
import { CategoryIcon } from "./CategoryIcon";
import { AnimalIcon } from "./AnimalIcon";
import { ArrowRightIcon, PawIcon, RouteIcon } from "./icons";

interface CategoryListingProps {
  locale: Locale;
  /** null: the city page (/city/<slug>/) listing every service. */
  category: BusinessCategory | null;
  city: City;
  districtSlug?: string;
  districtName?: string;
  /** District.inPhrases: "v Petržalke" for Slovak texts. */
  districtInPhrases?: unknown;
  animal?: string;
  near?: string;
  sort?: string;
  rating?: string;
  /** "1" = only places open right now (their opening hours, city time). */
  open?: string;
  /** An attribute page (/<vets>/<city>/nonstop, /sobota...): only places
   *  with the attribute (lib/attributePages.ts). */
  attributePage?: AttributeKey;
}

/** "in Bratislava" / "v Bratislave" (city.json in_city), or
 *  "in Petržalka, Bratislava" / "– Petržalka, Bratislava" for a district. */
/** "in Bratislava" / "v Petržalke, Bratislava": the district's own phrase
 *  from districts.geojson (District.inPhrases) when there is one. */
export function whereLabel(
  locale: Locale,
  city: City,
  district?: { name: string; inPhrases?: unknown } | null
): string {
  if (!district) return inCity(locale, city);
  const phrase = (district.inPhrases as Record<string, string> | null | undefined)?.[locale];
  if (phrase) return `${phrase}, ${city.name}`;
  return locale === "en" ? `in ${district.name}, ${city.name}` : `– ${district.name}, ${city.name}`;
}

export async function CategoryListing({
  locale,
  category,
  city,
  districtSlug,
  districtName,
  districtInPhrases,
  near,
  animal: requestedAnimal,
  sort: requestedSort,
  rating: requestedRating,
  open,
  attributePage,
}: CategoryListingProps) {
  const openNowOnly = open === "1";
  const citySlug = city.slug;
  const cityName = city.name;
  const sort = parseSort(requestedSort);
  const minRating = parseMinRating(requestedRating);
  // Ignore a pet this service isn't for (e.g. ?animal=bird on dog training).
  const servicePets: readonly string[] = category ? animalsForService(category) : ANIMALS;
  const animal = isAnimal(requestedAnimal) && servicePets.includes(requestedAnimal) ? requestedAnimal : undefined;
  // With a pet filter we still load the whole list: most places haven't
  // told us every pet they cater for yet (Business.animals is mostly just
  // dog/cat), so an unconfirmed place is shown in a second, clearly
  // labelled group instead of vanishing from an empty result.
  // The city page (no category) lists every service; tiers still compare
  // each place with its own category.
  const [all, categoryAggregates, priceTiers, attributeCounts, categoryAnimals] = await Promise.all([
    searchBusinesses({ category: category ?? undefined, citySlug, districtSlug }),
    category ? getCategoryAggregates(category, citySlug, districtSlug) : Promise.resolve(null),
    category
      ? getPriceTierMap(category, citySlug)
      : Promise.all(ALL_CATEGORIES.map((c) => getPriceTierMap(c, citySlug))).then(
          (maps) => new Map(maps.flatMap((m) => [...m]))
        ),
    // The city page offers only the nonstop chip; a category all of its own.
    getAttributeCounts(category ?? "VET_CLINIC", citySlug),
    category ? getAnimalsInCategory(category, citySlug) : Promise.resolve(null),
  ]);
  const hasPricePages = category ? (await getMarketPrices(category, citySlug)).size > 0 : false;
  const aggregates = categoryAggregates ?? {
    count: all.length,
    verifiedCount: all.filter((b) => b.verifiedAt !== null).length,
    priceFrom: null,
    priceTo: null,
    currency: city.currency ?? "EUR",
  };
  const animalsPresent = categoryAnimals ?? [...new Set(all.flatMap((b) => b.animals))];

  const t = getDictionary(locale);
  const label = category ? categoryLabel(category, locale) : t.cityHub.h1Before;
  const accent = category ? CATEGORY_THEME[category].accent : "var(--brand-orange)";
  const where = whereLabel(locale, city, districtName ? { name: districtName, inPhrases: districtInPhrases } : null);
  const resetHref = category ? listingPath(locale, category, citySlug, districtSlug) : cityPath(locale, citySlug);

  // "Near me": sort by distance from the visitor, places without
  // coordinates last (in their usual daily order).
  const origin = parseNear(near);
  // Rating filter first (Google rating as collected), then the pet split.
  // Open now: judged in the city's time zone at request time; a nonstop
  // clinic counts as open; places without hours are hidden and counted.
  const cityNow = localNow(cityTimezone(city));
  const openState = (b: (typeof all)[number]) => (b.emergency247 ? true : isOpenAt(hoursFromStored(b.openingHours), cityNow));
  const scoped = attributePage ? all.filter((b) => hasAttribute(b, attributePage)) : all;
  const openFiltered = openNowOnly ? scoped.filter((b) => openState(b) === true) : scoped;
  const hiddenNoHours = openNowOnly ? scoped.filter((b) => openState(b) === null).length : 0;
  const rated = openFiltered.filter((b) => meetsMinRating(b, minRating));
  const hiddenUnrated = minRating ? openFiltered.filter((b) => b.googleRating === null).length : 0;
  const found = animal ? rated.filter((b) => b.animals.includes(animal)) : rated;
  const unconfirmed = animal ? rated.filter((b) => !b.animals.includes(animal)) : [];
  const toItem = (b: (typeof all)[number]) => ({
    business: b,
    km: origin && b.lat !== null && b.lng !== null ? distanceKm(origin.lat, origin.lng, b.lat, b.lng) : null,
  });
  const byDistance = (a: { km: number | null }, b: { km: number | null }) => (a.km ?? Infinity) - (b.km ?? Infinity);
  const withDistance = found.map(toItem);
  const unconfirmedItems = unconfirmed.map(toItem);
  // An explicit sort wins over "near me" ordering (distance stays shown).
  const ordered = <T extends { business: (typeof all)[number]; km: number | null }>(items: T[]) =>
    sort ? sortByListing(items, sort, (i) => i.business) : origin ? [...items].sort(byDistance) : items;
  const listItems = ordered(withDistance);
  const unconfirmedList = ordered(unconfirmedItems);

  // Attribute chips (quiet, like the other filters; the one of the current
  // page is active and links back to the whole list). City page: nonstop only.
  const chipCategory = category ?? "VET_CLINIC";
  const attributeChips = (category ? (CATEGORY_ATTRIBUTES[category] ?? []) : (["nonstop"] as AttributeKey[]))
    .filter((key) => key === attributePage || (attributeCounts.get(key) ?? 0) > 0)
    .map((key) => ({
      key,
      label: t.attributes[key].chip,
      active: key === attributePage,
      href: key === attributePage ? listingPath(locale, chipCategory, citySlug) : attributePath(locale, chipCategory, citySlug, key),
    }));

  // Attribute pages get no category FAQ: its answers (how many clinics,
  // price range) are about all vets, not the ones with the attribute, and repeat the
  // category page.
  const faqs = category && !attributePage ? buildFaqs({ locale, category, where, aggregates }) : [];

  return (
    <main style={{ "--accent": accent } as React.CSSProperties}>
      {/* The places on this page, in the order shown (SEO audit T15). */}
      {listItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              numberOfItems: listItems.length,
              itemListElement: listItems.map((item, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: item.business.name,
                url: `${SITE_URL}${businessPath(locale, item.business.slug)}`,
              })),
            }),
          }}
        />
      )}
      {/* ---------- Header band ---------- */}
      <section className="under-header relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full opacity-[0.14] blur-3xl"
          style={{ background: accent }}
        />
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 md:pb-10 md:pt-10">
          <Breadcrumbs
            items={[
              { label: t.listing.home, href: localePath(locale, "/") },
              // City hub: the city is the page itself.
              ...(category ? [{ label: cityName, href: cityPath(locale, citySlug) }] : [{ label: cityName }]),
              ...(category
                ? attributePage || districtName
                  ? [{ label, href: listingPath(locale, category, citySlug) }]
                  : [{ label }]
                : []),
              ...(attributePage ? [{ label: t.attributes[attributePage].chip }] : districtName ? [{ label: districtName }] : []),
            ]}
          />

          <div className="mt-6 flex items-start gap-4">
            <span className="accent-solid hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-[var(--shadow-card)] sm:flex">
              {category ? <CategoryIcon category={category} className="h-7 w-7" /> : <PawIcon className="h-7 w-7" />}
            </span>
            <div>
              {attributePage ? (
                <>
                  <h1 className="text-3xl font-extrabold text-foreground md:text-5xl">{t.attributes[attributePage].h1(where)}</h1>
                  {/* The answer in one sentence: n of all places (docs/seo/README.md 2.3). */}
                  <p className="mt-2 text-lg text-foreground/65">{t.attributes[attributePage].lead(scoped.length, all.length)}</p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-extrabold text-foreground md:text-5xl">
                    {label} <span className="text-foreground/40">{where.split(" ")[0]}</span>{" "}
                    {where.split(" ").slice(1).join(" ")}
                  </h1>
                  <p className="mt-2 text-lg text-foreground/65">
                    {category
                      ? `${t.listing.browseCount(
                          aggregates.count,
                          aggregates.count === 1 ? categorySingular(category, locale) : categoryPlural(category, locale),
                          where
                        )} ${categoryBlurb(category, locale)}.`
                      : t.cityHub.intro}
                  </p>
                </>
              )}
            </div>
          </div>

          <dl className="mt-6 flex flex-wrap gap-2">
            <Stat label={t.listing.listed} value={String(attributePage ? scoped.length : aggregates.count)} />
            {aggregates.verifiedCount > 0 && <Stat label={t.listing.verified} value={String(aggregates.verifiedCount)} />}
            {/* The city's price pages for this category, once any service
                has a market price (lib/pricePages.ts). */}
            {category && hasPricePages && (
              <Link
                href={pricesPath(locale, category, citySlug)}
                prefetch={false}
                className="inline-flex items-center gap-1.5 self-center rounded-[var(--radius-pill)] border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-brand-blue hover:border-brand-blue"
              >
                {t.prices.linkFromListing(inCity(locale, city))} →
              </Link>
            )}
          </dl>

          {/* Switch service, keep the location */}
          {/* Wraps on phones: all six services stay visible, no hidden
              sideways scroll. */}
          <nav aria-label={t.listing.otherServices} className="mt-6">
            <ul className="flex flex-wrap gap-2">
              <li className="shrink-0">
                <Link
                  href={cityPath(locale, citySlug)}
                  aria-current={category ? undefined : "page"}
                  className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3.5 py-2 text-sm font-medium transition ${
                    category
                      ? "border-line bg-surface text-foreground/70 hover:border-brand-blue-muted-border hover:text-brand-blue"
                      : "accent-solid border-transparent"
                  }`}
                >
                  <PawIcon className="h-4 w-4" />
                  {t.listing.allServices}
                </Link>
              </li>
              {ALL_CATEGORIES.map((other) => {
                const active = other === category;
                return (
                  <li key={other} className="shrink-0">
                    <Link
                      href={listingPath(locale, other, citySlug)}
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
            currentDistrictSlug={attributePage ? attributeSlug(attributePage, locale) : districtSlug}
            currentAnimal={animal}
            near={origin ? near : undefined}
            sort={sort}
            minRating={minRating}
            openNow={openNowOnly}
            showOpenNow={openNowOnly || all.some((b) => b.emergency247 || b.openingHours !== null)}
            attributes={attributeChips}
            animals={servicePets.filter((a) => a === animal || animalsPresent.includes(a))}
          />

          <p className="mt-6 flex items-center gap-1.5 text-sm text-foreground/60">
            {origin && <RouteIcon className="h-4 w-4 text-brand-blue" />}
            {animal ? t.listing.confirmedFor(found.length, t.animals[animal]) : t.listing.results(found.length)}
            {unconfirmed.length > 0 ? ` · ${t.listing.moreToCheck(unconfirmed.length)}` : ""}
            {hiddenUnrated > 0 ? ` · ${t.listing.hiddenUnrated(hiddenUnrated)}` : ""}
            {hiddenNoHours > 0 ? ` · ${t.listing.hiddenNoHours(hiddenNoHours)}` : ""} ·{" "}
            {sort === "rating"
              ? t.listing.ratingFirst
              : sort === "reviews"
                ? t.listing.reviewsFirst
                : origin
                  ? t.listing.nearest
                  : t.listing.fairTurn}
          </p>

          <div className="mt-3 space-y-4">
            {found.length === 0 && unconfirmed.length === 0 ? (
              <EmptyState resetHref={resetHref} locale={locale} />
            ) : (
              listItems.map(({ business, km }) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  priceTier={priceTiers.get(business.id) ?? null}
                  locale={locale}
                  distanceKm={km}
                  showCategory={!category}
                />
              ))
            )}
          </div>

          {animal && unconfirmedList.length > 0 && (
            <section className="mt-10">
              <div className="rounded-[var(--radius-card)] border border-dashed border-brand-amber/50 bg-brand-amber/5 p-5">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
                  <AnimalIcon animal={animal} className="h-5 w-5 text-brand-amber" />
                  {t.listing.unconfirmedTitle(t.animals[animal])}
                </h2>
                <p className="mt-1 text-sm text-foreground/70">{t.listing.unconfirmedBody}</p>
              </div>
              <div className="mt-4 space-y-4">
                {unconfirmedList.map(({ business, km }) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    priceTier={priceTiers.get(business.id) ?? null}
                    locale={locale}
                    distanceKm={km}
                    showCategory={!category}
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
          <div className="rounded-[var(--radius-card)] bg-ink p-5 text-white">
            <h2 className="font-heading text-base font-bold">{t.listing.missingTitle}</h2>
            <p className="mt-1.5 text-sm text-white/70">{t.listing.missingBody}</p>
            <Link
              href="/en/add-or-fix-listing/"
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
  const label = categoryPlural(category, locale);
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

  // Only asked once something is verified: "none are verified" next to
  // listings reads as a contradiction (SEO audit, 2026-09-24).
  if (aggregates.verifiedCount > 0) {
    const pct = Math.round((aggregates.verifiedCount / aggregates.count) * 100);
    faqs.push({
      question: t.faqVerified(label, where),
      answer: t.faqVerifiedAnswer(aggregates.verifiedCount, aggregates.count, pct),
    });
  }

  return faqs;
}
