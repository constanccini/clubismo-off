import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildStoryCatalog, rankStories, validReadership } from '../lib/story-catalog.ts';

const now = Date.parse('2026-10-04T03:00:00Z');
const base = { slug:'primeira', title:'Título', excerpt:'Resumo', body:'Texto.', category:'noticias', author:'Redação', minutes:1, image:'', imageAlt:'', imageCredit:'', imageSource:'', date:'2026-10-03', publishedAt:'2026-10-03T12:00:00-03:00' };
const news = { ...base, slug:'segunda', lead:'Abertura da notícia.', source:{name:'Fonte oficial'}, publishedAt:'2026-10-03T17:59:00-03:00' };

test('capa, editorias e Últimas compartilham o catálogo, com os endereços originais',()=>{
  const catalog=buildStoryCatalog([{...base,category:'opiniao'}],[news]);
  assert.deepEqual(catalog.map(s=>[s.id,s.category,s.href]),[
    ['ultimas/segunda','noticias','/ultimas/segunda/'],['materia/primeira','opiniao','/materia/primeira/'],
  ]);
  assert.equal(catalog.filter(s=>s.category==='noticias').length,1);
  assert.equal(catalog.length,2);
  assert.equal(catalog[0].excerpt,news.lead);
  for(const item of catalog) assert.equal('body' in item,false);
  assert.equal(buildStoryCatalog([], [{...news,category:'analises'}])[0].category,'analises');
});

test('sem leituras, falha de medição ou empate, vale a hora de publicação',()=>{
  const stories=buildStoryCatalog([base],[news]);
  assert.deepEqual(rankStories(stories,null,now).map(s=>s.slug),['segunda','primeira']);
  const report={windowDays:7,generatedAt:new Date(now).toISOString(),views:{'materia/primeira':5,'ultimas/segunda':5}};
  assert.deepEqual(rankStories(stories,report,now).map(s=>s.slug),['segunda','primeira']);
  report.views['materia/primeira']=20;
  assert.deepEqual(rankStories(stories,report,now).map(s=>s.slug),['primeira','segunda']);
  report.generatedAt=new Date(now-16*60_000).toISOString();
  assert.deepEqual(rankStories(stories,report,now).map(s=>s.slug),['segunda','primeira']);
  assert.equal(validReadership({...report,windowDays:30},now),null);
  assert.equal(validReadership({windowDays:7,generatedAt:new Date(now).toISOString(),views:{'materia/primeira':-1}},now),null);
});

test('o catálogo mantém a cronologia mesmo com prioridade antiga e aceita matéria sem foto',()=>{
  const catalog=buildStoryCatalog([{...base,priority:100}], [news]);
  assert.equal(catalog[0].id,'ultimas/segunda');
  assert.equal(catalog[1].image,'');
});
