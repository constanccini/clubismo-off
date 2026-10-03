import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Masthead, Footer } from "@/components/editorial";
import { news, findNews } from "@/lib/news";
import { settings } from "@/lib/settings";
import { NewsArticle } from "@/components/news-article";
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
    <NewsArticle item={item} /><div className="article-return"><Link href="/ultimas" className="text-link"><ArrowLeft size={16} /> Mais notícias</Link></div>
  </main><Footer /></>;
}
