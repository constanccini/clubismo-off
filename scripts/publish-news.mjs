import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parsePublishedNews } from '../lib/news-loader.ts';
import { canonicalSourceUrl } from '../lib/news-schema.ts';
import { newsBody, newsSummary } from '../lib/news-copy.ts';

export function blobSha(bytes) {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

// This runs only after an editor presses Publicar in Pages CMS. Saving a draft
// and scheduled research never call it. The blob SHA identifies the saved
// version the editor actually opened, even if unrelated files change meanwhile.
export function publishNews(payload, root = process.cwd(), now = new Date()) {
  const context = payload?.context;
  const repo = payload?.repository;
  if (payload?.source !== 'pages-cms' || payload?.action?.name !== 'publicar-noticia'
      || repo?.owner !== 'constanccini' || repo?.repo !== 'clubismo-off'
      || repo?.ref !== 'main' || repo?.workflowRef !== 'main'
      || context?.type !== 'entry' || context?.name !== 'ultimas') {
    throw new Error('Abra a notícia na Fila do Pages CMS e use Publicar.');
  }
  const path = context.path;
  if (typeof path !== 'string' || !/^content\/news\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(path)) throw new Error('Caminho da notícia inválido.');
  const expectedSha = context.data?.sha;
  if (typeof expectedSha !== 'string' || !/^[a-f0-9]{40}$/i.test(expectedSha)) throw new Error('Salve a revisão e reabra a notícia antes de publicar.');
  const reviewer = payload.triggeredBy?.name || payload.triggeredBy?.githubUsername;
  if (typeof reviewer !== 'string' || !reviewer.trim()) throw new Error('Não foi possível identificar o editor. Entre novamente no Pages CMS.');

  const filename = path.slice('content/news/'.length);
  const targetPath = `content/articles/${filename}`;
  const sourceFile = resolve(root, path), targetFile = resolve(root, targetPath);
  if (!existsSync(sourceFile)) {
    const previous = existsSync(targetFile) ? JSON.parse(readFileSync(targetFile, 'utf8')) : null;
    if (previous?.publication?.draftSha === expectedSha && previous.publication.draftPath === path) {
      // Retrying a failed deployment must not duplicate, restore or overwrite a story.
      return { path, targetPath, slug: filename.slice(0, -5), changed: false };
    }
    throw new Error('Esta notícia não está mais na Fila. Confira a aba Matérias.');
  }
  const bytes = readFileSync(sourceFile);
  if (blobSha(bytes) !== expectedSha) throw new Error('A notícia mudou desde que você a abriu. Reabra, confira a versão atual e clique em Publicar novamente.');
  if (existsSync(targetFile)) throw new Error('Já existe uma matéria com este endereço. Edite a versão em Matérias.');
  const draft = JSON.parse(bytes.toString('utf8'));
  if (!['rascunho', 'revisao'].includes(draft.status)) throw new Error('Somente uma notícia da Fila pode ser publicada por este botão.');
  // Match the minute precision of the CMS date fields so that a later save
  // cannot truncate publication time below the recorded review time.
  const timestamp = new Date(Math.floor(now.getTime() / 60000) * 60000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const record = {
    ...draft, body: newsBody(draft), recordType: 'noticia', status: 'publicado', published: true,
    category: draft.category || 'noticias', excerpt: newsSummary(newsBody(draft)), priority: 0, demo: false,
    date: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now),
    author: typeof draft.author === 'string' && draft.author.trim() ? draft.author : 'Redação Clubismo Off',
    publishedAt: timestamp, reviewedAt: timestamp, reviewer: reviewer.trim(),
    sourceChecked: true, factsChecked: true, styleChecked: true,
    publication: { draftPath: path, draftSha: expectedSha },
  };
  delete record.preview;
  delete record.lead; delete record.details; delete record.context;
  // Validate the exact record that the public build will read, before moving it.
  parsePublishedNews(record, filename.slice(0, -5), resolve(root, 'content/sources'), now.getTime());
  for (const folder of ['content/articles', 'content/news']) {
    const directory = resolve(root, folder);
    if (!existsSync(directory)) continue;
    for (const name of readdirSync(directory).filter(name => name.endsWith('.json'))) {
      if (`${folder}/${name}` === path) continue;
      const other = JSON.parse(readFileSync(resolve(directory, name), 'utf8'));
      if ((folder === 'content/articles' || other.status === 'publicado') && typeof other.sourceUrl === 'string' && other.sourceUrl
          && canonicalSourceUrl(other.sourceUrl) === canonicalSourceUrl(record.sourceUrl)) {
        throw new Error(`Este fato já está em Matérias (${name}). Edite a matéria existente.`);
      }
    }
  }
  mkdirSync(dirname(targetFile), { recursive: true });
  const temporary = `${targetFile}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx' });
  renameSync(temporary, targetFile);
  rmSync(sourceFile);
  return { path, targetPath, slug: filename.slice(0, -5), changed: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = publishNews(JSON.parse(process.env.PAGES_CMS_PAYLOAD || '{}'));
    console.log(result.changed ? 'Revisão aprovada. Matéria preparada para publicação.' : 'Matéria já aprovada. Repetindo a publicação do site.');
    if (process.env.GITHUB_OUTPUT) {
      writeFileSync(process.env.GITHUB_OUTPUT, `changed=${result.changed}\nsource_path=${result.path}\ntarget_path=${result.targetPath}\n`, { flag: 'a' });
    }
    if (process.env.GITHUB_STEP_SUMMARY) {
      writeFileSync(process.env.GITHUB_STEP_SUMMARY, 'A matéria aprovada será exibida no site ao concluir esta execução. Depois, abra **Matérias** no Pages CMS para editar, retirar do ar ou excluir.\n', { flag: 'a' });
    }
  } catch (error) {
    console.error(`Publicação interrompida: ${error.message}`);
    process.exitCode = 1;
  }
}
