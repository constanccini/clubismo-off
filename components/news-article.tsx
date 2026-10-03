import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicNews } from "@/lib/news-schema";
import { formatNewsTime } from "@/lib/news-policy";
import { splitNewsBody } from "@/lib/news-copy";
import { NewsImage } from "@/components/news-image";
import { NewsMarkdown } from "@/components/news-markdown";

export function NewsArticle({ item, preview = false }: { item: PublicNews; preview?: boolean }) {
  const { intro, rest } = splitNewsBody(item.body);
  return <article><header className="article-heading">
    <div className="category-label"><Link href="/ultimas">Últimas</Link>{item.transferStage === "oficial" && <span>Status: Oficial</span>}</div>
    <h1>{item.title}</h1>
    {intro && <div className="article-deck news-intro"><NewsMarkdown>{intro}</NewsMarkdown></div>}
    <div className="article-byline"><div className="article-meta"><span>{item.author}</span>
      {preview && !item.publishedAt ? <span>Data definida ao publicar</span> : <time dateTime={item.publishedAt}>{formatNewsTime(item.publishedAt, true)} · Brasília</time>}
    </div></div>
  </header>
    <NewsImage item={item} />
    <div className="article-body news-body">
      <NewsMarkdown>{rest}</NewsMarkdown>
      <aside className="news-sources" aria-label="Fontes da notícia"><strong>Fonte original</strong>
        {item.source.url ? <a href={item.source.url} target="_blank" rel="noreferrer">{item.source.name} <ArrowUpRight size={15} /></a> : <span>Fonte ainda não informada</span>}
        {item.source.publishedAt && <small>Fonte publicada em {formatNewsTime(item.source.publishedAt, true)} · Brasília.</small>}
        {item.confirmations.length > 0 && <><strong>Fontes complementares</strong>{item.confirmations.map(source => <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.name} <ArrowUpRight size={15} /></a>)}</>}
      </aside>
      {item.correction && item.updatedAt && <aside className="article-disclosure"><strong>Atualização em {formatNewsTime(item.updatedAt, true)}:</strong> {item.correction}</aside>}
    </div>
  </article>;
}
