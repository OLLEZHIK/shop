import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { readDocsMarkdown } from "@/lib/content";
import { MarkdownContent } from "@/components/MarkdownContent";

export const metadata: Metadata = {
  title: "How It Works - pawenn",
  description: "How pawenn finds, verifies and ranks pet service listings in Bratislava.",
  // English only; v2 URL with the /en/ prefix.
  alternates: { canonical: `${SITE_URL}/en/how-it-works/` },
};

// English only, in every language of the site (owner, 2026-09-26): all
// locales link here without a language hint.
export function generateStaticParams() {
  return [{ lang: "en" }];
}

export default async function HowItWorksPage({ params }: { params: Promise<{ lang: string }> }) {
  if ((await params).lang !== "en") notFound();
  const content = readDocsMarkdown("content/how-it-works-draft.md");
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <article className="rounded-[28px] bg-surface p-6 shadow-[var(--shadow-card)] md:p-12">
        <MarkdownContent content={content} />
      </article>
    </main>
  );
}
