"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { CityPointLite } from "@/lib/geo";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ServiceLink } from "./BrowseMenu";
import { CategoryIcon } from "./CategoryIcon";
import { ArrowRightIcon, ChevronDownIcon, CloseIcon, MapPinIcon, ShopBagIcon } from "./icons";
import { useServiceNavigation } from "./useServiceNavigation";
import { openSearch } from "./SearchDialog";

interface MobileMenuProps {
  locale: Locale;
  services: ServiceLink[];
  cities: CityPointLite[];
  defaultCitySlug: string;
}

// Full-screen two-level menu for small screens (the desktop Browse
// dropdown is hidden below `lg`): Services, then Food & supplements.
export function MobileMenu({ locale, services, cities, defaultCitySlug }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const t = getDictionary(locale);
  const { open: openService, pending } = useServiceNavigation(locale, cities, defaultCitySlug, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-control)] bg-surface-sunken px-4 font-medium text-foreground lg:hidden"
      >
        {t.nav.openMenu}
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {/* Portal: the sticky header's backdrop-filter would otherwise
          become the containing block and clip this fixed overlay. */}
      {open &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label={t.nav.browse} className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-heading text-lg font-bold">{t.nav.browse}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t.nav.closeMenu}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-[var(--shadow-card)]"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Any plain link click closes the menu (event bubbles up from <a>). */}
            <nav
              className="flex-1 overflow-y-auto px-4 pb-6"
              aria-label={t.nav.browse}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a[data-close]")) setOpen(false);
              }}
            >
              <p className="px-1 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                {t.nav.services}
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {services.map((s, i) => (
                  <li key={s.href} className="rise-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <Link
                      href={s.href}
                      onClick={(e) => openService(s.category, e)}
                      className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)]"
                      style={{ "--accent": s.accent } as React.CSSProperties}
                    >
                      <span className="accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
                        <CategoryIcon category={s.category} className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold text-foreground">{s.label}</span>
                        <span className="mt-0.5 block text-xs text-foreground/60">
                          {pending === s.category ? (
                            <span className="inline-flex items-center gap-1 text-brand-blue">
                              <MapPinIcon className="h-3.5 w-3.5 animate-pulse" />
                              {t.nav.locating}
                            </span>
                          ) : (
                            s.blurb
                          )}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mt-6 flex items-center gap-2 px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                {t.nav.foodAndSupplies}
                <span className="rounded-[var(--radius-pill)] bg-brand-orange-muted px-2 py-0.5 text-[10px] text-brand-orange-deep">
                  {t.nav.comingSoon}
                </span>
              </p>
              <ul className="space-y-2">
                {t.food.map((f) => (
                  <li
                    key={f.label}
                      className="flex items-center gap-3 rounded-[var(--radius-control)] bg-surface/60 p-3 opacity-70"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-sunken text-foreground/50">
                      <ShopBagIcon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{f.label}</span>
                      <span className="block text-xs text-foreground/60">{f.blurb}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2">
                <Link
                  data-close
                  href="/how-it-works/"
                  className="flex items-center justify-between rounded-[var(--radius-control)] bg-surface px-4 py-3.5 font-medium"
                >
                  {t.nav.howItWorks}
                  <ArrowRightIcon className="h-4 w-4 text-foreground/50" />
                </Link>
                <Link
                  data-close
                  href="/add-or-fix-listing/"
                  className="flex items-center justify-between rounded-[var(--radius-control)] bg-ink px-4 py-3.5 font-medium text-white"
                >
                  {t.nav.listYourBusiness}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openSearch();
                  }}
                  className="flex w-full items-center justify-between rounded-[var(--radius-control)] bg-brand-orange px-4 py-3.5 font-semibold text-white"
                >
                  {t.nav.findCare}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
