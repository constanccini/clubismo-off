import Link from "next/link";
import { Clock3 } from "lucide-react";
import type { Story } from "@/lib/story-catalog";
import { categories } from "@/lib/categories";
import { assetPath } from "@/lib/site";

export function StoryCategory({ story }: { story: Story }) {
  return <div className="category-label"><Link href={`/categoria/${story.category}`}>{categories[story.category].label}</Link></div>;
}

export function StoryMeta({ story }: { story: Story }) {
  return <div className="article-meta"><span>{story.author}</span>
    {story.publishedAt && <time dateTime={story.publishedAt}>{new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(story.publishedAt))}</time>}
    <span className="read-time"><Clock3 size={13} aria-hidden="true" /> {story.minutes} min de leitura</span>
  </div>;
}

export function StoryCover({ story, eager = false }: { story: Story; eager?: boolean }) {
  return story.image ? <img className="story-image" src={assetPath(story.image)} alt={story.imageAlt} width={1200} height={760} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} /> : null;
}

export function StoryCard({ story }: { story: Story }) {
  return <article className="cover-card">
    {story.image && <Link href={story.href} tabIndex={-1} aria-hidden="true"><StoryCover story={story} /></Link>}
    <StoryCategory story={story} /><h3><Link href={story.href}>{story.title}</Link></h3>
    <p>{story.excerpt}</p><StoryMeta story={story} />
  </article>;
}
