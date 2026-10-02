import data from "@/content/.news-build.json";
import type { PublicNews } from "./news-loader";
export type { PublicNews } from "./news-loader";
export const news: PublicNews[] = data as PublicNews[];
export function findNews(slug: string) { return news.find(item => item.slug === slug); }
