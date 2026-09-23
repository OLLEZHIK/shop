import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  h1: (props) => <h1 className="mt-8 text-3xl font-extrabold text-foreground first:mt-0 md:text-5xl" {...props} />,
  h2: (props) => <h2 className="mt-10 text-2xl font-bold text-foreground" {...props} />,
  h3: (props) => <h3 className="mt-6 text-lg font-bold text-foreground" {...props} />,
  p: (props) => <p className="mt-4 leading-relaxed text-foreground/80" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6 text-foreground/80 marker:text-brand-orange" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-1 pl-6 text-foreground/80" {...props} />,
  a: (props) => <a className="text-brand-blue hover:underline" {...props} />,
  hr: (props) => <hr className="my-10 border-line" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-4 rounded-[var(--radius-control)] border border-brand-amber/40 bg-brand-amber/10 px-4 py-3 text-sm font-medium text-amber-800"
      {...props}
    />
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
}
