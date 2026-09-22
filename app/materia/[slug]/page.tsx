import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown, { defaultUrlTransform } from "react-markdown";
import { assetPath } from "@/lib/site";
import { settings } from "@/lib/settings";
import { ArrowLeft } from "lucide-react";
import { articles, findArticle } from "@/lib/articles";
import { Masthead, Footer, CategoryLabel, ArticleMeta, StoryImage } from "@/components/editorial";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  // Next's static exporter requires one parameter even for an empty collection.
  // This reserved value cannot be an article slug and renders notFound().
  return articles.length ? articles.map(article => ({ slug: article.slug })) : [{ slug: "__empty__" }];
}
export const dynamicParams = false;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = findArticle((await params).slug);
  return article ? { title: article.title, description: article.excerpt, robots: { index: settings.allowIndexing && !article.demo, follow: true } } : { title: "Matéria não encontrada" };
}
export default async function ArticlePage({ params }: Props) {
  const article = findArticle((await params).slug);
  if (!article) notFound();
  return <><Masthead active={article.category} /><main className="page-shell article-page" id="conteudo">
    <Link href="/" className="back-link"><ArrowLeft size={15} /> Voltar à capa</Link>
    <article><header className="article-heading"><CategoryLabel article={article} /><h1>{article.title}</h1><p className="article-deck">{article.excerpt}</p><div className="article-byline"><ArticleMeta article={article} /></div></header>
      {article.image && <figure className="article-figure"><StoryImage article={article} priority />
        {(article.imageCaption || article.imageCredit) && <figcaption>{article.imageCaption}{article.imageCredit && <> {article.imageSource ? <a href={article.imageSource} target="_blank" rel="noreferrer">Foto: {article.imageCredit}</a> : <>Foto: {article.imageCredit}</>}</>}{article.imageLicense && <> · {article.imageLicenseUrl ? <a href={article.imageLicenseUrl} target="_blank" rel="noreferrer">{article.imageLicense}</a> : article.imageLicense} · Enquadramento adaptável.</>}</figcaption>}
      </figure>}
      <div className="article-body"><Markdown skipHtml urlTransform={(url, key) => {
        const safeUrl = defaultUrlTransform(url);
        return safeUrl && (key === "src" || safeUrl.startsWith("/")) ? assetPath(safeUrl) : safeUrl;
      }} components={{ h1: ({ children }) => <h2>{children}</h2>, img: ({ src, alt }) => src ? <img src={src} alt={alt || ""} loading="lazy" /> : null }}>{article.body}</Markdown>
        <span className="article-end" aria-hidden="true" />{article.demo && <aside className="article-disclosure">Texto ilustrativo criado para a pré-estreia do Clubismo Off. Não é uma notícia apurada nem um texto assinado pelo editor.</aside>}
      </div>
    </article><div className="article-return"><Link href="/" className="text-link"><ArrowLeft size={16} /> Mais leituras na capa</Link></div>
  </main><Footer /></>;
}
