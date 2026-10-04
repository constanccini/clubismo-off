import { articles } from "./articles";
import { news } from "./news";
import { buildStoryCatalog } from "./story-catalog";

export const stories = buildStoryCatalog(articles, news);
