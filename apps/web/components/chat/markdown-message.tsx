"use client"

import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

/**
 * Renders assistant prose as GitHub-flavored Markdown — bold, italics,
 * bullet/numbered lists, headings, inline code, block code, links. Emits the
 * block elements directly into the parent (no wrapper div), so the consumer
 * can style and post-pseudo-element the last block (streaming caret).
 * Streamed partial markdown (e.g. an unclosed `**`) renders as raw text for a
 * beat until the closing pair arrives mid-typewriter — standard chat behavior.
 */
export function MarkdownMessage({ content }: { content: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>
}

const components: Components = {
  p: ({ children }) => <p className="my-2.5 first:mt-0 last:mb-0">{children}</p>,

  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="text-foreground/90">{children}</em>,
  del: ({ children }) => <del className="text-muted-foreground">{children}</del>,

  h1: ({ children }) => (
    <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="mt-3.5 text-[14px] font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="mt-3 text-[13.5px] font-semibold text-foreground first:mt-0">{children}</h5>
  ),

  ul: ({ children }) => (
    <ul className="my-2.5 ml-5 list-disc space-y-1 marker:text-muted-foreground/70">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2.5 ml-5 list-decimal space-y-1 marker:text-muted-foreground/70">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,

  blockquote: ({ children }) => (
    <blockquote className="my-2.5 border-l-2 border-accent-bright/40 pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),

  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-accent-bright underline decoration-accent-bright/40 underline-offset-2 hover:decoration-accent-bright"
    >
      {children}
    </a>
  ),

  code: ({ className, children }) => {
    const inBlock = typeof className === "string" && className.startsWith("language-")
    if (inBlock) {
      return <code className="font-mono text-[12.5px] leading-relaxed">{children}</code>
    }
    return (
      <code className="rounded bg-elevated px-1 py-0.5 font-mono text-[12.5px] text-foreground/90">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="my-2.5 overflow-x-auto rounded-lg border border-border bg-elevated/70 p-3">
      {children}
    </pre>
  ),

  hr: () => <hr className="my-3 border-border" />,

  table: ({ children }) => (
    <div className="my-2.5 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-[12.5px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border bg-elevated/60 px-2.5 py-1.5 text-left font-medium text-muted-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border-b border-border/60 px-2.5 py-1.5">{children}</td>,
}
