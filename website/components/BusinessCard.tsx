import Link from "next/link";
import type { BusinessWithRelations } from "@/lib/data";
import { averageRating, publicDescription } from "@/lib/data";
import { CATEGORY_LABELS } from "@/lib/categories";
import { VerifiedBadge } from "./VerifiedBadge";
import { PartnerBadge } from "./PartnerBadge";
import { QuickActions } from "./QuickActions";
import { PhotoGallery } from "./PhotoGallery";

interface BusinessCardProps {
  business: BusinessWithRelations;
  priceTier?: number | null;
}

export function BusinessCard({ business, priceTier = null }: BusinessCardProps) {
  const rating = averageRating(business.reviews);
  const description = publicDescription(business.notes);

  return (
    <div className="group relative flex flex-col gap-4 rounded-[var(--radius-card)] border border-transparent bg-white p-4 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-brand-blue-muted-border hover:shadow-[var(--shadow-card-hover)] sm:flex-row">
      <Link href={`/business/${business.slug}/`} className="absolute inset-0 z-0" aria-label={business.name} />

      <PhotoGallery
        photoUrls={business.photoUrls}
        alt={business.name}
        variant="card"
        className="pointer-events-none w-full sm:w-32 sm:shrink-0 md:w-40"
      />

      <div className="relative z-10 min-w-0 flex-1 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-base font-bold text-foreground md:text-lg">{business.name}</h3>
          {business.district && (
            <span className="rounded-[var(--radius-pill)] bg-gray-100 px-2 py-0.5 text-xs text-foreground/70">
              {business.district.name}
            </span>
          )}
        </div>

        <p className="mt-0.5 text-xs text-foreground/60">{CATEGORY_LABELS[business.category]}</p>

        {rating !== null && (
          <div className="mt-1.5 flex items-center gap-1">
            <StarRow rating={rating} />
            <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
            <span className="text-sm text-foreground/60">({business.reviews.length})</span>
          </div>
        )}

        {description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-foreground/70">{description}</p>
        )}

        {business.animals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {business.animals.map((animal) => (
              <span
                key={animal}
                className="rounded-[var(--radius-pill)] bg-gray-100 px-2 py-0.5 text-xs capitalize text-foreground/70"
              >
                {animal}
              </span>
            ))}
          </div>
        )}

        {priceTier !== null && (
          <p className="mt-1.5 text-sm text-foreground/80" aria-label={`Price level ${priceTier} of 5`}>
            <span className="font-medium text-brand-green">{"$".repeat(priceTier)}</span>
            <span className="text-foreground/30">{"$".repeat(5 - priceTier)}</span>
          </p>
        )}

        <div className="pointer-events-auto mt-3">
          <QuickActions
            businessId={business.id}
            phone={business.phone}
            website={business.website}
            address={business.address}
            size="sm"
          />
        </div>

        <div className="pointer-events-none mt-2">
          <VerifiedBadge verifiedAt={business.verifiedAt} />{" "}
          <PartnerBadge featured={business.featured} />
        </div>
      </div>
    </div>
  );
}

export function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={n <= Math.round(rating) ? "var(--brand-amber)" : "#E5E7EB"}>
          <path d="M10 2.8 12.4 7.7 17.8 8.5 13.9 12.3 14.8 17.7 10 15.1 5.2 17.7 6.1 12.3 2.2 8.5 7.6 7.7 10 2.8Z" />
        </svg>
      ))}
    </span>
  );
}
