import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Story } from "@/lib/story-catalog";
import { categories } from "@/lib/categories";
import { formatNewsTime, newsDateKey } from "@/lib/news-policy";

export function StoryFeed({ items }: { items: Story[] }) {
  if (!items.length) return <p className="news-empty">As próximas publicações aparecerão aqui.</p>;
  return <ol className="news-feed">{items.map(item => <li key={item.id}>
    <time dateTime={item.publishedAt || undefined}><span>{item.publishedAt ? formatNewsTime(item.publishedAt) : "—"}</span><small>{item.publishedAt ? newsDateKey(item.publishedAt).split("-").reverse().join("/") : ""}</small></time>
    <div><h3><Link href={item.href}>{item.title} <ArrowUpRight size={16} aria-hidden="true" /></Link></h3>
      <p><Link href={`/categoria/${item.category}`}>{categories[item.category].label}</Link>{item.sourceName ? ` · Fonte: ${item.sourceName}` : ` · ${item.author}`}</p>
    </div>
  </li>)}</ol>;
}
