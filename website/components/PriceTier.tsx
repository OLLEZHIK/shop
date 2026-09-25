import { getDictionary, type Locale } from "@/lib/i18n";
import type { PriceLevel } from "@/lib/priceMarket";

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

// Price level against the city market (lib/priceMarket.ts): € signs like
// Google Maps plus the words - "Market price", "40% above market" - so
// the signs mean something. `withLabel` off: signs only (tight spots).
export function PriceTier({
  level,
  currency,
  locale,
  withLabel = true,
  className = "",
}: {
  level: PriceLevel;
  currency: string | null | undefined;
  locale: Locale;
  withLabel?: boolean;
  className?: string;
}) {
  const sign = currencySign(locale, currency ?? "EUR");
  const t = getDictionary(locale).card;
  const words = t.vsMarket(level.pct, level.tier === 3);
  return (
    <span title={t.vsMarketHint} className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span role="img" aria-label={`${t.priceLevel(level.tier)}: ${words}`}>
        <span className="font-semibold text-brand-green">{sign.repeat(level.tier)}</span>
        <span className="text-foreground/25">{sign.repeat(5 - level.tier)}</span>
      </span>
      {withLabel && <span className="text-xs font-medium text-foreground/60">{words}</span>}
    </span>
  );
}
