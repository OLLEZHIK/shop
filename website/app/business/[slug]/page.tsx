import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBusinessBySlug,
  averageRating,
  publicDescription,
  searchBusinesses,
  getPriceTierMap,
} from "@/lib/data";
import { CATEGORY_LABELS, categorySlugFromEnum } from "@/lib/categories";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PartnerBadge } from "@/components/PartnerBadge";
import { QuickActions } from "@/components/QuickActions";
import { ReviewForm } from "@/components/ReviewForm";
import { AmbientBackground } from "@/components/AmbientBackground";
import { PhotoGallery } from "@/components/PhotoGallery";
import { BusinessCard, StarRow } from "@/components/BusinessCard";
import { CONTACT_EMAIL } from "@/lib/site";

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
  const title = `${business.name} - ${CATEGORY_LABELS[business.category]}${locationBit ? ` in ${locationBit}` : ""}`;
  const description = `Contact details, prices and reviews for ${business.name}${locationBit ? ` in ${locationBit}` : ""}.`;
  return {
    title,
    description,
    openGraph: { title, description },
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

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-8">
      <AmbientBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-4xl">{business.name}</h1>
        <PartnerBadge featured={business.featured} />
      </div>

      <p className="mt-1 text-foreground/70">
        {CATEGORY_LABELS[business.category]}
        {" · "}
        {business.address}
        {business.district ? `, ${business.district.name}` : ""}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <VerifiedBadge verifiedAt={business.verifiedAt} />
        {rating !== null && (
          <a href="#reviews" className="flex items-center gap-1.5 hover:opacity-80">
            <StarRow rating={rating} />
            <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
            <span className="text-sm text-foreground/60 underline decoration-dotted">
              ({business.reviews.length} reviews)
            </span>
          </a>
        )}
      </div>

      <div className="mt-6">
        <PhotoGallery photoUrls={business.photoUrls} alt={business.name} variant="detail" />
      </div>

      <div className="mt-6">
        <QuickActions
          businessId={business.id}
          phone={business.phone}
          website={business.website}
          address={business.address}
        />
      </div>

      {(description || business.animals.length > 0 || business.specialties.length > 0 || hasOpeningHours(business.openingHours)) && (
        <section className="mt-10 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold text-foreground">About</h2>

          {description && <p className="mt-2 text-foreground/80">{description}</p>}

          {business.animals.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {business.animals.map((animal) => (
                <span key={animal} className="rounded-[var(--radius-pill)] bg-gray-100 px-2.5 py-1 text-xs capitalize text-foreground/70">
                  {animal}
                </span>
              ))}
            </div>
          )}

          {business.specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {business.specialties.map((specialty) => (
                <span key={specialty} className="rounded-[var(--radius-pill)] bg-brand-blue-muted px-2.5 py-1 text-xs text-brand-blue">
                  {specialty}
                </span>
              ))}
            </div>
          )}

          {hasOpeningHours(business.openingHours) && (
            <dl className="mt-4 space-y-1 text-sm">
              {Object.entries(business.openingHours as Record<string, string>).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <dt className="text-foreground/60">{day}</dt>
                  <dd className="text-foreground">{hours}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      {business.priceItems.length > 0 && (
        <section className="mt-6 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold text-foreground">Prices</h2>
          <ul className="mt-2 divide-y divide-gray-100">
            {business.priceItems.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-sm">
                <span className="text-foreground/70">{item.sizeClass ?? "Standard"}</span>
                <span className="font-medium text-foreground">
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

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-foreground">Location</h2>
        <div className="mt-2 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
          <iframe
            title={`Map showing ${business.name}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section id="reviews" className="mt-10 scroll-mt-6">
        <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
        {business.reviews.length === 0 ? (
          <p className="mt-2 text-foreground/60">No reviews yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {[...business.reviews]
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((review) => (
                <li key={review.id} className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{review.authorName}</span>
                    <StarRow rating={review.rating} />
                  </div>
                  <p className="mt-1 text-foreground/80">{review.comment}</p>
                  <p className="mt-1 text-xs text-foreground/50">
                    {review.createdAt.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </li>
              ))}
          </ul>
        )}

        <div className="mt-6">
          <h3 className="font-medium text-foreground">Leave a review</h3>
          <div className="mt-2">
            <ReviewForm businessId={business.id} />
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">Similar nearby</h2>
          <div className="mt-4 space-y-4">
            {similar.map((b) => (
              <BusinessCard key={b.id} business={b} priceTier={priceTiers.get(b.id) ?? null} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-10 border-t border-gray-200 pt-4 text-sm text-foreground/60">
        {(business.verifiedAt || sourceUrl) && (
          <p>
            {business.verifiedAt &&
              `Info verified: ${business.verifiedAt.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}`}
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
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Report an issue: ${business.name}`)}`}
          className="mt-1 inline-block hover:underline"
        >
          Report an issue
        </a>
      </footer>
    </main>
  );
}

function hasOpeningHours(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length > 0;
}
