import { getDictionary, type Locale } from "@/lib/i18n";

/** The currency's own sign: € for EUR, $ for USD, Kč for CZK. */
function currencySign(locale: Locale, currency: string): string {
  try {
    return (
      new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(0).find((p) => p.type === "currency")
        ?.value ?? currency
    );
  } catch {
    return currency;
  }
}

// Price level 1-5 against the same category in the same city
// (lib/data.ts, getPriceTierMap), shown as filled and faded signs.
export function PriceTier({
  tier,
  currency,
  locale,
  className = "",
}: {
  tier: number;
  currency: string | null | undefined;
  locale: Locale;
  className?: string;
}) {
  const sign = currencySign(locale, currency ?? "EUR");
  const label = getDictionary(locale).card.priceLevel(tier);
  return (
    <span role="img" aria-label={label} title={label} className={className}>
      <span className="font-semibold text-brand-green">{sign.repeat(tier)}</span>
      <span className="text-foreground/25">{sign.repeat(5 - tier)}</span>
    </span>
  );
}
