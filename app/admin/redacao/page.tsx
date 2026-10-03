import type { Metadata } from "next";
import { Masthead, Footer } from "@/components/editorial";
export const metadata: Metadata = { title: "Redação — fila de aprovação", robots: { index: false, follow: false } };
export default function NewsQueuePage() {
  return <><Masthead /><main className="page-shell redacao-page" id="conteudo"><header><span className="eyebrow">REDAÇÃO CLUBISMO OFF</span><h1>Fila de notícias</h1><p>Revise e salve o texto no Pages CMS. O botão Publicar coloca a notícia no site e a leva para Matérias.</p></header><a className="panel-button" href="https://app.pagescms.org/constanccini/clubismo-off/main/collection/ultimas">Abrir Fila</a></main><Footer /></>;
}
