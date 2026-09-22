import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { articles, categories, Category } from "@/lib/articles";
import { Masthead, Footer, CategoryLabel, ArticleMeta, StoryImage } from "@/components/editorial";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
type Props = { params: Promise<{ category: string }> };
export function generateStaticParams() { return Object.keys(categories).map(category => ({ category })); }
export const dynamicParams = false;
export async function generateMetadata({ params }: Props): Promise<Metadata> { const category = (await params).category as Category; const info = Object.hasOwn(categories, category) ? categories[category] : undefined; return info ? { title: info.label, description: info.description } : { title: "Editoria não encontrada" }; }
export default async function CategoryPage({ params }: Props) {
  const category = (await params).category as Category;
  if (!Object.hasOwn(categories, category)) notFound();
  const info = categories[category]; const posts = articles.filter(article => article.category === category);
  return <><Masthead active={category} /><main id="conteudo" className="page-shell category-page"><header className="category-heading"><h1>{info.label}</h1><p>{info.description}</p></header>
    {posts.length ? posts.map(article => <article className={`category-story ${article.image ? "" : "no-image"}`} key={article.slug}>{article.image && <Link href={`/materia/${article.slug}`} tabIndex={-1} aria-hidden="true"><StoryImage article={article} /></Link>}<div><CategoryLabel article={article} /><h2><Link href={`/materia/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p><ArticleMeta article={article} /></div></article>) : <Empty className="category-empty"><EmptyHeader><EmptyMedia><Newspaper size={36} /></EmptyMedia><EmptyTitle>A apuração vem antes da manchete.</EmptyTitle><EmptyDescription className="text-base">Ainda não há notícias publicadas. Enquanto isso, a conversa já começou nas nossas editorias de opinião e análise.</EmptyDescription></EmptyHeader><Link className="text-link" href="/categoria/opiniao">Ler opiniões →</Link></Empty>}
  </main><Footer /></>;
}
