import type { Article } from "./content-loader.ts";
import type { PublicNews } from "./news-schema.ts";
import type { Category } from "./categories.ts";

export type Story = {
  id: string; slug: string; href: string; title: string; excerpt: string;
  category: Category; author: string; publishedAt: string; minutes: number;
  image: string; imageAlt: string; imageCredit: string; imageSource: string;
  sourceName: string;
};

export function newestFirst(a: Story, b: Story) {
  return (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0) || a.id.localeCompare(b.id);
}

/** Only accepts the public, validated loaders. Drafts and review data never enter this catalog. */
export function buildStoryCatalog(articles: Article[], news: PublicNews[]): Story[] {
  return [
    ...articles.map(a => ({
      id: `materia/${a.slug}`, slug: a.slug, href: `/materia/${a.slug}/`,
      title: a.title, excerpt: a.excerpt, category: a.category,
      author: a.author || "Redação Clubismo Off", publishedAt: a.publishedAt || (a.date ? `${a.date}T00:00:00-03:00` : ""),
      minutes: a.minutes, image: a.image, imageAlt: a.imageAlt,
      imageCredit: a.imageCredit, imageSource: a.imageSource, sourceName: "",
    })),
    ...news.map(n => ({
      id: `ultimas/${n.slug}`, slug: n.slug, href: `/ultimas/${n.slug}/`,
      title: n.title, excerpt: n.lead, category: n.category,
      author: n.author, publishedAt: n.publishedAt, minutes: Math.max(1, Math.ceil(n.body.split(/\s+/).length / 200)),
      image: n.image, imageAlt: n.imageAlt, imageCredit: n.imageCredit,
      imageSource: n.imageSource, sourceName: n.source.name,
    })),
  ].sort(newestFirst);
}

export type WeeklyReadership = { windowDays: 7; generatedAt: string; views: Record<string, number> };

export function validReadership(value: unknown, now = Date.now()): WeeklyReadership | null {
  if (!value || typeof value !== "object") return null;
  const data = value as WeeklyReadership;
  const generated = Date.parse(data.generatedAt);
  if (data.windowDays !== 7 || !Number.isFinite(generated) || generated > now + 60_000 || now - generated > 15 * 60_000
      || !data.views || typeof data.views !== "object" || Array.isArray(data.views)) return null;
  if (Object.values(data.views).some(count => !Number.isSafeInteger(count) || count < 0)) return null;
  return data;
}

export function rankStories(stories: Story[], readership: WeeklyReadership | null, now = Date.now()): Story[] {
  const data = validReadership(readership, now);
  return [...stories].sort((a, b) => (data?.views[b.id] || 0) - (data?.views[a.id] || 0) || newestFirst(a, b));
}
