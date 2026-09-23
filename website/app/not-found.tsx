import Link from "next/link";
import { AmbientBackground } from "@/components/AmbientBackground";
import { PawIcon } from "@/components/icons";
import { getDefaultCity } from "@/lib/data";
import { ALL_CATEGORY_SLUGS, CATEGORY_LABELS, categoryEnumFromSlug } from "@/lib/categories";

export default async function NotFound() {
  const city = await getDefaultCity();
  const citySlug = city?.slug ?? "";

  return (
    <main className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center px-4 py-16 text-center">
      <AmbientBackground />

      <PawIcon className="h-12 w-12 text-brand-orange" />
      <h1 className="mt-4 font-heading text-3xl font-bold text-foreground md:text-4xl">Page not found</h1>
      <p className="mt-3 text-foreground/70">
        This page doesn&apos;t exist, or the listing it pointed to may have been removed.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-brand-orange px-6 py-3 font-medium text-white transition hover:bg-brand-orange/90"
      >
        Back to home
      </Link>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {ALL_CATEGORY_SLUGS.map((slug) => {
          const category = categoryEnumFromSlug(slug)!;
          return (
            <Link
              key={slug}
              href={`/${slug}/${citySlug}/`}
              className="pill-hover px-3 py-1.5 text-sm text-foreground/80"
            >
              {CATEGORY_LABELS[category]}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
