import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readArticles } from '../lib/content-loader.ts';

function fixture(t) {
  const dir=mkdtempSync(join(tmpdir(),'clubismo-content-'));
  t.after(()=>rmSync(dir,{recursive:true,force:true}));
  return {dir,save:(slug,data)=>writeFileSync(join(dir,`${slug}.json`),JSON.stringify(data))};
}
const entry={ title:'Texto do editor',excerpt:'Resumo',category:'opiniao',published:true,body:'## Um novo assunto\n\nTexto **revisado**.',date:'2026-09-22' };

test('criar, editar, retirar, republicar e excluir mantêm o endereço estável', t=>{
  const {dir,save}=fixture(t);
  save('primeira-materia',entry);
  assert.equal(readArticles(dir)[0].slug,'primeira-materia');
  save('primeira-materia',{...entry,title:'Título revisado'});
  assert.equal(readArticles(dir)[0].title,'Título revisado');
  assert.equal(readArticles(dir)[0].slug,'primeira-materia');
  save('primeira-materia',{...entry,published:false});
  assert.deepEqual(readArticles(dir),[]);
  save('primeira-materia',entry);
  assert.equal(readArticles(dir).length,1);
  rmSync(join(dir,'primeira-materia.json'));
  assert.deepEqual(readArticles(dir),[]);
  rmSync(dir,{recursive:true});
  assert.deepEqual(readArticles(dir),[]);
});
test('rascunhos incompletos e conteúdos sem publicação explícita não saem no blog',t=>{
  const {dir,save}=fixture(t);
  save('rascunho',{title:'Só uma ideia',published:false});
  save('sem-status',{title:'Não publicar'});
  assert.deepEqual(readArticles(dir),[]);
});
test('prioridade e data ordenam a capa, sem exigir foto',t=>{
  const {dir,save}=fixture(t);
  save('antiga',{...entry,date:'2026-09-01'});
  save('nova',entry);
  save('destaque',{...entry,priority:10,date:'2026-08-01'});
  assert.deepEqual(readArticles(dir).map(a=>a.slug),['destaque','nova','antiga']);
  assert.equal(readArticles(dir)[0].demo,false);
});
test('conteúdo inválido bloqueia a nova versão em vez de publicar página quebrada',t=>{
  const {dir,save}=fixture(t);
  save('invalida',{...entry,image:'javascript:alert(1)'});
  assert.throws(()=>readArticles(dir),/invalida.json/);
  save('invalida',{...entry,image:'/images/foto.jpg',imageAlt:''});
  assert.throws(()=>readArticles(dir),/imageAlt/);
  save('invalida',{...entry,date:'2026-02-30'});
  assert.throws(()=>readArticles(dir),/data válida/);
});
