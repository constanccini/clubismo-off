import type { Metadata } from "next";
import { Masthead, Footer } from "@/components/editorial";
import { NewsPreview } from "@/components/news-preview";

export const metadata: Metadata = { title: "Prévia da notícia", robots: { index: false, follow: false } };

export default function NewsPreviewPage() {
  return <><Masthead /><main id="conteudo" className="page-shell article-page"><NewsPreview /></main><Footer /></>;
}
