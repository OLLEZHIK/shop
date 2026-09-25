import Link from "next/link";
import { getDefaultCity, getCityPoints } from "@/lib/data";
import { ALL_CATEGORIES, CATEGORY_THEME, categoryBlurb, categoryLabel, categorySlug, listingPath } from "@/lib/categories";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { BrowseMenu, type ServiceLink } from "./BrowseMenu";
import { FindCareButton, SearchDialog } from "./SearchDialog";
import { HeaderShell } from "./HeaderShell";

export async function Header({ locale }: { locale: Locale }) {
  const [city, cityPoints] = await Promise.all([getDefaultCity(), getCityPoints()]);
  const citySlug = city?.slug ?? "";
  const t = getDictionary(locale);

  const services: ServiceLink[] = ALL_CATEGORIES.map((category) => ({
    href: listingPath(locale, category, citySlug),
    label: categoryLabel(category, locale),
    category,
    blurb: categoryBlurb(category, locale),
    accent: CATEGORY_THEME[category].accent,
  }));
  const cities = cityPoints.map(({ slug, name, lat, lng }) => ({ slug, name, lat, lng }));
  const searchCategories = ALL_CATEGORIES.map((category) => ({
    slug: categorySlug(category, locale),
    label: categoryLabel(category, locale),
    category,
  }));

  return (
    <HeaderShell>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <Link href={localePath(locale, "/")} aria-label="pawenn home" className="flex shrink-0 items-center">
          <Logo className="h-9 w-auto md:h-10" />
        </Link>

        {/* Zocdoc-style: Browse dropdown, plain text links, a divider,
            then one bright primary button. No log in / sign up - the
            product has no accounts (PRODUCT.md). */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <BrowseMenu
            locale={locale}
            t={t.nav}
            food={t.food}
            services={services}
            cities={cities}
            defaultCitySlug={citySlug}
          />
          <Link
            href="/en/how-it-works/"
            className="inline-flex h-12 items-center rounded-[var(--radius-control)] px-4 text-[17px] font-medium text-foreground transition hover:bg-surface-sunken"
          >
            {t.nav.help}
          </Link>
          <Link
            href="/en/add-or-fix-listing/"
            className="inline-flex h-12 items-center rounded-[var(--radius-control)] px-4 text-[17px] font-medium text-foreground transition hover:bg-surface-sunken"
          >
            {t.nav.listBusiness}
          </Link>
          <span aria-hidden="true" className="mx-2 h-8 w-px bg-foreground/15" />
          <FindCareButton
            label={t.nav.findCare}
            className="ml-2 inline-flex h-12 items-center rounded-[var(--radius-control)] bg-brand-orange px-6 text-[17px] font-semibold text-white transition hover:bg-brand-orange-deep"
          />
        </nav>

        {/* Phones: a search button next to Browse opens the same dialog. */}
        <div className="flex items-center gap-2 lg:hidden">
          <FindCareButton
            compact
            label={t.nav.findCare}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-brand-orange text-white"
          />
          <MobileMenu
          locale={locale}
          services={services}
          cities={cities}
          defaultCitySlug={citySlug}
          />
        </div>
      </div>

      <SearchDialog
        locale={locale}
        citySlug={citySlug}
        cityName={city?.name ?? "Bratislava"}
        categories={searchCategories}
        cities={cities}
      />
    </HeaderShell>
  );
}
