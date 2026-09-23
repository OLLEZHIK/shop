import Link from "next/link";
import type { BusinessWithRelations } from "@/lib/data";
import { averageRating, publicDescription } from "@/lib/data";
import { CATEGORY_LABELS, CATEGORY_THEME } from "@/lib/categories";
import { VerifiedBadge } from "./VerifiedBadge";
import { PartnerBadge } from "./PartnerBadge";
import { QuickActions } from "./QuickActions";
import { PhotoGallery } from "./PhotoGallery";
import { BusinessAvatar } from "./BusinessAvatar";
import { ArrowRightIcon, CatIcon, DogIcon, MapPinIcon } from "./icons";

interface BusinessCardProps {
  business: BusinessWithRelations;
  priceTier?: number | null;
}

export function BusinessCard({ business, priceTier = null }: BusinessCardProps) {
  const rating = averageRating(business.reviews);
  const description = publicDescription(business.notes);
  const accent = CATEGORY_THEME[business.category].accent;
  const hasPhotos = business.photoUrls.length > 0;

  return (
    <article
      className="group relative flex gap-4 rounded-[var(--radius-card)] border border-transparent bg-surface p-4 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-brand-blue-muted-border hover:shadow-[var(--shadow-card-hover)] sm:gap-5 sm:p-5"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <Link href={`/business/${business.slug}/`} className="absolute inset-0 z-0 rounded-[var(--radius-card)]" aria-label={business.name} />

      {hasPhotos ? (
        <PhotoGallery
          photoUrls={business.photoUrls}
          alt={business.name}
          variant="card"
          className="pointer-events-none w-24 shrink-0 self-start sm:w-36"
        />
      ) : (
        <BusinessAvatar name={business.name} category={business.category} className="h-14 w-14 shrink-0 text-lg sm:h-16 sm:w-16" />
      )}

      <div className="pointer-events-none relative z-10 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
              {CATEGORY_LABELS[business.category]}
            </p>
            <h3 className="mt-0.5 font-heading text-lg font-bold leading-snug text-foreground transition group-hover:text-brand-blue md:text-xl">
              {business.name}
            </h3>
          </div>
          <ArrowRightIcon className="mt-1 hidden h-5 w-5 shrink-0 text-foreground/25 transition group-hover:translate-x-0.5 group-hover:text-brand-blue sm:block" />
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/65">
          {business.district && (
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              {business.district.name}
            </span>
          )}
          {rating !== null && (
            <span className="inline-flex items-center gap-1">
              <StarRow rating={rating} />
              <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
              <span>({business.reviews.length})</span>
            </span>
          )}
          {priceTier !== null && (
            <span aria-label={`Price level ${priceTier} of 5`}>
              <span className="font-semibold text-brand-green">{"€".repeat(priceTier)}</span>
              <span className="text-foreground/25">{"€".repeat(5 - priceTier)}</span>
            </span>
          )}
          {business.animals.map((animal) => {
            const Icon = animal === "dog" ? DogIcon : animal === "cat" ? CatIcon : null;
            return (
              <span
                key={animal}
                className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-surface-sunken px-2 py-0.5 text-xs capitalize text-foreground/70"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {animal}
              </span>
            );
          })}
        </div>

        {description && <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{description}</p>}

        {(business.verifiedAt || business.featured) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <VerifiedBadge verifiedAt={business.verifiedAt} />
            <PartnerBadge featured={business.featured} />
          </div>
        )}

        <div className="pointer-events-auto mt-4">
          <QuickActions
            businessId={business.id}
            phone={business.phone}
            website={business.website}
            address={business.address}
            size="sm"
          />
        </div>
      </div>
    </article>
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
