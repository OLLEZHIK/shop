import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { readDocsMarkdown } from "@/lib/content";
import { MarkdownContent } from "@/components/MarkdownContent";

export const metadata: Metadata = {
  title: "Terms of Use - pawenn",
  description: "Terms governing the use of pawenn.",
  robots: { index: false, follow: true },
  // English only for now; v2 URL with the /en/ prefix.
  alternates: { canonical: `${SITE_URL}/en/terms-of-use/` },
};

// English only for now - the Slovak site links here with an "(EN)" hint.
export function generateStaticParams() {
  return [{ lang: "en" }];
}

export default async function TermsOfUsePage({ params }: { params: Promise<{ lang: string }> }) {
  if ((await params).lang !== "en") notFound();
  const content = readDocsMarkdown("legal/terms-of-use-draft.md");
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <article className="rounded-[28px] bg-surface p-6 shadow-[var(--shadow-card)] md:p-12">
        <MarkdownContent content={content} />
      </article>
    </main>
  );
}
