import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Masthead, Footer } from "@/components/editorial";
import { news, findNews } from "@/lib/news";
import { formatNewsTime } from "@/lib/news-policy";
import { settings } from "@/lib/settings";
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return news.length ? news.map(item => ({ slug: item.slug })) : [{ slug: "__empty__" }]; }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = findNews((await params).slug);
  return item ? { title: item.title, description: item.lead, robots: { index: settings.allowIndexing, follow: true } } : { title: "Notícia não encontrada" };
}
export default async function NewsPage({ params }: Props) {
  const item = findNews((await params).slug);
  if (!item) notFound();
  return <><Masthead active="ultimas" /><main id="conteudo" className="page-shell article-page">
    <Link href="/ultimas" className="back-link"><ArrowLeft size={15} /> Todas as notícias</Link>
    <article><header className="article-heading"><div className="category-label"><Link href="/ultimas">Últimas</Link>{item.transferStage === "oficial" && <span>Status: Oficial</span>}</div><h1>{item.title}</h1>
      <p className="article-deck">{item.lead}</p><div className="article-byline"><div className="article-meta"><span>{item.author}</span><time dateTime={item.publishedAt}>{formatNewsTime(item.publishedAt, true)} · Brasília</time></div></div></header>
      <div className="article-body news-body"><p>{item.details}</p>{item.context && <p>{item.context}</p>}
        <aside className="news-sources" aria-label="Fontes da notícia"><strong>Fonte original</strong><a href={item.source.url} target="_blank" rel="noreferrer">{item.source.name} <ArrowUpRight size={15} /></a>
          {item.source.publishedAt && <small>Fonte publicada em {formatNewsTime(item.source.publishedAt, true)} · Brasília.</small>}
          {item.confirmations.length > 0 && <><strong>Fontes complementares</strong>{item.confirmations.map(source => <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.name} <ArrowUpRight size={15} /></a>)}</>}
        </aside>
        {item.correction && <aside className="article-disclosure"><strong>Atualização em {formatNewsTime(item.updatedAt, true)}:</strong> {item.correction}</aside>}
      </div>
    </article><div className="article-return"><Link href="/ultimas" className="text-link"><ArrowLeft size={16} /> Mais notícias</Link></div>
  </main><Footer /></>;
}
