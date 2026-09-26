import Link from "next/link";
import { getAllCities, getDefaultCity } from "@/lib/data";
import { LanguageSwitch } from "./LanguageSwitch";
import { ALL_CATEGORIES, categoryLabel, cityPath, listingPath } from "@/lib/categories";
import { getDictionary, inCity, localesForCity, type Locale } from "@/lib/i18n";
import { Logo } from "./Logo";
import { ShieldCheckIcon } from "./icons";

export async function Footer({ locale }: { locale: Locale }) {
  const [city, cities] = await Promise.all([getDefaultCity(), getAllCities()]);
  const citySlug = city?.slug ?? "";
  // Name the city only while there is one; with several the site is generic.
  const cityWhere = cities.length === 1 ? inCity(locale, cities[0]) : null;
  const t = getDictionary(locale).footer;

  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--brand-orange)" }}
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo className="h-10 w-auto" wordmarkColor="#FFFFFF" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              {t.tagline(cityWhere)}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-white/10 px-3 py-1.5 text-xs text-white/80">
              <ShieldCheckIcon className="h-4 w-4 text-brand-green" />
              {t.sourced}
            </p>
          </div>

          <FooterColumn title={t.services}>
            {ALL_CATEGORIES.map((category) => (
              <FooterLink key={category} href={listingPath(locale, category, citySlug)}>
                {categoryLabel(category, locale)}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Every city's hub, in this language where the city has it. */}
          <FooterColumn title={t.cities}>
            {cities.map((c) => (
              <FooterLink key={c.slug} href={cityPath(localesForCity(c).includes(locale) ? locale : "en", c.slug)}>
                {c.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t.about}>
            <FooterLink href="/en/how-it-works/">{t.howItWorks}</FooterLink>
            <FooterLink href="/en/add-or-fix-listing/">{t.addBusiness}</FooterLink>
            <FooterLink href="/en/add-or-fix-listing/">{t.fixListing}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t.legal}>
            <FooterLink href="/en/privacy-policy/">{t.privacy}</FooterLink>
            <FooterLink href="/en/terms-of-use/">{t.terms}</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} pawenn.com</p>
          <LanguageSwitch locales={localesForCity(city)} />
          <p>{t.madeWithCare(cityWhere)}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-white/75 transition hover:text-brand-orange">
        {children}
      </Link>
    </li>
  );
}
