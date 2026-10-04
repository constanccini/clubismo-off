import data from "@/content/.articles-build.json";
import type { Article } from "./content-loader";
export type { Article } from "./content-loader";

export { categories } from "./categories";
export type { Category } from "./categories";

export const articles: Article[] = data as Article[];
export function findArticle(slug: string) { return articles.find(article => article.slug === slug); }
