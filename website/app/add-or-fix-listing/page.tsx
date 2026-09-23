import type { Metadata } from "next";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Add or Fix a Listing - pawenn",
  description: "Add your business or correct details on an existing pawenn listing.",
};

export default function AddOrFixListingPage() {
  return (
    <main className="relative mx-auto max-w-2xl px-4 py-10">
      <AmbientBackground />

      <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">Add or Fix a Listing</h1>

      <div className="mt-6 rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)] md:p-8">
        <p className="leading-relaxed text-foreground/80">
          Run a pet service business in Bratislava and don&apos;t see it listed? Spotted incorrect contact
          details, prices, or hours on an existing listing? Let us know and we&apos;ll review it.
        </p>
        <p className="mt-4 leading-relaxed text-foreground/80">
          Please include the business name, its address, and what should be added or corrected.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Add%20or%20fix%20a%20listing`}
          className="mt-6 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-brand-orange px-6 py-3 font-medium text-white transition hover:bg-brand-orange/90"
        >
          Email us
        </a>
      </div>
    </main>
  );
}
