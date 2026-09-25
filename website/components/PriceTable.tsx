import type { BusinessCategory } from "@prisma/client";
import type { BusinessWithRelations } from "@/lib/data";
import { SERVICES, serviceLabel } from "@/lib/services";
import { formatDate, getDictionary, type Locale } from "@/lib/i18n";
import { TagIcon } from "./icons";

type PriceRow = BusinessWithRelations["priceItems"][number];

// Prices for the category's 6 services (docs/card-spec.md, "Цены"), one
// row per weight range, each with when it was checked and its source -
// the project's trust rule: no price without a source.
export function PriceTable({
  items,
  category,
  locale,
}: {
  items: PriceRow[];
  category: BusinessCategory;
  locale: Locale;
}) {
  const t = getDictionary(locale).business;
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
  const money = (value: unknown, currency: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(
      Number(value)
    );
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
        {rows.map((item) => {
          const w = weight(item.weightFromKg, item.weightToKg);
          const from = Number(item.priceFrom);
          const to = item.priceTo === null ? null : Number(item.priceTo);
          const price =
            to === null ? t.priceFrom(money(from, item.currency)) : to === from ? money(from, item.currency) : `${money(from, item.currency)}–${money(to, item.currency)}`;
          return (
            <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
              <span className="text-foreground/80">
                {serviceLabel(category, item.service.code!, locale)}
                {w && <span className="text-foreground/50"> · {w}</span>}
              </span>
              <span className="font-semibold text-foreground">{price}</span>
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
    </section>
  );
}
