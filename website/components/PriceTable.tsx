import type { BusinessCategory } from "@prisma/client";
import type { BusinessWithRelations } from "@/lib/data";
import { SERVICES, serviceIncludes, serviceLabel } from "@/lib/services";
import { formatDate, getDictionary, type Locale } from "@/lib/i18n";
import Link from "next/link";
import { TagIcon } from "./icons";
import { pricesPath } from "@/lib/pricePages";
import { MARKET_BAND, pctAgainst, type MarketPrice } from "@/lib/priceMarket";

type PriceRow = BusinessWithRelations["priceItems"][number];

// Prices for the category's 6 services (docs/card-spec.md, "Цены"), one
// row per weight range, each with when it was checked and its source -
// the project's trust rule: no price without a source. Under each service
// name: what its price must include to be compared; a price per hour/km
// or a partial one carries its note and "not compared".
export function PriceTable({
  items,
  category,
  locale,
  market,
  citySlug,
}: {
  items: PriceRow[];
  category: BusinessCategory;
  locale: Locale;
  /** City market price per service code (lib/priceMarket.ts). */
  market?: Map<string, MarketPrice>;
  /** With a city: services that have a price page link to it. */
  citySlug?: string;
}) {
  const t = getDictionary(locale).business;
  const card = getDictionary(locale).card;
  const order = (SERVICES[category] ?? []).map((s) => s.code);
  const rows = items
    .filter((i) => i.service.code && order.includes(i.service.code))
    .sort(
      (a, b) =>
        order.indexOf(a.service.code!) - order.indexOf(b.service.code!) ||
        (a.weightFromKg ?? -1) - (b.weightFromKg ?? -1)
    );
  if (rows.length === 0) return null;

  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  // Whole amounts without decimals (€40), others with both (€33.90).
  const money = (value: unknown, currency: string) => {
    const n = Number(value);
    const digits = Number.isInteger(n) ? 0 : 2;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n);
  };
  const weight = (from: number | null, to: number | null) =>
    from !== null && to !== null
      ? t.weightRange(num.format(from), num.format(to))
      : to !== null
        ? t.weightUpTo(num.format(to))
        : from !== null
          ? t.weightOver(num.format(from))
          : null;

  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
      <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
        <TagIcon className="h-5 w-5 text-brand-green" />
        {t.prices}
      </h2>
      <ul className="mt-3 divide-y divide-line">
        {rows.map((item, index) => {
          const w = weight(item.weightFromKg, item.weightToKg);
          const code = item.service.code!;
          const firstOfService = index === 0 || rows[index - 1].service.code !== code;
          const unit = item.unit ? t.perUnit[item.unit] : null;
          const note = locale === "en" ? item.note : (item.noteLocal ?? item.note);
          // Partial, per hour/km, or more than the standard (a note): shown, not compared.
          const notCompared = item.partial || item.unit !== null || Boolean(item.note);
          // The standard's "includes" would contradict a partial or
          // per-hour price, so it goes on comparable rows only.
          const includes = firstOfService && !notCompared ? serviceIncludes(category, code, locale) : null;
          const from = Number(item.priceFrom);
          const to = item.priceTo === null ? null : Number(item.priceTo);
          const price =
            to === null ? t.priceFrom(money(from, item.currency)) : to === from ? money(from, item.currency) : `${money(from, item.currency)}–${money(to, item.currency)}`;
          // Against the city median: once per service, on its cheapest
          // comparable row - the same "from" price the market is built of.
          const cityMarket = market?.get(code);
          const comparableOfService = rows.filter((r) => r.service.code === code && !r.partial && r.unit === null && !r.note);
          const cheapest = comparableOfService.reduce<PriceRow | null>(
            (min, r) => (min === null || Number(r.priceFrom) < Number(min.priceFrom) ? r : min),
            null
          );
          const vsMarket =
            cityMarket && cheapest?.id === item.id && cityMarket.currency === item.currency
              ? pctAgainst(from, cityMarket.median)
              : null;
          return (
            <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
              <span className="text-foreground/80">
                {firstOfService && citySlug && market?.has(code) ? (
                  <Link href={pricesPath(locale, category, citySlug, code)} prefetch={false} className="hover:text-brand-blue hover:underline">
                    {serviceLabel(category, code, locale)}
                  </Link>
                ) : (
                  serviceLabel(category, code, locale)
                )}
                {w && <span className="text-foreground/50"> · {w}</span>}
                {includes && <span className="block text-xs text-foreground/50">{includes}</span>}
              </span>
              <span className="font-semibold text-foreground">
                {price}
                {unit && <span className="font-normal text-foreground/60"> {unit}</span>}
              </span>
              {(note || notCompared) && (
                <span className="w-full text-xs text-brand-orange">
                  {[note, notCompared ? t.notCompared : null].filter(Boolean).join(" · ")}
                </span>
              )}
              {vsMarket !== null && cityMarket && (
                <span className="w-full text-xs">
                  <span
                    className={
                      Math.abs(vsMarket) <= MARKET_BAND
                        ? "font-medium text-foreground/70"
                        : vsMarket < 0
                          ? "font-medium text-brand-green"
                          : "font-medium text-brand-orange"
                    }
                  >
                    {card.vsMarket(vsMarket, Math.abs(vsMarket) <= MARKET_BAND)}
                  </span>
                  <span className="text-foreground/50"> · {t.cityMedian(money(cityMarket.median, cityMarket.currency), cityMarket.places)}</span>
                </span>
              )}
              <span className="w-full text-xs text-foreground/45">
                {t.pricesChecked(formatDate(item.observedAt, locale))} ·{" "}
                <a href={item.sourceUrl} target="_blank" rel="nofollow noopener noreferrer" className="hover:underline">
                  {t.priceList}
                </a>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-foreground/50">{t.pricesDisclaimer}</p>
    </section>
  );
}
