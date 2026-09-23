"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getDictionary, type Locale } from "@/lib/i18n";
import { HomeSearch, type SearchCategory, type SearchOption } from "./HomeSearch";
import type { CityPointLite } from "@/lib/geo";
import { CloseIcon, SearchIcon } from "./icons";

// "Find pet care" opens the search right where the visitor is (any page):
// pet -> service (only the ones that pet needs) -> district -> results.
// Mounted once in the Header; any element can open it with openSearch().
const OPEN_EVENT = "pawenn:open-search";

export function openSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

interface SearchDialogProps {
  locale: Locale;
  citySlug: string;
  cityName: string;
  categories: SearchCategory[];
  districts: SearchOption[];
  cities: CityPointLite[];
}

export function SearchDialog({ locale, citySlug, cityName, categories, districts, cities }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const t = getDictionary(locale);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

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

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={t.search.close}
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-dialog-title"
        className="rise-in relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-surface p-5 shadow-[var(--shadow-panel)] sm:max-w-xl sm:rounded-[28px] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="search-dialog-title" className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
              <SearchIcon className="h-6 w-6 text-brand-orange" />
              {t.search.dialogTitle}
            </h2>
            <p className="mt-1 text-foreground/65">{t.search.dialogBody}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t.search.close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-sunken"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6">
          <HomeSearch
            layout="dialog"
            locale={locale}
            citySlug={citySlug}
            cityName={cityName}
            categories={categories}
            popularCategorySlugs={[]}
            districts={districts}
            popularDistrictSlugs={[]}
            cities={cities}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Button that opens the search dialog. `compact` = icon only (phones). */
export function FindCareButton({ label, className, compact }: { label: string; className?: string; compact?: boolean }) {
  return (
    <button type="button" onClick={openSearch} className={className} aria-label={compact ? label : undefined}>
      {compact ? <SearchIcon className="h-5 w-5" /> : label}
    </button>
  );
}
