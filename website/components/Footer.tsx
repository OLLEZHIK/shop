import Link from "next/link";
import { getDefaultCity } from "@/lib/data";
import { ALL_CATEGORY_SLUGS, CATEGORY_LABELS, categoryEnumFromSlug } from "@/lib/categories";

export async function Footer() {
  const city = await getDefaultCity();
  const citySlug = city?.slug ?? "";

  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/70" aria-label="Footer">
          {ALL_CATEGORY_SLUGS.map((slug) => {
            const category = categoryEnumFromSlug(slug)!;
            return (
              <Link key={slug} href={`/${slug}/${citySlug}/`} className="hover:text-brand-blue">
                {CATEGORY_LABELS[category]}
              </Link>
            );
          })}
          <Link href="/how-it-works/" className="hover:text-brand-blue">
            How it Works
          </Link>
          <Link href="/add-or-fix-listing/" className="hover:text-brand-blue">
            Add or fix a listing
          </Link>
          <Link href="/privacy-policy/" className="hover:text-brand-blue">
            Privacy Policy
          </Link>
          <Link href="/terms-of-use/" className="hover:text-brand-blue">
            Terms of Use
          </Link>
        </nav>
        <p className="mt-6 text-center text-sm text-foreground/60">
          &copy; {new Date().getFullYear()} pawenn.com &middot; Trusted pet services in Bratislava
        </p>
      </div>
    </footer>
  );
}
