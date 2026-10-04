import { writeFileSync } from 'node:fs';
import { readArticles } from '../lib/content-loader.ts';
import { readNews } from '../lib/news-loader.ts';
import { buildStoryCatalog } from '../lib/story-catalog.ts';

const articles = readArticles();
writeFileSync(new URL('../content/.articles-build.json', import.meta.url), JSON.stringify(articles));
console.log(`Conteúdo preparado: ${articles.length} matéria(s) publicada(s).`);
const news = readNews();
writeFileSync(new URL('../content/.news-build.json', import.meta.url), JSON.stringify(news));
console.log(`Últimas: ${news.length} nota(s) revisada(s) e publicada(s). Modo manual.`);
const catalog = buildStoryCatalog(articles, news).map(({ id, href }) => ({ id, href }));
writeFileSync(new URL('../public/catalog.json', import.meta.url), JSON.stringify(catalog));
