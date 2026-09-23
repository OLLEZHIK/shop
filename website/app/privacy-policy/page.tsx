import type { Metadata } from "next";
import { readDocsMarkdown } from "@/lib/content";
import { MarkdownContent } from "@/components/MarkdownContent";

export const metadata: Metadata = {
  title: "Privacy Policy - pawenn",
  description: "How pawenn collects, uses and protects data.",
  robots: { index: false, follow: true },
};

export default function PrivacyPolicyPage() {
  const content = readDocsMarkdown("legal/privacy-policy-draft.md");
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <article className="rounded-[28px] bg-surface p-6 shadow-[var(--shadow-card)] md:p-12">
        <MarkdownContent content={content} />
      </article>
    </main>
  );
}
