import Link from "next/link";
import type { BusinessWithRelations } from "@/lib/data";
import { averageRating } from "@/lib/data";
import { CATEGORY_LABELS } from "@/lib/categories";
import { VerifiedBadge } from "./VerifiedBadge";
import { PartnerBadge } from "./PartnerBadge";
import { QuickActions } from "./QuickActions";

const CATEGORY_ICON: Record<string, string> = {
  GROOMING: "✂️",
  VET_CLINIC: "🩺",
  PET_HOTEL: "🏨",
  PET_SHOP: "🛒",
  DOG_TRAINING: "🎓",
  PET_SITTING: "🐾",
};

export function BusinessCard({ business }: { business: BusinessWithRelations }) {
  const rating = averageRating(business.reviews);
  const cheapestPrice =
    business.priceItems.length > 0
      ? Math.min(...business.priceItems.map((p) => Number(p.priceFrom)))
      : null;
  const currency = business.priceItems[0]?.currency ?? "EUR";

  return (
    <div className="relative flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link
        href={`/business/${business.slug}/`}
        className="absolute inset-0 z-0"
        aria-label={business.name}
      />

      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-3xl md:h-20 md:w-20">
        {CATEGORY_ICON[business.category] ?? "🐾"}
      </div>

      <div className="relative z-10 min-w-0 flex-1 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-foreground md:text-lg">{business.name}</h3>
          {business.district && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-foreground/70">
              {business.district.name}
            </span>
          )}
        </div>

        <p className="mt-0.5 text-xs text-foreground/60">{CATEGORY_LABELS[business.category]}</p>

        {rating !== null && (
          <p className="mt-1 text-sm font-medium text-foreground">
            {rating.toFixed(1)} <span className="text-foreground/60">({business.reviews.length})</span>
          </p>
        )}

        {business.animals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {business.animals.map((animal) => (
              <span
                key={animal}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-foreground/70"
              >
                {animal}
              </span>
            ))}
          </div>
        )}

        {cheapestPrice !== null && (
          <p className="mt-1.5 text-sm text-foreground/80">
            from {formatPrice(cheapestPrice, currency)}
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

function formatPrice(amount: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency;
  return `${symbol}${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
}
