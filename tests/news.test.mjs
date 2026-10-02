import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readNews } from '../lib/news-loader.ts';
import { newsSchema, urlBelongsToSource } from '../lib/news-schema.ts';
import { assessNewsPolicy } from '../lib/news-policy.ts';
import { postNews, deleteNewsDraft } from '../lib/news-panel.ts';

const now = new Date('2026-09-30T22:00:00Z');
const source = { name:'Clube Exemplo', grade:'A', active:true, baseUrl:'https://clube-exemplo.invalid' };
const draft = { ticket:'20260930-18-01', status:'revisao', origin:'redacao', title:'Clube Exemplo renova vínculo até 2029', lead:'O Clube Exemplo anunciou em 30 de setembro a renovação do vínculo.', details:'O vínculo vai até dezembro de 2029. O comunicado não informa os valores.', type:'renovacao', transferStage:'oficial', source:'content/sources/clube-exemplo.json', sourceUrl:'https://clube-exemplo.invalid/noticia', sourcePublishedAt:'2026-09-30T14:00-03:00', evidence:'Renovação e duração conferidas no comunicado fictício.', sensitive:false };
const published = { ...draft, status:'publicado', publishedAt:'2026-09-30T18:00-03:00', reviewer:'Bruno', reviewedAt:'2026-09-30T17:59-03:00', sourceChecked:true, factsChecked:true, styleChecked:true };
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(),'clubismo-news-')); const news = join(root,'news'), sources=join(root,'sources');
  mkdirSync(news); mkdirSync(sources); t.after(()=>rmSync(root,{recursive:true,force:true}));
  const save=(value,name='nota')=>writeFileSync(join(news,`${name}.json`),JSON.stringify(value));
  const saveSource=(value,name='clube-exemplo')=>writeFileSync(join(sources,`${name}.json`),JSON.stringify(value));
  saveSource(source);
  return { news, sources, save, saveSource, read:()=>readNews(news,sources,now.getTime()) };
}
test('rascunho → revisão → publicação → arquivo → exclusão; bastidores não vazam na exportação', t=>{
  const f=fixture(t);
  f.save({title:'Incompleto',status:'rascunho'}); assert.deepEqual(f.read(),[]);
  f.save(draft); assert.deepEqual(f.read(),[]);
  f.save(published); const result=f.read(); assert.equal(result.length,1); assert.equal(result[0].author,'Redação Clubismo Off');
  assert.equal(result[0].source.name,'Clube Exemplo');
  for (const key of ['evidence','reviewer','reviewedAt','grade','status','sourceChecked']) assert.equal(key in result[0],false);
  f.save({...published,title:'Título corrigido'}); assert.equal(f.read()[0].slug,'nota');
  f.save({...published,status:'arquivado'}); assert.deepEqual(f.read(),[]);
  rmSync(f.news,{recursive:true}); assert.deepEqual(f.read(),[]);
});
test('publicação exige três conferências, revisor e fonte ativa vinculada ao link',t=>{
  const f=fixture(t);
  for (const [key,value] of [['sourceChecked',false],['factsChecked',false],['styleChecked',false],['reviewer',''],['sourceUrl','javascript:alert(1)'],['sourceUrl','https://outro.invalid/noticia']]) {
    f.save({...published,[key]:value}); assert.throws(f.read,/Revise Últimas/);
  }
  f.save(published); f.saveSource({...source,active:false}); assert.throws(f.read,/desativada/);
});
test('fonte A não libera tema sensível; B é revisão; C requer confirmação; D bloqueia',t=>{
  const base={grade:'A',type:'renovacao',transferStage:'oficial',sensitive:false,confirmedByOfficial:false};
  assert.equal(assessNewsPolicy(base).futureAutomatic,true);
  assert.equal(assessNewsPolicy(base).publicationMode,'manual');
  for (const type of ['legislacao','politica','financas','arbitragem','bastidores','acusacao']) assert.equal(assessNewsPolicy({...base,type}).futureAutomatic,false);
  assert.equal(assessNewsPolicy({...base,sensitive:true}).level,'C');
  assert.equal(assessNewsPolicy({...base,grade:'B'}).futureAutomatic,false);
  assert.equal(assessNewsPolicy({...base,grade:'C'}).canPublish,false);
  assert.equal(assessNewsPolicy({...base,grade:'D',confirmedByOfficial:true}).canPublish,false);
  const f=fixture(t); f.saveSource({...source,grade:'C'}); f.save(published); assert.throws(f.read,/confirmação/);
  f.saveSource({...source,name:'Organizador',baseUrl:'https://oficial.invalid'},'organizador');
  f.save({...published,confirmations:[{source:'content/sources/organizador.json',url:'https://oficial.invalid/nota',evidence:'Confirmação oficial do vínculo.'}]});
  assert.equal(f.read().length,1);
});
test('interesse, rumor e análise não entram; negociação nunca é elegível para automática',()=>{
  const base={grade:'A',type:'contratacao',transferStage:'oficial',sensitive:false,confirmedByOfficial:false};
  for (const transferStage of ['negociacao','acerto']) assert.equal(assessNewsPolicy({...base,transferStage}).futureAutomatic,false);
  assert.equal(assessNewsPolicy({...base,transferStage:'interesse'}).canPublish,false);
  for (const type of ['rumor','analise','opiniao']) assert.equal(assessNewsPolicy({...base,type}).canPublish,false);
});
test('links de outros perfis, subdomínios enganadores e credenciais são recusados',()=>{
  assert.equal(urlBelongsToSource('https://social.invalid/club/status/1','https://social.invalid/club'),true);
  for (const url of ['https://social.invalid/clube/status/1','https://social.invalid/outro/status/1','https://social.invalid.evil.invalid/club','https://usuario:senha@social.invalid/club']) assert.equal(urlBelongsToSource(url,'https://social.invalid/club'),false);
});
test('datas impossíveis, futuras e correções incompletas bloqueiam; duplicata ignora rastreamento',t=>{
  const f=fixture(t);
  for (const publishedAt of ['2026-02-30T18:00-03:00','2026-13-01T18:00-03:00','2026-09-30T24:00-03:00','2027-01-01T18:00-03:00']) {
    f.save({...published,publishedAt}); assert.throws(f.read,/Revise Últimas/);
  }
  f.save({...published,updatedAt:'2026-09-30T18:30-03:00'}); assert.throws(f.read,/juntos/);
  f.save(published); f.save({...published,sourceUrl:'https://clube-exemplo.invalid/noticia/?utm_source=rede#texto'},'repetida'); assert.throws(f.read,/já utilizada/);
  assert.equal(newsSchema.safeParse({...published,origin:'automatico'}).success,false);
});
test('Postar usa versão lida, assinatura fixa e aprovação humana, sem gravar token no conteúdo', async()=>{
  const calls=[];
  const fetcher=async(url,init)=>{calls.push({url,init});return new Response(JSON.stringify({commit:{sha:'novo'}}),{status:200});};
  const entry={path:'content/news/nota.json',sha:'versao-lida',data:draft};
  await postNews(entry,{[draft.source]:source},[entry],'segredo-nao-gravar','Bruno',fetcher,now);
  assert.equal(calls.length,1); assert.equal(calls[0].init.method,'PUT');
  const payload=JSON.parse(calls[0].init.body); const content=JSON.parse(Buffer.from(payload.content,'base64').toString());
  assert.equal(payload.sha,'versao-lida'); assert.equal(payload.branch,'main'); assert.equal(content.status,'publicado'); assert.equal(content.reviewer,'Bruno'); assert.equal(content.author,'Redação Clubismo Off');
  assert.equal(content.ticket,draft.ticket); assert.equal(JSON.stringify(payload).includes('segredo-nao-gravar'),false);
  const f=async()=>new Response('{}',{status:409});
  await assert.rejects(()=>postNews(entry,{[draft.source]:source},[entry],'token','Bruno',f,now),/mudou/);
});
test('Excluir é restrito a rascunhos, usa SHA e propaga erros sem confirmar sucesso',async()=>{
  const calls=[]; const fetcher=async(url,init)=>{calls.push({url,init});return new Response('{}',{status:200});};
  const entry={path:'content/news/nota.json',sha:'sha-lido',data:draft};
  await deleteNewsDraft(entry,'token',fetcher); assert.equal(calls[0].init.method,'DELETE'); assert.equal(JSON.parse(calls[0].init.body).sha,'sha-lido');
  await assert.rejects(()=>deleteNewsDraft({...entry,data:published},'token',fetcher),/só exclui rascunhos/);
  await assert.rejects(()=>deleteNewsDraft({...entry,path:'content/settings.json'},'token',fetcher),/inválido/);
  await assert.rejects(()=>deleteNewsDraft(entry,'token',async()=>new Response('{}',{status:403})),/recusou/);
});
