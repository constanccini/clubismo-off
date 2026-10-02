import type { Metadata } from "next";
import { Masthead, Footer } from "@/components/editorial";
import { NewsFeed } from "@/components/news-feed";
import { news } from "@/lib/news";
export const metadata: Metadata = { title: "Últimas", description: "Notícias do futebol, com informação objetiva e fonte original." };
export default function LatestPage() {
  return <><Masthead active="ultimas" /><main id="conteudo" className="page-shell">
    <header className="category-heading"><span className="eyebrow">REDAÇÃO CLUBISMO OFF</span><h1>Últimas</h1><p>O que aconteceu. Quando aconteceu. De onde vem a informação.</p></header>
    <div className="latest-page"><NewsFeed items={news} /><p className="news-timezone">Horários de Brasília.</p></div>
  </main><Footer /></>;
}
