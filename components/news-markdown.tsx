import ReactMarkdown from "react-markdown";

export function NewsMarkdown({ children }: { children: string }) {
  return <ReactMarkdown skipHtml allowedElements={["p", "strong", "em", "del", "a", "br", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "hr"]} unwrapDisallowed
    components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a> }}>
    {children}
  </ReactMarkdown>;
}
