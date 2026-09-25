import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBusinessBySlug,
  averageRating,
  aboutDescription,
  logoUrl,
  searchBusinesses,
  getPriceTierMap,
  getMarketPrices,
  getDistrictSummaries,
} from "@/lib/data";
import { isDistrictLinkable } from "@/lib/districts";
import type { BusinessWithRelations } from "@/lib/data";
import { CATEGORY_THEME, businessPath, categoryLabel, categorySingular, listingPath } from "@/lib/categories";
import { formatDate as formatLocaleDate, getDictionary, localePath, inCity, localesForCity, type Locale } from "@/lib/i18n";
import { localeAlternates } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PartnerBadge } from "@/components/PartnerBadge";
import { QuickActions } from "@/components/QuickActions";
import { ReviewForm } from "@/components/ReviewForm";
import { AmbientBackground } from "@/components/AmbientBackground";
import { PhotoGallery } from "@/components/PhotoGallery";
import { BusinessCard, StarRow } from "@/components/BusinessCard";
import { BusinessAvatar } from "@/components/BusinessAvatar";
import { GoogleRating } from "@/components/GoogleRating";
import { ReviewInsightsSection } from "@/components/ReviewInsightsSection";
import { OpeningHoursTable } from "@/components/OpeningHoursTable";
import { OpenNowBadge } from "@/components/OpenNowBadge";
import { PriceTable } from "@/components/PriceTable";
import { cityTimezone, hoursFromStored } from "@/lib/hours";
import { specialtyLabel } from "@/lib/vet";
import { parseReviewInsights } from "@/lib/reviewInsights";
import {
  ArrowRightIcon,
  GlobeIcon,
  InstagramIcon,
  FacebookIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";
import { AnimalIcon } from "@/components/AnimalIcon";
import { PriceTier } from "./PriceTier";

// Business detail page, shared by /business/{slug}/ (English) and
// /{locale}/{localized segment}/{slug}/ (e.g. /sk/podnik/{slug}/).

function availableLocales(business: BusinessWithRelations): Locale[] {
  return localesForCity(business.city ?? business.district?.city);
}

export async function businessMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const business = await getBusinessBySlug(slug);
  if (!business || !availableLocales(business).includes(locale)) return {};

  const t = getDictionary(locale).business;
  const city = business.city ?? business.district?.city ?? null;
  const where = business.district && city
    ? `${locale === "en" ? "in" : "–"} ${business.district.name}, ${city.name}`
    : city
      ? inCity(locale, city)
      : "";
  return {
    title: t.metaTitle(business.name, categoryLabel(business.category, locale), where),
    description: t.metaDescription(business.name, where),
    alternates: localeAlternates(
      locale,
      Object.fromEntries(availableLocales(business).map((l) => [l, businessPath(l, business.slug)]))
    ),
  };
}

export async function BusinessDetail({ locale, slug }: { locale: Locale; slug: string }) {
  const business = await getBusinessBySlug(slug);
  if (!business || !availableLocales(business).includes(locale)) notFound();

  const t = getDictionary(locale);
  const label = categoryLabel(business.category, locale);
  const city = business.city ?? business.district?.city ?? null;
  const citySlug = city?.slug;
  const rating = averageRating(business.reviews);
  const sourceUrl = business.sourceUrls[0];
  const description = aboutDescription(business, locale);
  const insights = parseReviewInsights(business.reviewInsights);
  const timeZone = cityTimezone(business.city ?? business.district?.city);

  const [similarRaw, priceTiers, marketPrices, districtSummaries] = await Promise.all([
    citySlug ? searchBusinesses({ category: business.category, citySlug }) : Promise.resolve([]),
    getPriceTierMap(business.category, citySlug ?? ""),
    getMarketPrices(business.category, citySlug ?? ""),
    getDistrictSummaries(citySlug ?? ""),
  ]);
  const similar = similarRaw.filter((b) => b.id !== business.id).slice(0, 4);

  const mapQuery =
    business.lat !== null && business.lng !== null
      ? `${business.lat},${business.lng}`
      : `${business.address}${business.district ? `, ${business.district.name}` : ""}`;

  // "Psí salón v mestskej časti Ružinov, Bratislava": the district in
  // words, for people and for district searches (owner, 2026-09-25: no
  // district picker, districts live in texts). Linked to the district
  // page only when that page has enough places.
  const districtHref =
    business.district && citySlug && isDistrictLinkable(districtSummaries, business.district.slug, business.category)
      ? listingPath(locale, business.category, citySlug, business.district.slug)
      : null;

  const breadcrumbItems = [
    // Home -> category list -> district -> place. The city is part of
    // the category list's own title, so it doesn't get a crumb that would
    // point at the same URL as the category.
    { label: t.listing.home, href: localePath(locale, "/") },
    ...(citySlug
      ? [{ label, href: listingPath(locale, business.category, citySlug) }]
      : [{ label }]),
    ...(business.district && citySlug && isDistrictLinkable(districtSummaries, business.district.slug, business.category)
      ? [{ label: business.district.name, href: listingPath(locale, business.category, citySlug, business.district.slug) }]
      : []),
    { label: business.name },
  ];

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    url: `${SITE_URL}${businessPath(locale, business.slug)}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      ...(city ? { addressLocality: city.name, addressCountry: city.country } : {}),
      ...(business.district ? { addressRegion: business.district.name } : {}),
    },
  };
  if (business.phone) jsonLd.telephone = business.phone;
  if (business.website) jsonLd.sameAs = [business.website];
  if (business.lat !== null && business.lng !== null) {
    jsonLd.geo = { "@type": "GeoCoordinates", latitude: business.lat, longitude: business.lng };
  }
  if (business.verifiedAt) jsonLd.dateModified = business.verifiedAt.toISOString();
  if (business.reviews.length > 0 && rating !== null) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: business.reviews.length,
    };
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  const theme = CATEGORY_THEME[business.category];
  const hours = hoursFromStored(business.openingHours);
  const languages = business.languagesSpoken.map((code) => languageName(code, locale));
  const hasVetInfo = business.emergency247 || Boolean(business.emergencyNote) || business.homeVisits;
  const hasAbout =
    Boolean(business.district) ||
    Boolean(description) ||
    business.animals.length > 0 ||
    business.specialties.length > 0 ||
    hasVetInfo ||
    languages.length > 0 ||
    hours !== null;
  const formatDate = (d: Date) => formatLocaleDate(d, locale);

  return (
    <main className="relative" style={{ "--accent": theme.accent } as React.CSSProperties}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ---------- Header band ---------- */}
      <section className="under-header relative overflow-hidden border-b border-line">
        <AmbientBackground />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-96 w-96 rounded-full opacity-[0.16] blur-3xl"
          style={{ background: theme.accent }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 md:pb-10">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <BusinessAvatar
              name={business.name}
              category={business.category}
              logoUrl={logoUrl(business.logoFile)}
              className="h-20 w-20 shrink-0 text-2xl shadow-[var(--shadow-card)] md:h-24 md:w-24 md:text-3xl"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme.accent }}>
                {label}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-3xl font-extrabold text-foreground md:text-5xl">{business.name}</h1>
                <PartnerBadge featured={business.featured} locale={locale} />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-foreground/70">
                <MapPinIcon className="h-4 w-4 shrink-0" />
                {business.address}
                {business.district ? `, ${business.district.name}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <VerifiedBadge verifiedAt={business.verifiedAt} locale={locale} />
                {business.emergency247 && (
                  <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                    {t.business.nonstop}
                  </span>
                )}
                {!business.emergency247 && business.openingHours !== null && (
                  <OpenNowBadge
                    hours={business.openingHours}
                    timeZone={timeZone}
                    openLabel={t.business.openNow}
                    closedLabel={t.business.closedNow}
                  />
                )}
                {business.googleRating !== null && business.googleRatingCount !== null && (
                  <GoogleRating
                    rating={business.googleRating}
                    count={business.googleRatingCount}
                    locale={locale}
                    href={business.googleMapsUrl}
                    className="text-sm text-foreground/70"
                  />
                )}
                {priceTiers.has(business.id) && (
                  <PriceTier level={priceTiers.get(business.id)!} currency={city?.currency} locale={locale} className="text-sm" />
                )}
                {rating !== null && (
                  <a href="#reviews" className="flex items-center gap-1.5 hover:opacity-80">
                    <StarRow rating={rating} />
                    <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
                    <span className="text-sm text-foreground/60 underline decoration-dotted">
                      {t.business.reviewsCount(business.reviews.length)}
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-8 lg:grid-cols-[1fr_360px]">
        {/* ---------- Main column ---------- */}
        <div className="min-w-0 space-y-6">
          {business.photoUrls.length > 0 && (
            <PhotoGallery photoUrls={business.photoUrls} alt={business.name} variant="detail" />
          )}

          {/* Contact card inline on small screens; sticky sidebar on large */}
          <div className="lg:hidden">
            <ContactCard business={business} locale={locale} />
          </div>

          {/* Prices right after contact (owner, 2026-09-25): the price is what
              people come to compare, each row against the city median. */}
          <PriceTable items={business.priceItems} category={business.category} locale={locale} market={marketPrices} />

          {hasAbout && (
            <section className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-bold text-foreground">{t.business.about}</h2>

              {business.district && (
                <p className="mt-3 font-medium text-foreground">
                  {t.business.placeIn.before(categorySingular(business.category, locale))}
                  {districtHref ? (
                    <Link href={districtHref} prefetch={false} className="text-brand-blue hover:underline">
                      {business.district.name}
                    </Link>
                  ) : (
                    business.district.name
                  )}
                  , {city?.name}
                </p>
              )}
              {description && <p className="mt-3 text-foreground/80">{description}</p>}

              {hasVetInfo && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {business.emergency247 && (
                    <span className="rounded-[var(--radius-pill)] bg-red-600 px-3 py-1.5 text-sm font-semibold text-white">
                      {t.business.nonstop}
                    </span>
                  )}
                  {!business.emergency247 && business.emergencyNote && (
                    <span className="rounded-[var(--radius-pill)] bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-700">
                      {t.business.emergency}: {business.emergencyNote}
                    </span>
                  )}
                  {business.homeVisits && (
                    <span className="rounded-[var(--radius-pill)] bg-brand-blue-muted px-3 py-1.5 text-sm font-medium text-brand-blue">
                      {t.business.homeVisits}
                    </span>
                  )}
                </div>
              )}

              {languages.length > 0 && (
                <p className="mt-4 text-sm text-foreground/70">{t.business.languages(languages.join(", "))}</p>
              )}

              {business.animals.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">{t.business.welcomes}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {business.animals.map((animal) => (
                      <span
                        key={animal}
                        className="accent-soft inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5 text-sm font-medium"
                      >
                        <AnimalIcon animal={animal} className="h-4 w-4" />
                        {t.animalSingular[animal] ?? animal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {business.specialties.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">{t.business.specialties}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {business.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-[var(--radius-pill)] bg-brand-blue-muted px-3 py-1.5 text-sm text-brand-blue"
                      >
                        {specialtyLabel(specialty, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hours && (
                <div className="mt-5">
                  <OpeningHoursTable
                    hours={business.openingHours}
                    timeZone={timeZone}
                    locale={locale}
                    sourceUrl={business.hoursSourceUrl}
                    observedAt={business.hoursObservedAt}
                  />
                </div>
              )}
            </section>
          )}

          {insights && <ReviewInsightsSection insights={insights} locale={locale} />}

          <section className="overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3 p-6 pb-4">
              <h2 className="text-xl font-bold text-foreground">{t.business.location}</h2>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
              >
                {t.business.openInMaps}
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
            <iframe
              title={t.business.mapTitle(business.name)}
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              className="h-80 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>

          <section id="reviews" className="scroll-mt-24 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl font-bold text-foreground">{t.business.reviews}</h2>
              {rating !== null && (
                <p className="flex items-center gap-2">
                  <span className="font-heading text-3xl font-extrabold text-foreground">{rating.toFixed(1)}</span>
                  <span className="text-sm text-foreground/60">{t.business.fromN(business.reviews.length)}</span>
                </p>
              )}
            </div>
            {business.reviews.length === 0 ? (
              <p className="mt-3 text-foreground/60">{t.business.noReviews}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {[...business.reviews]
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((review) => (
                    <li key={review.id} className="rounded-[var(--radius-control)] bg-surface-sunken p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 font-semibold text-foreground">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange-muted text-sm text-brand-orange-deep">
                            {review.authorName.charAt(0).toUpperCase()}
                          </span>
                          {review.authorName}
                        </span>
                        <StarRow rating={review.rating} />
                      </div>
                      <p className="mt-2 text-foreground/80">{review.comment}</p>
                      <p className="mt-1 text-xs text-foreground/50">{formatDate(review.createdAt)}</p>
                    </li>
                  ))}
              </ul>
            )}

            <div className="mt-6 border-t border-line pt-6">
              <h3 className="font-semibold text-foreground">{t.business.leaveReview}</h3>
              <div className="mt-3">
                <ReviewForm businessId={business.id} locale={locale} />
              </div>
            </div>
          </section>

          <footer className="text-sm text-foreground/60">
            {(business.verifiedAt || sourceUrl) && (
              <p className="break-words">
                {business.verifiedAt && t.business.infoVerified(formatDate(business.verifiedAt))}
                {business.verifiedAt && sourceUrl ? ", " : ""}
                {sourceUrl && (
                  <>
                    {t.business.source}{" "}
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {sourceUrl}
                    </a>
                  </>
                )}
              </p>
            )}
            <a
              href={`mailto:{EMAIL}?subject=${encodeURIComponent(`Report an issue: ${business.name}`)}`}
              className="mt-1 inline-block hover:underline"
            >
              {t.business.reportIssue}
            </a>
          </footer>
        </div>

        {/* ---------- Sticky sidebar ---------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ContactCard business={business} locale={locale} />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{t.business.keepExploring}</p>
              <h2 className="mt-2 text-2xl font-extrabold text-foreground md:text-3xl">
                {t.business.moreNearby(label)}
              </h2>
            </div>
            {citySlug && (
              <Link
                href={listingPath(locale, business.category, citySlug)}
                className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline"
              >
                {t.business.seeAll}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {similar.map((b) => (
              <BusinessCard key={b.id} business={b} priceTier={priceTiers.get(b.id) ?? null} locale={locale} showCategory={false} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function ContactCard({ business, locale }: { business: BusinessWithRelations; locale: Locale }) {
  const t = getDictionary(locale).business;
  const websiteHost = business.website ? safeHost(business.website) : null;
  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-panel)] ring-1 ring-line">
      <h2 className="font-heading text-lg font-bold text-foreground">{t.getInTouch}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        {business.phone && (
          <ContactRow icon={<PhoneIcon className="h-4 w-4" />} label={t.phone}>
            <a href={`tel:${business.phone}`} className="font-medium text-foreground hover:text-brand-blue">
              {business.phone}
            </a>
          </ContactRow>
        )}
        {business.website && websiteHost && (
          <ContactRow icon={<GlobeIcon className="h-4 w-4" />} label={t.website}>
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-medium text-foreground hover:text-brand-blue"
            >
              {websiteHost}
            </a>
          </ContactRow>
        )}
        {business.instagram && (
          <ContactRow icon={<InstagramIcon className="h-4 w-4" />} label={t.instagram}>
            <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-foreground hover:text-brand-blue">
              {socialHandle(business.instagram)}
            </a>
          </ContactRow>
        )}
        {business.facebook && (
          <ContactRow icon={<FacebookIcon className="h-4 w-4" />} label={t.facebook}>
            <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-foreground hover:text-brand-blue">
              {socialHandle(business.facebook)}
            </a>
          </ContactRow>
        )}
        {business.email && (
          <ContactRow icon={<MailIcon className="h-4 w-4" />} label={t.email}>
            <a href={`mailto:${business.email}`} className="break-all font-medium text-foreground hover:text-brand-blue">
              {business.email}
            </a>
          </ContactRow>
        )}
        <ContactRow icon={<MapPinIcon className="h-4 w-4" />} label={t.address}>
          <span className="font-medium text-foreground">
            {business.address}
            {business.district ? `, ${business.district.name}` : ""}
          </span>
        </ContactRow>
      </dl>
      <div className="mt-5 border-t border-line pt-5">
        <QuickActions
          businessId={business.id}
          phone={business.phone}
          website={business.website}
          address={business.address}
          layout="grid"
          locale={locale}
        />
      </div>
      <p className="mt-4 text-xs text-foreground/50">{t.noFees}</p>
    </div>
  );
}

function ContactRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="accent-soft flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-foreground/50">{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}


/** "instagram.com/vetline_sk" style label for a social profile URL. */
function socialHandle(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return url;
  }
}

function languageName(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}
