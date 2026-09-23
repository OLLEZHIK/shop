"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { localeOfPath, switchLocalePath } from "@/lib/localeSwitch";

// "EN | SK" pill linking to the same page in the other language.
export function LanguageSwitch({ locales }: { locales: Locale[] }) {
  const pathname = usePathname() ?? "/";
  const current = localeOfPath(pathname);

  return (
    <div className="inline-flex rounded-[var(--radius-control)] bg-surface-sunken p-1 text-sm font-semibold">
      {locales.map((l) => (
        <Link
          key={l}
          href={switchLocalePath(pathname, l)}
          hrefLang={l}
          aria-current={l === current ? "true" : undefined}
          className={`rounded-[10px] px-2.5 py-1.5 uppercase transition ${
            l === current ? "bg-surface text-foreground shadow-[var(--shadow-card)]" : "text-foreground/55 hover:text-foreground"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
