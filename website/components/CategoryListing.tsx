import type { BusinessCategory } from "@prisma/client";
import {
  searchBusinesses,
  getCategoryAggregates,
  getAllDistricts,
  getPriceTierMap,
} from "@/lib/data";
import { CATEGORY_LABELS, CATEGORY_LABELS_SINGULAR } from "@/lib/categories";
import { BusinessCard } from "./BusinessCard";
import { FilterPanel } from "./FilterPanel";
import { EmptyState } from "./EmptyState";
import { Breadcrumbs } from "./Breadcrumbs";

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
  const [businesses, aggregates, districts, priceTiers] = await Promise.all([
    searchBusinesses({ category, citySlug, districtSlug, animal }),
    getCategoryAggregates(category, districtSlug),
    getAllDistricts(),
    getPriceTierMap(category),
  ]);

  const categoryLabel = CATEGORY_LABELS[category];
  const locationLabel = districtName ? `${districtName}, ${cityName}` : cityName;
  const resetHref = districtSlug ? `/${categorySlug}/${citySlug}/${districtSlug}/` : `/${categorySlug}/${citySlug}/`;

  const faqs = buildFaqs({ category, categoryLabel, locationLabel, aggregates });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: cityName, href: `/${categorySlug}/${citySlug}/` },
          { label: categoryLabel, href: `/${categorySlug}/${citySlug}/` },
          ...(districtName ? [{ label: districtName }] : []),
        ]}
      />

      <h1 className="mt-3 text-2xl font-bold text-foreground md:text-4xl">
        {categoryLabel} in {locationLabel}
      </h1>

      <p className="mt-2 text-foreground/70">
        Browse {aggregates.count} {aggregates.count === 1 ? CATEGORY_LABELS_SINGULAR[category] : categoryLabel.toLowerCase()} in {locationLabel}, checked and kept up to date.
      </p>

      <div className="mt-6">
        <FilterPanel
          categorySlug={categorySlug}
          citySlug={citySlug}
          districts={districts}
          currentDistrictSlug={districtSlug}
          currentAnimal={animal}
          hasPriceData={aggregates.priceFrom !== null}
          priceFrom={aggregates.priceFrom}
          priceTo={aggregates.priceTo}
          currency={aggregates.currency}
        />
      </div>

      <div className="mt-6 space-y-4">
        {businesses.length === 0 ? (
          <EmptyState resetHref={resetHref} />
        ) : (
          businesses.map((business) => (
            <BusinessCard key={business.id} business={business} priceTier={priceTiers.get(business.id) ?? null} />
          ))
        )}
      </div>

      {faqs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">Frequently asked questions</h2>
          <dl className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-medium text-foreground">{faq.question}</dt>
                <dd className="mt-1 text-foreground/70">{faq.answer}</dd>
              </div>
            ))}
          </dl>
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
    </main>
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
