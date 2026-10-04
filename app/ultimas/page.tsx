import type { Metadata } from "next";
import { Masthead, Footer } from "@/components/editorial";
import { StoryFeed } from "@/components/story-feed";
import { stories } from "@/lib/stories";
export const metadata: Metadata = { title: "Últimas", description: "As publicações mais recentes do Clubismo Off." };
export default function LatestPage() {
  return <><Masthead active="ultimas" /><main id="conteudo" className="page-shell">
    <header className="category-heading"><h1>Últimas</h1><p>Notícias, opinião, análises e resenha. Da publicação mais recente à mais antiga.</p></header>
    <div className="latest-page"><StoryFeed items={stories} /><p className="news-timezone">Horários de Brasília.</p></div>
  </main><Footer /></>;
}
