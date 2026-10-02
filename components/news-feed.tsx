import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicNews } from "@/lib/news";
import { formatNewsTime, newsDateKey } from "@/lib/news-policy";

export function NewsFeed({ items }: { items: PublicNews[] }) {
  if (!items.length) return <p className="news-empty">As próximas notícias serão publicadas aqui, com data, horário e fonte original.</p>;
  return <ol className="news-feed">{items.map(item => <li key={item.slug}>
    <time dateTime={item.publishedAt}><span>{formatNewsTime(item.publishedAt)}</span><small>{newsDateKey(item.publishedAt).split("-").reverse().join("/")}</small></time>
    <div><h3><Link href={`/ultimas/${item.slug}`}>{item.title} <ArrowUpRight size={16} aria-hidden="true" /></Link></h3><p>Fonte: {item.source.name}</p></div>
  </li>)}</ol>;
}
