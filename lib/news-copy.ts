/** The editor's complete text is authoritative, including an intentional deletion. */
export function newsBody(value: Record<string, unknown>): string {
  if (Object.prototype.hasOwnProperty.call(value, "body")) return typeof value.body === "string" ? value.body.trim() : "";
  return [value.lead, value.details, value.context].filter((part): part is string => typeof part === "string" && !!part.trim()).map(part => part.trim()).join("\n\n");
}

export function splitNewsBody(body: string) {
  const blocks = body.trim().replace(/\r\n/g, "\n").split(/\n\s*\n/);
  const first = blocks[0] || "";
  // A normal opening paragraph keeps the blog's existing deck treatment.
  // Lists, headings and other blocks stay together in the article body.
  if (/^(?:#{1,6}\s|[-+*]\s|\d+[.)]\s|>|```|~~~|!\[)/.test(first)) return { intro: "", rest: body.trim() };
  return { intro: first, rest: blocks.slice(1).join("\n\n") };
}

export function newsSummary(body: string) {
  return (splitNewsBody(body).intro || body).replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`#>]/g, "").replace(/\s+/g, " ").trim().slice(0, 650);
}
