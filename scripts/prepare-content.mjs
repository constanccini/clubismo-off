import { writeFileSync } from 'node:fs';
import { readArticles } from '../lib/content-loader.ts';

const articles = readArticles();
writeFileSync(new URL('../content/.articles-build.json', import.meta.url), JSON.stringify(articles));
console.log(`Conteúdo preparado: ${articles.length} matéria(s) publicada(s).`);
