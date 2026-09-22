import type { Metadata } from "next";
import { readDocsMarkdown } from "@/lib/content";
import { MarkdownContent } from "@/components/MarkdownContent";

export const metadata: Metadata = {
  title: "Terms of Use - pawenn",
  description: "Terms governing the use of pawenn.",
  robots: { index: false, follow: true },
};

export default function TermsOfUsePage() {
  const content = readDocsMarkdown("legal/terms-of-use-draft.md");
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <MarkdownContent content={content} />
    </main>
  );
}
