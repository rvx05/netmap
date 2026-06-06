import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="text-lg font-black tracking-tight text-foreground mt-4 mb-2 first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-base font-bold tracking-tight text-foreground mt-4 mb-2 first:mt-0 border-b border-border pb-1" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-sm font-bold text-foreground mt-3 mb-1" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-2 last:mb-0 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-2 list-disc pl-5 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-2 list-decimal pl-5 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 border border-border bg-muted text-sm font-mono text-amber"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <div className="border-2 border-border bg-muted overflow-x-auto mb-2 last:mb-0">
        <code className="block px-4 py-3 text-sm font-mono leading-relaxed text-foreground" {...props}>
          {children}
        </code>
      </div>
    )
  },
  pre: ({ children, ...props }) => <>{children}</>,
  strong: ({ children, ...props }) => (
    <strong className="font-bold text-foreground" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-amber underline underline-offset-2 hover:no-underline"
      {...props}
    >
      {children}
    </a>
  ),
  hr: (props) => <hr className="my-4 border-border" {...props} />,
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-2 border-amber pl-4 my-2 text-muted-foreground" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-2">
      <table className="w-full border-collapse border-2 border-border text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border-2 border-border bg-muted px-3 py-2 text-left font-bold font-mono text-xs uppercase tracking-wider" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-2 border-border px-3 py-2 font-mono text-xs" {...props}>
      {children}
    </td>
  ),
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-none">
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
