import type { Metadata } from "next";
import { readDocsMarkdown } from "@/lib/content";
import { MarkdownContent } from "@/components/MarkdownContent";

export const metadata: Metadata = {
  title: "How It Works - pawenn",
  description: "How pawenn finds, verifies and ranks pet service listings in Bratislava.",
};

export default function HowItWorksPage() {
  const content = readDocsMarkdown("content/how-it-works-draft.md");
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <MarkdownContent content={content} />
    </main>
  );
}
