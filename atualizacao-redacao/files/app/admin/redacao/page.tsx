import type { Metadata } from "next";
import { Masthead, Footer } from "@/components/editorial";
import { NewsQueue } from "@/components/news-queue";
export const metadata: Metadata = { title: "Redação — fila de aprovação", robots: { index: false, follow: false } };
export default function NewsQueuePage() {
  return <><Masthead /><main className="page-shell redacao-page" id="conteudo"><header><span className="eyebrow">REDAÇÃO CLUBISMO OFF</span><h1>Você dá a palavra final.</h1><p>Uma fila de notícias. Leia, confira e escolha o que vai para o blog.</p></header><NewsQueue /></main><Footer /></>;
}
