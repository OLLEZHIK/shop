"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { LANG_COOKIE } from "@/lib/locales";
import { localeOfPath, switchLocalePath } from "@/lib/localeSwitch";

// The page's language follows its URL (search engines send people to
// the right version via hreflang), so there is no switch in the header -
// just this quiet footer link to the same page in the other language.
const NAMES: Record<Locale, string> = { en: "English", sk: "Slovenčina" };

export function LanguageSwitch({ locales }: { locales: Locale[] }) {
  const pathname = usePathname() ?? "/";
  const current = localeOfPath(pathname);

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {locales.map((l) =>
        l === current ? (
          <span key={l} className="font-semibold text-white/80">
            {NAMES[l]}
          </span>
        ) : (
          <Link
            key={l}
            href={switchLocalePath(pathname, l)}
            hrefLang={l}
            // Remembered for the root "/" only (docs/design-plan.md 2.2):
            // a functional cookie set by the visitor's own choice.
            onClick={() => {
              document.cookie = `${LANG_COOKIE}=${l}; Max-Age=31536000; Path=/; SameSite=Lax`;
            }}
            className="hover:text-brand-orange"
          >
            {NAMES[l]}
          </Link>
        )
      )}
    </p>
  );
}
