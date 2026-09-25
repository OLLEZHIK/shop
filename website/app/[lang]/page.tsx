import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDefaultCity,
  getAllDistricts,
  getPopularNearby,
  getFeaturedBusinesses,
  getBusinessCount,
  getDistrictSummaries,
  getCityPoints,
} from "@/lib/data";
import {
  ALL_CATEGORIES,
  CATEGORY_THEME,
  categoryBlurb,
  categoryLabel,
  listingPath,
} from "@/lib/categories";
import { getDictionary, inCity, isLocale, localePath, localesForCountry } from "@/lib/i18n";
import { localeAlternates } from "@/lib/seo";
import { districtCountMap } from "@/lib/districts";
import { HomeSearch } from "@/components/HomeSearch";
import { AmbientBackground } from "@/components/AmbientBackground";
import { BusinessCard } from "@/components/BusinessCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { DistrictExplorer } from "@/components/DistrictExplorer";
import { MythOrFact } from "@/components/MythOrFact";
import {
  ArrowRightIcon,
  CatIcon,
  DogIcon,
  PhoneIcon,
  SearchIcon,
  ShieldCheckIcon,
  PawIcon,
} from "@/components/icons";

const STEP_ICONS = [SearchIcon, ShieldCheckIcon, PhoneIcon];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const city = await getDefaultCity();
  const cityName = city?.name ?? "Bratislava";
  const t = getDictionary(lang).home;
  const locales = localesForCountry(city?.country);
  return {
    title: t.metaTitle(cityName),
    description: t.metaDescription(cityName),
    alternates: localeAlternates(lang, Object.fromEntries(locales.map((l) => [l, localePath(l, "/")]))),
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang;
  const t = getDictionary(locale).home;
  const [city, districts, popularNearby, featured, counts, districtSummaries, cityPoints] = await Promise.all([
    getDefaultCity(),
    getAllDistricts(),
    getPopularNearby(),
    getFeaturedBusinesses(),
    getBusinessCount(),
    getDistrictSummaries(),
    getCityPoints(),
  ]);

  const cityName = city?.name ?? "Bratislava";
  const citySlug = city?.slug ?? "";

  const categories = ALL_CATEGORIES.map((category) => ({
    slug: listingPath(locale, category, citySlug).split("/").filter(Boolean).at(locale === "en" ? 0 : 1)!,
    href: listingPath(locale, category, citySlug),
    category,
    label: categoryLabel(category, locale),
    count: counts.byCategory[category] ?? 0,
    accent: CATEGORY_THEME[category].accent,
    blurb: categoryBlurb(category, locale),
  }));
  // Real counts, used to rank the mobile overlay's "Popular" shortcuts.
  const popularCategorySlugs = [...categories]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((c) => c.slug);

  const districtOptions = districts.map((d) => ({ slug: d.slug, label: d.name }));

  const stats = [
    { value: counts.total, label: t.statPlaces },
    { value: districtSummaries.length, label: t.statDistricts },
    { value: categories.filter((c) => c.count > 0).length, label: t.statKinds },
    { value: 0, label: t.statAds },
  ];

  return (
    <main className="relative overflow-x-clip">
      {/* ---------- Hero ---------- */}
      <section className="under-header relative">
        <AmbientBackground />
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 md:pt-16 lg:grid-cols-[1.6fr_1fr] lg:pb-24">
          <div className="rise-in min-w-0 text-center lg:text-left">
            <h1 className="text-4xl font-extrabold leading-[1.05] text-foreground sm:text-5xl md:text-6xl xl:text-7xl">
              {t.h1Before}{" "}
              <span className="relative whitespace-nowrap text-brand-orange">
                {t.h1Highlight}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 16"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2 left-0 h-3 w-full text-brand-orange/40"
                >
                  <path d="M3 12C60 4 140 2 297 8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </span>{" "}
              {inCity(locale, citySlug, cityName)}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-foreground/70 lg:mx-0">
              {t.subtitle(cityName)}
            </p>

            <div id="search" className="mt-8 scroll-mt-28 lg:max-w-none">
              <HomeSearch
                locale={locale}
                citySlug={citySlug}
                cityName={cityName}
                categories={categories.map((c) => ({ slug: c.slug, label: c.label, category: c.category }))}
                popularCategorySlugs={popularCategorySlugs}
                districts={districtOptions}
                popularDistrictSlugs={popularNearby.map((p) => p.districtSlug)}
                districtCounts={districtCountMap(districtSummaries)}
                cities={cityPoints.map(({ slug, lat, lng }) => ({ slug, lat, lng }))}
              />
            </div>

            <div className="mt-5 hidden flex-wrap items-center gap-2 text-sm md:flex lg:justify-start">
              <span className="text-foreground/50">{t.popular}</span>
              {popularCategorySlugs.map((slug) => {
                const c = categories.find((cat) => cat.slug === slug)!;
                return (
                  <Link
                    key={slug}
                    href={c.href}
                    className="rounded-[var(--radius-pill)] border border-line bg-surface/70 px-3 py-1 text-foreground/75 transition hover:border-brand-blue-muted-border hover:text-brand-blue"
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <HeroCollage categories={categories} total={counts.total} t={t} />
        </div>
      </section>

      {/* ---------- Stats strip ---------- */}
      <section className="mx-auto max-w-7xl px-4">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] bg-line shadow-[var(--shadow-card)] md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface px-6 py-6 text-center md:py-8">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-heading text-3xl font-extrabold text-ink md:text-4xl">{s.value}</span>
                <span className="mt-1 block text-sm text-foreground/60">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- Browse by service ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <SectionHeading
          eyebrow={t.browseEyebrow}
          title={t.browseTitle}
          body={t.browseBody}
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Link
              key={c.slug}
              href={c.href}
              className="rise-in group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 sm:p-6 hover:shadow-[var(--shadow-card-hover)]"
              style={{ "--accent": c.accent, animationDelay: `${i * 60}ms` } as React.CSSProperties}
            >
              <span
                aria-hidden="true"
                className="absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-[0.08] transition-transform duration-500 group-hover:scale-150"
                style={{ background: c.accent }}
              />
              <span className="accent-soft relative flex h-11 w-11 items-center justify-center rounded-2xl sm:h-14 sm:w-14 transition duration-300 group-hover:rotate-[-6deg]">
                <CategoryIcon category={c.category} className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <h3 className="relative mt-4 text-base font-bold leading-tight text-foreground sm:mt-6 sm:text-xl">{c.label}</h3>
              <p className="relative mt-1.5 hidden text-foreground/65 sm:block">{c.blurb}</p>
              <div className="relative mt-auto flex items-center justify-between pt-4 sm:mt-6 sm:border-t sm:border-line">
                <span className="text-sm font-medium text-foreground/70">
                  {t.places(c.count)}
                </span>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full transition duration-300 group-hover:translate-x-1 sm:h-9 sm:w-9"
                  style={{ background: c.accent, color: "white" }}
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Explore by district ---------- */}
      {districtSummaries.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-24">
          <SectionHeading
            eyebrow={t.exploreEyebrow}
            title={t.exploreTitle(cityName)}
            body={t.exploreBody}
          />
          <div className="mt-10">
            <DistrictExplorer locale={locale} districts={districtSummaries} citySlug={citySlug} cityName={cityName} />
          </div>
        </section>
      )}

      {/* ---------- Featured partners ---------- */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-24">
          <SectionHeading
            eyebrow={t.partnersEyebrow}
            title={t.partnersTitle}
            body={t.partnersBody}
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {featured.map((business) => (
              <BusinessCard key={business.id} business={business} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* ---------- How it works ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <SectionHeading eyebrow={t.howEyebrow} title={t.howTitle} />
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {t.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
            <li
              key={step.title}
              className="relative rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] md:p-8"
            >
              <span className="absolute right-6 top-5 font-heading text-6xl font-extrabold text-foreground/[0.06]">
                0{i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange-muted text-brand-orange-deep">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-foreground/65">{step.body}</p>
            </li>
            );
          })}
        </ol>
        <Link
          href="/how-it-works/"
          className="mt-6 inline-flex items-center gap-1.5 font-semibold text-brand-blue hover:underline"
        >
          {t.howLink}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </section>

      {/* ---------- Pet care corner ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <SectionHeading
          eyebrow={t.careEyebrow}
          title={t.careTitle}
          body={t.careBody}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <MythOrFact locale={locale} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {t.tips.map((tip, i) => (
              <details
                key={i}
                className="group rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] open:shadow-[var(--shadow-card-hover)]"
                open={i === 0}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-semibold text-foreground">
                  <span>{tip.title}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-foreground/60 transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                {tip.body && <p className="mt-3 text-sm text-foreground/70">{tip.body}</p>}
                {tip.items && (
                  <ul className="mt-3 space-y-1.5 text-sm text-foreground/70">
                    {tip.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <PawIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-orange" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Business CTA ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <div className="relative overflow-hidden rounded-[28px] bg-brand-orange px-6 py-12 text-white md:px-14 md:py-16">
          <PawIcon className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 rotate-12 text-white/10" />
          <PawIcon className="pointer-events-none absolute bottom-[-3rem] right-40 h-32 w-32 -rotate-12 text-white/10" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-extrabold md:text-4xl">{t.ctaTitle(cityName)}</h2>
            <p className="mt-3 text-lg text-white/85">
              {t.ctaBody}
            </p>
            <Link
              href="/add-or-fix-listing/"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] bg-white px-6 py-3 font-semibold text-ink transition hover:bg-ink hover:text-white"
            >
              {t.ctaButton}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold text-foreground md:text-4xl">{title}</h2>
      {body && <p className="mt-3 text-lg text-foreground/65">{body}</p>}
    </div>
  );
}

// Right side of the hero: category tiles arranged as a playful collage
// around a central "pet" card. Real category counts only; decorative
// motion is CSS-only and disabled under prefers-reduced-motion.
function HeroCollage({
  categories,
  total,
  t,
}: {
  categories: {
    slug: string;
    href: string;
    category: Parameters<typeof CategoryIcon>[0]["category"];
    label: string;
    count: number;
    accent: string;
  }[];
  total: number;
  t: ReturnType<typeof getDictionary>["home"];
}) {
  const positions = [
    "left-[-4%] top-[0%] -rotate-6",
    "right-[-6%] top-[8%] rotate-3",
    "left-[-12%] top-[40%] rotate-2",
    "right-[-10%] top-[46%] -rotate-3",
    "left-[-2%] bottom-[2%] rotate-3",
    "right-[-2%] bottom-[-4%] -rotate-2",
  ];

  return (
    <div className="relative mx-auto hidden aspect-square w-full max-w-[520px] lg:block">
      {/* center card */}
      <div className="absolute left-1/2 top-1/2 flex h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[36px] bg-ink text-white shadow-[var(--shadow-panel)]">
        <div className="flex items-center gap-2 text-brand-orange">
          <DogIcon className="h-12 w-12" />
          <CatIcon className="h-12 w-12 text-white" />
        </div>
        <p className="mt-3 font-heading text-4xl font-extrabold">{total}</p>
        <p className="px-3 text-center text-sm text-white/60">{t.collageCenter}</p>
      </div>

      {categories.map((c, i) => (
        <Link
          key={c.slug}
          href={c.href}
          className={`group absolute ${positions[i % positions.length]}`}
        >
          <span
            className="float-y flex items-center gap-2.5 rounded-2xl bg-surface py-2.5 pl-2.5 pr-4 shadow-[var(--shadow-card-hover)] transition duration-300 group-hover:scale-105"
            style={{ "--accent": c.accent, animationDelay: `${i * -1.1}s` } as React.CSSProperties}
          >
            <span className="accent-solid flex h-11 w-11 items-center justify-center rounded-xl">
              <CategoryIcon category={c.category} className="h-6 w-6" />
            </span>
            <span>
              <span className="block max-w-[8.5rem] text-sm font-bold leading-tight text-foreground">{c.label}</span>
              <span className="block text-xs text-foreground/55">{t.listed(c.count)}</span>
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
