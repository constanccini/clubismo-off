import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { blobSha, publishNews } from '../scripts/publish-news.mjs';
import { readNews } from '../lib/news-loader.ts';
import { readArticles } from '../lib/content-loader.ts';
import { buildStoryCatalog } from '../lib/story-catalog.ts';

const now = new Date('2026-10-03T20:00:38Z');
const draft = {
  status: 'revisao', origin: 'redacao', ticket: '20261003-12-01',
  title: 'Clube Exemplo vence a partida', body: 'Texto revisado pelo editor.\n\nDetalhes **conferidos** na fonte.',
  type: 'resultado', source: 'content/sources/clube-exemplo.json',
  sourceUrl: 'https://clube-exemplo.invalid/partida', sourcePublishedAt: '2026-10-03T10:00Z',
  evidence: 'Placar conferido pelo editor.', reviewNote: 'Observação apenas para revisão.',
  image: '/images/campo.jpg', imageAlt: 'Campo', imageCredit: 'Fotógrafo',
  imageLicense: 'CC BY 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
};
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'clubismo-publish-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of ['news', 'sources', 'articles']) mkdirSync(join(root, 'content', dir), { recursive: true });
  const source = join(root, 'content/news/nota.json'), target = join(root, 'content/articles/nota.json');
  writeFileSync(source, JSON.stringify(draft));
  writeFileSync(join(root, 'content/sources/clube-exemplo.json'), JSON.stringify({ name: 'Clube Exemplo', grade: 'A', active: true, baseUrl: 'https://clube-exemplo.invalid' }));
  const payload = {
    source: 'pages-cms', action: { name: 'publicar-noticia' },
    repository: { owner: 'constanccini', repo: 'clubismo-off', ref: 'main', workflowRef: 'main' },
    triggeredBy: { name: 'Bruno', githubUsername: 'constanccini' },
    context: { type: 'entry', name: 'ultimas', path: 'content/news/nota.json', data: { sha: blobSha(readFileSync(source)), content: draft } },
  };
  return { root, source, target, payload, read: () => readNews(join(root, 'content/news'), join(root, 'content/sources'), now.getTime()) };
}

test('Publicar move a versão aprovada para Matérias e preserva o texto, foto e fonte da prévia', t => {
  const f = fixture(t);
  assert.deepEqual(f.read(), []);
  const result = publishNews(f.payload, f.root, now);
  assert.equal(result.changed, true); assert.equal(existsSync(f.source), false);
  const saved = JSON.parse(readFileSync(f.target, 'utf8'));
  assert.equal(saved.published, true); assert.equal(saved.reviewer, 'Bruno');
  assert.equal(saved.publishedAt, '2026-10-03T20:00:00Z'); assert.equal(saved.date, '2026-10-03');
  const [item] = f.read();
  for (const key of ['body', 'title', 'image', 'imageCredit', 'imageLicenseUrl']) assert.equal(item[key], draft[key]);
  assert.equal(item.source.url, draft.sourceUrl);
  for (const key of ['evidence', 'reviewer', 'reviewNote', 'publication', 'sourceChecked']) assert.equal(key in item, false);
  // Separate validated loaders now feed the same public cover/category catalog.
  assert.deepEqual(readArticles(join(f.root, 'content/articles')), []);
  const catalog = buildStoryCatalog(readArticles(join(f.root, 'content/articles')), f.read());
  assert.equal(catalog[0].category, 'noticias');
  assert.equal(catalog[0].href, '/ultimas/nota/');
  assert.equal(publishNews(f.payload, f.root, now).changed, false);

  saved.body = 'Texto corrigido.\n\nNovo parágrafo.';
  saved.publishedAt = '2026-10-03T20:00Z'; // date format emitted by Pages CMS
  writeFileSync(f.target, JSON.stringify(saved)); assert.equal(f.read()[0].body, saved.body);
  saved.published = false; writeFileSync(f.target, JSON.stringify(saved)); assert.deepEqual(f.read(), []);
  publishNews(f.payload, f.root, now); assert.deepEqual(f.read(), []); // retry must not restore it
  saved.published = true; writeFileSync(f.target, JSON.stringify(saved)); assert.equal(f.read().length, 1);
  rmSync(f.target); assert.deepEqual(f.read(), []);
  assert.throws(() => publishNews(f.payload, f.root, now), /não está mais/);
});

test('Publicar respeita a editoria salva e reclassificar preserva o endereço', t => {
  const f=fixture(t);
  writeFileSync(f.source, JSON.stringify({...draft, category:'resenha'}));
  f.payload.context.data.sha=blobSha(readFileSync(f.source));
  publishNews(f.payload,f.root,now);
  assert.equal(JSON.parse(readFileSync(f.target,'utf8')).category,'resenha');
  assert.equal(buildStoryCatalog([],f.read())[0].category,'resenha');
  const saved=JSON.parse(readFileSync(f.target,'utf8'));
  saved.category='analises'; writeFileSync(f.target,JSON.stringify(saved));
  assert.equal(buildStoryCatalog([],f.read())[0].category,'analises');
  assert.equal(buildStoryCatalog([],f.read())[0].href,'/ultimas/nota/');
  saved.published=false; writeFileSync(f.target,JSON.stringify(saved));
  assert.deepEqual(buildStoryCatalog([],f.read()),[]);
});

test('Publicar recusa versão antiga, fonte inválida e contexto indevido sem tirar o rascunho da Fila', t => {
  const f = fixture(t);
  for (const payload of [{}, { ...f.payload, context: { ...f.payload.context, path: 'content/settings.json' } }, { ...f.payload, context: { ...f.payload.context, data: {} } }]) {
    assert.throws(() => publishNews(payload, f.root, now));
    assert.equal(existsSync(f.source), true); assert.equal(existsSync(f.target), false);
  }
  writeFileSync(f.source, JSON.stringify({ ...draft, body: 'Texto alterado depois de abrir o painel.' }));
  assert.throws(() => publishNews(f.payload, f.root, now), /mudou/);
  writeFileSync(f.source, JSON.stringify({ ...draft, sourceUrl: 'https://outro.invalid/partida' }));
  f.payload.context.data.sha = blobSha(readFileSync(f.source));
  assert.throws(() => publishNews(f.payload, f.root, now), /não pertence/);
  assert.equal(existsSync(f.source), true); assert.equal(existsSync(f.target), false);
});

test('não duplica uma notícia existente em Matérias, mesmo que tenha sido retirada do site', t => {
  const f = fixture(t);
  writeFileSync(join(f.root, 'content/articles/outra.json'), JSON.stringify({ ...draft, published: false, sourceUrl: `${draft.sourceUrl}/?utm_source=rede` }));
  assert.throws(() => publishNews(f.payload, f.root, now), /já está em Matérias/);
  assert.equal(existsSync(f.source), true); assert.equal(existsSync(f.target), false);
});
