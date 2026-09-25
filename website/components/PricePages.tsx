import Link from "next/link";
import type { BusinessCategory, City } from "@prisma/client";
import { getMarketPrices, type ServicePriceRow } from "@/lib/data";
import { CATEGORY_THEME, businessPath, categoryLabel, cityPath, listingPath } from "@/lib/categories";
import { getDictionary, inCity, localePath, type Locale } from "@/lib/i18n";
import { MARKET_BAND, pctAgainst } from "@/lib/priceMarket";
import { answerText, comparable, getPriceSummary, money, pricesPath } from "@/lib/pricePages";
import { SERVICES, serviceIncludes, serviceLabel } from "@/lib/services";
import { SITE_URL } from "@/lib/site";
import { Breadcrumbs } from "./Breadcrumbs";
import { TagIcon } from "./icons";

// Price pages (owner, 2026-09-25; docs/seo/README.md, "Страницы цен"):
// the answer first (range, median, how many places, date), then every
// place with its price against the market. Same data and rules as the
// price table on place pages (lib/priceMarket.ts, docs/card-spec.md).

/** One line per place: its cheapest comparable price and its span. */
function placeLines(rows: ServicePriceRow[]) {
  const byPlace = new Map<number, ServicePriceRow[]>();
  for (const r of rows) byPlace.set(r.business.id, [...(byPlace.get(r.business.id) ?? []), r]);
  return [...byPlace.values()]
    .map((placeRows) => {
      const from = Math.min(...placeRows.map((r) => r.priceFrom));
      const to = Math.max(...placeRows.map((r) => r.priceTo ?? r.priceFrom));
      return { business: placeRows[0].business, currency: placeRows[0].currency, from, to, rows: placeRows };
    })
    .sort((a, b) => a.from - b.from);
}

function Header({
  locale,
  category,
  city,
  crumbs,
  title,
  lead,
}: {
  locale: Locale;
  category: BusinessCategory;
  city: City;
  crumbs: { label: string; href?: string }[];
  title: string;
  lead: string | null;
}) {
  const t = getDictionary(locale);
  return (
    <section className="under-header relative overflow-hidden border-b border-line">
      <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-4xl px-4 pb-8 pt-8 md:pb-10 md:pt-10">
        <Breadcrumbs
          items={[
            { label: t.listing.home, href: localePath(locale, "/") },
            { label: city.name, href: cityPath(locale, city.slug) },
            { label: categoryLabel(category, locale), href: listingPath(locale, category, city.slug) },
            ...crumbs,
          ]}
        />
        <h1 className="mt-4 text-3xl font-extrabold text-foreground md:text-5xl">{title}</h1>
        {lead && <p className="mt-3 max-w-3xl text-lg text-foreground/75">{lead}</p>}
      </div>
    </section>
  );
}

export async function ServicePricePage({
  locale,
  category,
  city,
  code,
}: {
  locale: Locale;
  category: BusinessCategory;
  city: City;
  code: string;
}) {
  const t = getDictionary(locale);
  const tp = t.prices;
  const where = inCity(locale, city);
  const service = serviceLabel(category, code, locale);
  const summary = await getPriceSummary(category, city.slug, code);
  const { market } = summary;
  const answer = answerText(locale, summary);
  const compared = placeLines(summary.rows.filter(comparable));
  const other = placeLines(summary.rows.filter((r) => !comparable(r)));
  const includes = serviceIncludes(category, code, locale);
  const allMarket = await getMarketPrices(category, city.slug);
  const otherServices = (SERVICES[category] ?? []).filter((s) => s.code !== code && allMarket.has(s.code));
  const accent = CATEGORY_THEME[category].accent;

  const jsonLd = [
    ...(answer
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: tp.question(service, where),
                acceptedAnswer: { "@type": "Answer", text: answer },
              },
            ],
          },
        ]
      : []),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: tp.serviceH1(service, where),
      numberOfItems: compared.length,
      itemListElement: compared.map((line, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: line.business.name,
        url: `${SITE_URL}${businessPath(locale, line.business.slug)}`,
      })),
    },
  ];

  const priceText = (line: { from: number; to: number; currency: string }) =>
    line.to > line.from
      ? `${money(line.from, line.currency, locale)}–${money(line.to, line.currency, locale)}`
      : money(line.from, line.currency, locale);

  return (
    <main style={{ "--accent": accent } as React.CSSProperties}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header
        locale={locale}
        category={category}
        city={city}
        crumbs={[{ label: tp.crumb, href: pricesPath(locale, category, city.slug) }, { label: service }]}
        title={tp.serviceH1(service, where)}
        lead={answer ?? tp.fewPlaces(compared.length)}
      />

      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-8">
        {includes && (
          <p className="rounded-[var(--radius-card)] bg-surface px-6 py-4 text-sm text-foreground/75 shadow-[var(--shadow-card)]">
            <span className="font-semibold text-foreground">{tp.includes}:</span> {includes}
          </p>
        )}

        {compared.length > 0 && (
          <section className="overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-foreground/50">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-6">{tp.place}</th>
                  <th className="px-4 py-3 text-right font-semibold">{tp.price}</th>
                  {market && <th className="hidden px-4 py-3 font-semibold sm:table-cell sm:pr-6">{tp.vsMarket}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {compared.map((line) => {
                  const pct = market && market.currency === line.currency ? pctAgainst(line.from, market.median) : null;
                  const vs =
                    pct === null ? null : (
                      <span
                        className={
                          Math.abs(pct) <= MARKET_BAND
                            ? "text-foreground/70"
                            : pct < 0
                              ? "text-brand-green"
                              : "text-brand-orange"
                        }
                      >
                        {t.card.vsMarket(pct, Math.abs(pct) <= MARKET_BAND)}
                      </span>
                    );
                  return (
                    <tr key={line.business.id} className="align-top">
                      <td className="px-4 py-3 sm:px-6">
                        <Link
                          href={businessPath(locale, line.business.slug)}
                          prefetch={false}
                          className="font-semibold text-foreground hover:text-brand-blue hover:underline"
                        >
                          {line.business.name}
                        </Link>
                        {line.business.districtName && (
                          <span className="block text-xs text-foreground/55">{line.business.districtName}</span>
                        )}
                        {vs && <span className="mt-0.5 block text-xs font-medium sm:hidden">{vs}</span>}
                        {line.business.phone && (
                          <a
                            href={`tel:${line.business.phone.replace(/\s+/g, "")}`}
                            className="mt-1 inline-block text-xs font-semibold text-brand-orange hover:underline"
                          >
                            {t.actions.call}
                          </a>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">
                        {priceText(line)}
                        {line.rows[0].sourceUrl && (
                          <a
                            href={line.rows[0].sourceUrl}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="block text-xs font-normal text-foreground/45 hover:underline"
                          >
                            {tp.source}
                          </a>
                        )}
                      </td>
                      {market && <td className="hidden px-4 py-3 text-xs font-medium sm:table-cell sm:pr-6">{vs}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {other.length > 0 && (
          <section className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold text-foreground">{tp.notComparedTitle}</h2>
            <p className="mt-1 text-sm text-foreground/60">{tp.notComparedIntro}</p>
            <ul className="mt-3 divide-y divide-line text-sm">
              {other.map((line) => {
                const r = line.rows[0];
                const note = locale === "en" ? r.note : (r.noteLocal ?? r.note);
                return (
                  <li key={line.business.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2.5">
                    <Link href={businessPath(locale, line.business.slug)} prefetch={false} className="font-medium hover:underline">
                      {line.business.name}
                    </Link>
                    <span className="font-semibold">
                      {priceText(line)}
                      {r.unit && <span className="font-normal text-foreground/60"> {t.business.perUnit[r.unit]}</span>}
                    </span>
                    {note && <span className="w-full text-xs text-brand-orange">{note}</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="text-xs text-foreground/50">{t.business.pricesDisclaimer}</p>

        {otherServices.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-foreground">{tp.otherServices}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherServices.map((s) => (
                <li key={s.code}>
                  <Link
                    href={pricesPath(locale, category, city.slug, s.code)}
                    prefetch={false}
                    className="inline-block rounded-[var(--radius-pill)] border border-line bg-surface px-3.5 py-2 text-sm font-medium hover:border-brand-blue hover:text-brand-blue"
                  >
                    {serviceLabel(category, s.code, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link
          href={listingPath(locale, category, city.slug)}
          prefetch={false}
          className="inline-block text-sm font-semibold text-brand-blue hover:underline"
        >
          {tp.seeAll(categoryLabel(category, locale))} →
        </Link>
      </div>
    </main>
  );
}

export async function PriceOverviewPage({ locale, category, city }: { locale: Locale; category: BusinessCategory; city: City }) {
  const t = getDictionary(locale);
  const tp = t.prices;
  const where = inCity(locale, city);
  const label = categoryLabel(category, locale);
  const market = await getMarketPrices(category, city.slug);
  const services = (SERVICES[category] ?? []).filter((s) => market.has(s.code));

  return (
    <main style={{ "--accent": CATEGORY_THEME[category].accent } as React.CSSProperties}>
      <Header
        locale={locale}
        category={category}
        city={city}
        crumbs={[{ label: tp.crumb }]}
        title={tp.overviewH1(label, where)}
        lead={tp.overviewIntro}
      />
      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-8">
        <section className="overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-foreground/50">
              <tr>
                <th className="px-4 py-3 font-semibold sm:px-6">{tp.service}</th>
                <th className="px-4 py-3 text-right font-semibold">{tp.median}</th>
                <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">{tp.range}</th>
                <th className="px-4 py-3 text-right font-semibold sm:pr-6">{tp.places}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {services.map((s) => {
                const m = market.get(s.code)!;
                return (
                  <tr key={s.code}>
                    <td className="px-4 py-3 sm:px-6">
                      <Link
                        href={pricesPath(locale, category, city.slug, s.code)}
                        prefetch={false}
                        className="inline-flex items-center gap-2 font-semibold text-foreground hover:text-brand-blue hover:underline"
                      >
                        <TagIcon className="h-4 w-4 text-brand-green" />
                        {serviceLabel(category, s.code, locale)}
                      </Link>
                      <span className="block text-xs text-foreground/55 sm:hidden">
                        {money(m.min, m.currency, locale)}–{money(m.max, m.currency, locale)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{money(m.median, m.currency, locale)}</td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-right text-foreground/70 sm:table-cell">
                      {money(m.min, m.currency, locale)}–{money(m.max, m.currency, locale)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground/70 sm:pr-6">{m.places}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
        <p className="text-xs text-foreground/50">{t.business.pricesDisclaimer}</p>
        <Link
          href={listingPath(locale, category, city.slug)}
          prefetch={false}
          className="inline-block text-sm font-semibold text-brand-blue hover:underline"
        >
          {tp.seeAll(label)} →
        </Link>
      </div>
    </main>
  );
}
