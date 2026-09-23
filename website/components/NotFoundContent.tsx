"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { ArrowRightIcon, PawIcon } from "./icons";

// not-found files get no route params, so the locale comes from the URL.
export function NotFoundContent() {
  const pathname = usePathname() ?? "/";
  const locale = pathname === "/sk" || pathname.startsWith("/sk/") ? "sk" : "en";
  const t = getDictionary(locale).notFound;

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <div className="relative">
        <span className="font-heading text-8xl font-extrabold text-foreground/10 md:text-9xl">404</span>
        <PawIcon className="float-y absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-brand-orange" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold text-foreground">{t.title}</h1>
      <p className="mt-3 text-foreground/65">{t.body}</p>
      <Link
        href={locale === "sk" ? "/sk/" : "/"}
        className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] bg-ink px-6 font-semibold text-white transition hover:bg-brand-blue"
      >
        {t.back}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </main>
  );
}
