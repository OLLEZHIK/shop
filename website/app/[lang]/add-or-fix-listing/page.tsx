import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRightIcon, MailIcon, ShieldCheckIcon, SparkleIcon, TagIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Add or Fix a Listing - pawenn",
  description: "Add your business or correct details on an existing pawenn listing.",
};

const WHAT_TO_INCLUDE = [
  { icon: SparkleIcon, title: "Business name", body: "As customers know it, plus the kind of service." },
  { icon: TagIcon, title: "Address & contacts", body: "Street address, phone, website - whatever is public." },
  { icon: ShieldCheckIcon, title: "What to change", body: "For a fix, what's wrong and a link that shows the correct info." },
];

// English only for now - the Slovak site links here with an "(EN)" hint.
export function generateStaticParams() {
  return [{ lang: "en" }];
}

export default async function AddOrFixListingPage({ params }: { params: Promise<{ lang: string }> }) {
  if ((await params).lang !== "en") notFound();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <section className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-12 text-white md:px-12 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--brand-orange)" }}
        />
        <div className="relative max-w-2xl">
          <p className="eyebrow text-brand-orange!">For pet businesses</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Add or fix a listing</h1>
          <p className="mt-4 text-lg leading-relaxed text-white/75">
            Run a pet service business in Bratislava and don&apos;t see it listed? Spotted incorrect contact details,
            prices, or hours on an existing listing? Let us know and we&apos;ll review it.
          </p>
          <a
            href="mailto:{EMAIL}?subject=Add%20or%20fix%20a%20listing"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] bg-brand-orange px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-ink"
          >
            <MailIcon className="h-5 w-5" />
            Email us
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-extrabold text-foreground">Please include</h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {WHAT_TO_INCLUDE.map((item) => (
            <li key={item.title} className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-orange-muted text-brand-orange-deep">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-foreground/65">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
