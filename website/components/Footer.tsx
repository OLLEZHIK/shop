import Link from "next/link";
import { getDefaultCity } from "@/lib/data";
import { ALL_CATEGORY_SLUGS, CATEGORY_LABELS, categoryEnumFromSlug } from "@/lib/categories";
import { Logo } from "./Logo";
import { ShieldCheckIcon } from "./icons";

export async function Footer() {
  const city = await getDefaultCity();
  const citySlug = city?.slug ?? "";
  const cityName = city?.name ?? "Bratislava";

  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--brand-orange)" }}
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo className="h-10 w-auto" wordmarkColor="#FFFFFF" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              A friendly, independent guide to pet services in {cityName}. No sign-ups, no ads - just the
              details you need to pick up the phone.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-white/10 px-3 py-1.5 text-xs text-white/80">
              <ShieldCheckIcon className="h-4 w-4 text-brand-green" />
              Every listing links to its source
            </p>
          </div>

          <FooterColumn title="Services">
            {ALL_CATEGORY_SLUGS.map((slug) => (
              <FooterLink key={slug} href={`/${slug}/${citySlug}/`}>
                {CATEGORY_LABELS[categoryEnumFromSlug(slug)!]}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="pawenn">
            <FooterLink href="/how-it-works/">How it works</FooterLink>
            <FooterLink href="/add-or-fix-listing/">Add your business</FooterLink>
            <FooterLink href="/add-or-fix-listing/">Fix a listing</FooterLink>
          </FooterColumn>

          <FooterColumn title="Legal">
            <FooterLink href="/privacy-policy/">Privacy Policy</FooterLink>
            <FooterLink href="/terms-of-use/">Terms of Use</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} pawenn.com</p>
          <p>Made with care for pets in {cityName}</p>
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
