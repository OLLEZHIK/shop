import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBusinessBySlug,
  averageRating,
  publicDescription,
  searchBusinesses,
  getPriceTierMap,
} from "@/lib/data";
import type { BusinessWithRelations } from "@/lib/data";
import { CATEGORY_LABELS, CATEGORY_THEME, categorySlugFromEnum } from "@/lib/categories";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PartnerBadge } from "@/components/PartnerBadge";
import { QuickActions } from "@/components/QuickActions";
import { ReviewForm } from "@/components/ReviewForm";
import { AmbientBackground } from "@/components/AmbientBackground";
import { PhotoGallery } from "@/components/PhotoGallery";
import { BusinessCard, StarRow } from "@/components/BusinessCard";
import { BusinessAvatar } from "@/components/BusinessAvatar";
import {
  ArrowRightIcon,
  CatIcon,
  ClockIcon,
  DogIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PawIcon,
  PhoneIcon,
  TagIcon,
} from "@/components/icons";

interface PageParams {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) return {};

  const locationBit = business.district ? `${business.district.name}, ${business.district.city.name}` : "";
  return {
    title: `${business.name} - ${CATEGORY_LABELS[business.category]}${locationBit ? ` in ${locationBit}` : ""}`,
    description: `Contact details, prices and reviews for ${business.name}${locationBit ? ` in ${locationBit}` : ""}.`,
  };
}

export default async function BusinessPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const categorySlug = categorySlugFromEnum(business.category);
  const citySlug = business.district?.city.slug;
  const rating = averageRating(business.reviews);
  const sourceUrl = business.sourceUrls[0];
  const description = publicDescription(business.notes);

  const [similarRaw, priceTiers] = await Promise.all([
    citySlug ? searchBusinesses({ category: business.category, citySlug }) : Promise.resolve([]),
    getPriceTierMap(business.category),
  ]);
  const similar = similarRaw.filter((b) => b.id !== business.id).slice(0, 4);

  const mapQuery =
    business.lat !== null && business.lng !== null
      ? `${business.lat},${business.lng}`
      : `${business.address}${business.district ? `, ${business.district.name}` : ""}`;

  const breadcrumbItems = [
    ...(citySlug ? [{ label: business.district!.city.name, href: `/${categorySlug}/${citySlug}/` }] : []),
    ...(citySlug
      ? [{ label: CATEGORY_LABELS[business.category], href: `/${categorySlug}/${citySlug}/` }]
      : [{ label: CATEGORY_LABELS[business.category] }]),
    ...(business.district && citySlug
      ? [{ label: business.district.name, href: `/${categorySlug}/${citySlug}/${business.district.slug}/` }]
      : []),
    { label: business.name },
  ];

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      ...(business.district ? { addressLocality: business.district.city.name } : {}),
      ...(business.district ? { addressRegion: business.district.name } : {}),
      ...(business.district ? { addressCountry: business.district.city.country } : {}),
    },
  };
  if (business.phone) jsonLd.telephone = business.phone;
  if (business.website) jsonLd.url = business.website;
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
      ...(item.href ? { item: item.href } : {}),
    })),
  };

  const theme = CATEGORY_THEME[business.category];
  const hasAbout =
    Boolean(description) ||
    business.animals.length > 0 ||
    business.specialties.length > 0 ||
    hasOpeningHours(business.openingHours);
  const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });

  return (
    <main className="relative" style={{ "--accent": theme.accent } as React.CSSProperties}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ---------- Header band ---------- */}
      <section className="relative overflow-hidden border-b border-line">
        <AmbientBackground />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-96 w-96 rounded-full opacity-[0.16] blur-3xl"
          style={{ background: theme.accent }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 md:pb-10">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            {business.photoUrls.length === 0 && (
              <BusinessAvatar
                name={business.name}
                category={business.category}
                className="h-20 w-20 shrink-0 text-2xl shadow-[var(--shadow-card)] md:h-24 md:w-24 md:text-3xl"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme.accent }}>
                {CATEGORY_LABELS[business.category]}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-3xl font-extrabold text-foreground md:text-5xl">{business.name}</h1>
                <PartnerBadge featured={business.featured} />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-foreground/70">
                <MapPinIcon className="h-4 w-4 shrink-0" />
                {business.address}
                {business.district ? `, ${business.district.name}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <VerifiedBadge verifiedAt={business.verifiedAt} />
                {rating !== null && (
                  <a href="#reviews" className="flex items-center gap-1.5 hover:opacity-80">
                    <StarRow rating={rating} />
                    <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
                    <span className="text-sm text-foreground/60 underline decoration-dotted">
                      ({business.reviews.length} reviews)
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
            <ContactCard business={business} />
          </div>

          {hasAbout && (
            <section className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-bold text-foreground">About</h2>

              {description && <p className="mt-3 text-foreground/80">{description}</p>}

              {business.animals.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Welcomes</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {business.animals.map((animal) => {
                      const Icon = animal === "dog" ? DogIcon : animal === "cat" ? CatIcon : PawIcon;
                      return (
                        <span
                          key={animal}
                          className="accent-soft inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5 text-sm font-medium capitalize"
                        >
                          <Icon className="h-4 w-4" />
                          {animal}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {business.specialties.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Specialties</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {business.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-[var(--radius-pill)] bg-brand-blue-muted px-3 py-1.5 text-sm text-brand-blue"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasOpeningHours(business.openingHours) && (
                <div className="mt-5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                    <ClockIcon className="h-4 w-4" />
                    Opening hours
                  </p>
                  <dl className="mt-2 divide-y divide-line text-sm">
                    {Object.entries(business.openingHours as Record<string, string>).map(([day, hours]) => (
                      <div key={day} className="flex justify-between py-2">
                        <dt className="text-foreground/60">{day}</dt>
                        <dd className="font-medium text-foreground">{hours}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </section>
          )}

          {business.priceItems.length > 0 && (
            <section className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <TagIcon className="h-5 w-5 text-brand-green" />
                Prices
              </h2>
              <ul className="mt-3 divide-y divide-line">
                {business.priceItems.map((item) => (
                  <li key={item.id} className="flex justify-between py-2.5 text-sm">
                    <span className="capitalize text-foreground/70">{item.sizeClass?.toLowerCase() ?? "Standard"}</span>
                    <span className="font-semibold text-foreground">
                      {item.currency === "EUR" ? "€" : item.currency}
                      {String(item.priceFrom)}
                      {item.priceTo && String(item.priceTo) !== String(item.priceFrom)
                        ? `–${item.currency === "EUR" ? "€" : item.currency}${item.priceTo}`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3 p-6 pb-4">
              <h2 className="text-xl font-bold text-foreground">Location</h2>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
              >
                Open in Maps
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
            <iframe
              title={`Map showing ${business.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              className="h-80 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>

          <section id="reviews" className="scroll-mt-24 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl font-bold text-foreground">Reviews</h2>
              {rating !== null && (
                <p className="flex items-center gap-2">
                  <span className="font-heading text-3xl font-extrabold text-foreground">{rating.toFixed(1)}</span>
                  <span className="text-sm text-foreground/60">from {business.reviews.length}</span>
                </p>
              )}
            </div>
            {business.reviews.length === 0 ? (
              <p className="mt-3 text-foreground/60">No reviews yet - been here with your pet? Be the first.</p>
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
              <h3 className="font-semibold text-foreground">Leave a review</h3>
              <div className="mt-3">
                <ReviewForm businessId={business.id} />
              </div>
            </div>
          </section>

          <footer className="text-sm text-foreground/60">
            {(business.verifiedAt || sourceUrl) && (
              <p className="break-words">
                {business.verifiedAt && `Info verified: ${formatDate(business.verifiedAt)}`}
                {business.verifiedAt && sourceUrl ? ", " : ""}
                {sourceUrl && (
                  <>
                    source:{" "}
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
              Report an issue
            </a>
          </footer>
        </div>

        {/* ---------- Sticky sidebar ---------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ContactCard business={business} />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Keep exploring</p>
              <h2 className="mt-2 text-2xl font-extrabold text-foreground md:text-3xl">
                More {CATEGORY_LABELS[business.category].toLowerCase()} nearby
              </h2>
            </div>
            {citySlug && (
              <Link
                href={`/${categorySlug}/${citySlug}/`}
                className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline"
              >
                See all
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {similar.map((b) => (
              <BusinessCard key={b.id} business={b} priceTier={priceTiers.get(b.id) ?? null} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function ContactCard({ business }: { business: BusinessWithRelations }) {
  const websiteHost = business.website ? safeHost(business.website) : null;
  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-panel)] ring-1 ring-line">
      <h2 className="font-heading text-lg font-bold text-foreground">Get in touch</h2>
      <dl className="mt-4 space-y-3 text-sm">
        {business.phone && (
          <ContactRow icon={<PhoneIcon className="h-4 w-4" />} label="Phone">
            <a href={`tel:${business.phone}`} className="font-medium text-foreground hover:text-brand-blue">
              {business.phone}
            </a>
          </ContactRow>
        )}
        {business.website && websiteHost && (
          <ContactRow icon={<GlobeIcon className="h-4 w-4" />} label="Website">
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
        {business.email && (
          <ContactRow icon={<MailIcon className="h-4 w-4" />} label="Email">
            <a href={`mailto:${business.email}`} className="break-all font-medium text-foreground hover:text-brand-blue">
              {business.email}
            </a>
          </ContactRow>
        )}
        <ContactRow icon={<MapPinIcon className="h-4 w-4" />} label="Address">
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
        />
      </div>
      <p className="mt-4 text-xs text-foreground/50">Contact the business directly - pawenn takes no fees.</p>
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

function hasOpeningHours(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length > 0;
}
