import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { categories, Category } from "@/lib/categories";
import { stories } from "@/lib/stories";
import { Masthead, Footer } from "@/components/editorial";
import { StoryCategory, StoryMeta, StoryCover } from "@/components/story-card";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
type Props = { params: Promise<{ category: string }> };
export function generateStaticParams() { return Object.keys(categories).map(category => ({ category })); }
export const dynamicParams = false;
export async function generateMetadata({ params }: Props): Promise<Metadata> { const category = (await params).category as Category; const info = Object.hasOwn(categories, category) ? categories[category] : undefined; return info ? { title: info.label, description: info.description } : { title: "Editoria não encontrada" }; }
export default async function CategoryPage({ params }: Props) {
  const category = (await params).category as Category;
  if (!Object.hasOwn(categories, category)) notFound();
  const info = categories[category]; const posts = stories.filter(story => story.category === category);
  return <><Masthead active={category} /><main id="conteudo" className="page-shell category-page"><header className="category-heading"><h1>{info.label}</h1><p>{info.description}</p></header>
    {posts.length ? posts.map(story => <article className={`category-story ${story.image ? "" : "no-image"}`} key={story.id}>{story.image && <Link href={story.href} tabIndex={-1} aria-hidden="true"><StoryCover story={story} /></Link>}<div><StoryCategory story={story} /><h2><Link href={story.href}>{story.title}</Link></h2><p>{story.excerpt}</p><StoryMeta story={story} /></div></article>) : <Empty className="category-empty"><EmptyHeader><EmptyMedia><Newspaper size={36} /></EmptyMedia><EmptyTitle>Novas leituras estão a caminho.</EmptyTitle><EmptyDescription className="text-base">Ainda não há publicações nesta editoria.</EmptyDescription></EmptyHeader><Link className="text-link" href="/ultimas">Ver as últimas publicações</Link></Empty>}
  </main><Footer /></>;
}
