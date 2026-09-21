import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusinessBySlug, averageRating } from "@/lib/data";
import { CATEGORY_LABELS, categorySlugFromEnum } from "@/lib/categories";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PartnerBadge } from "@/components/PartnerBadge";
import { QuickActions } from "@/components/QuickActions";
import { ReviewForm } from "@/components/ReviewForm";

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
    <main className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{business.name}</h1>
        <PartnerBadge featured={business.featured} />
      </div>

      <p className="mt-1 text-foreground/70">{CATEGORY_LABELS[business.category]}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <VerifiedBadge verifiedAt={business.verifiedAt} />
        {rating !== null && (
          <span className="text-sm font-medium text-foreground">
            {rating.toFixed(1)} <span className="text-foreground/60">({business.reviews.length} reviews)</span>
          </span>
        )}
      </div>

      <p className="mt-4 text-foreground/80">
        {business.address}
        {business.district ? `, ${business.district.name}` : ""}
      </p>

      <div className="mt-4">
        <QuickActions
          businessId={business.id}
          phone={business.phone}
          website={business.website}
          address={business.address}
        />
      </div>

      {business.animals.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {business.animals.map((animal) => (
            <span key={animal} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize text-foreground/70">
              {animal}
            </span>
          ))}
        </div>
      )}

      {business.photoUrls.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3">
          {business.photoUrls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt={business.name} className="aspect-square w-full rounded-lg object-cover" />
          ))}
        </div>
      )}

      {business.priceItems.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">Prices</h2>
          <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200">
            {business.priceItems.map((item) => (
              <li key={item.id} className="flex justify-between px-4 py-2 text-sm">
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

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
        {business.reviews.length === 0 ? (
          <p className="mt-2 text-foreground/60">No reviews yet.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {[...business.reviews]
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((review) => (
                <li key={review.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{review.authorName}</span>
                    <span className="text-sm text-foreground/60">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
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
          href={`mailto:{EMAIL}?subject=${encodeURIComponent(`Report an issue: ${business.name}`)}`}
          className="mt-1 inline-block hover:underline"
        >
          Report an issue
        </a>
      </footer>
    </main>
  );
}
