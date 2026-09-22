import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  h1: (props) => <h1 className="mt-8 text-3xl font-bold text-foreground first:mt-0" {...props} />,
  h2: (props) => <h2 className="mt-8 text-xl font-semibold text-foreground" {...props} />,
  h3: (props) => <h3 className="mt-6 text-lg font-semibold text-foreground" {...props} />,
  p: (props) => <p className="mt-4 leading-relaxed text-foreground/80" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-1 pl-6 text-foreground/80" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-1 pl-6 text-foreground/80" {...props} />,
  a: (props) => <a className="text-brand-blue hover:underline" {...props} />,
  hr: (props) => <hr className="my-8 border-gray-200" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-4 rounded-lg border border-brand-amber bg-brand-amber/10 px-4 py-3 text-sm font-medium text-brand-amber"
      {...props}
    />
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
}
