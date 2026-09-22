"""Create the one-time GitHub installer without credentials or native Site metadata."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import subprocess,html,hashlib

root=Path(__file__).resolve().parent.parent
out=root/'outputs'/'painel-instalacao'
out.mkdir(parents=True,exist_ok=True)
paths=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=root).decode().split('\0')
excluded={'.github','.openai','upload','outputs','work'}
paths=sorted({p for p in paths if p and p != 'painel-fonte.zip' and Path(p).parts[0] not in excluded and (root/p).is_file()})
with ZipFile(out/'painel-fonte.zip','w',ZIP_DEFLATED) as archive:
    for path in paths: archive.write(root/path,path)
workflow=(root/'.github/workflows/pages.yml').read_text()
(out/'publicar-painel.txt').write_text(workflow)
workflow_html=html.escape(workflow)
guide='''<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ativar o painel · Clubismo Off</title>
<style>
:root{--green:#127402;--ink:#151718;--rule:#dce0d8}*{box-sizing:border-box}body{margin:0;background:#f4f5f1;color:var(--ink);font:16px/1.6 Arial,Helvetica,sans-serif}header{background:var(--ink);color:white;padding:18px 24px;letter-spacing:.09em;font-size:13px;font-weight:800}main{max-width:840px;margin:36px auto;padding:0 20px 60px}h1{font:700 clamp(32px,6vw,48px)/1.12 Georgia,serif;letter-spacing:-.035em;margin:8px 0 20px}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.1em;color:var(--green)}.intro{max-width:680px;color:#53594f}section{background:white;border:1px solid var(--rule);padding:26px;margin:20px 0}h2{font-size:21px;line-height:1.3;margin:0 0 14px}h2 span{color:var(--green);margin-right:10px}p{margin:12px 0}a{color:var(--green);text-underline-offset:3px}a.button,button{display:inline-block;cursor:pointer;border:0;background:var(--green);color:white;text-decoration:none;font:700 15px/1.4 Arial;padding:12px 16px;margin:6px 8px 6px 0}a.button:hover,button:hover{background:#0b5100}button.secondary{background:#e9ede5;color:var(--ink)}code{font:14px monospace;background:#f1f3ee;padding:3px 5px;overflow-wrap:anywhere}textarea{display:block;width:100%;height:190px;font:12px/1.5 monospace;padding:12px;border:1px solid #abb4a4;margin-top:12px}details{margin:14px 0}summary{cursor:pointer;font-weight:700}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;vertical-align:top;padding:12px 8px;border-bottom:1px solid var(--rule)}th{color:var(--green)}.note{font-size:14px;color:#606658}.success{padding:12px 16px;border-left:4px solid var(--green);background:#edf5e9}ol{padding-left:22px}li{margin:8px 0}#copy-status{min-height:25px;font-size:14px;color:var(--green)}footer{font-size:13px;color:#697061;margin-top:28px}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid var(--green);outline-offset:3px}
</style>
<header>CLUBISMO OFF · ÁREA DO EDITOR</header>
<main><div class="eyebrow">INSTALAÇÃO ÚNICA</div><h1>Seu blog, nas suas mãos.</h1>
<p class="intro">O painel está preparado para o repositório <strong>constanccini/clubismo-off</strong>. Faça esta conexão uma vez; depois, crie e edite suas matérias pelo Pages CMS.</p>
<p class="note">Use o navegador em que você já está conectado ao GitHub. Este guia não solicita senha nem token. A instalação ainda precisa ser concluída na sua conta.</p>
<section><h2><span>1.</span> Envie o arquivo do painel</h2>
<p>Na pasta extraída deste pacote, encontre <code>painel-fonte.zip</code>. Envie <strong>esse ZIP inteiro</strong> para o GitHub usando o botão abaixo. Mantenha o nome do arquivo.</p>
<p><strong>Não extraia o ZIP interno e não o envie para a pasta docs.</strong> A instalação vai abrir o arquivo automaticamente.</p>
<a class="button" href="https://github.com/constanccini/clubismo-off/upload/main" target="_blank" rel="noreferrer">Abrir envio no GitHub ↗</a>
<p class="note">Confirme as alterações diretamente na branch <strong>main</strong> (pode aparecer como “principal”). Mensagem sugerida: <em>Adicionar painel do Clubismo Off</em>.</p></section>
<section><h2><span>2.</span> Ative a publicação automática</h2>
<p>Abra as configurações abaixo. Em <strong>Build and deployment → Source</strong> (Compilação e implantação → Fonte), selecione <strong>GitHub Actions</strong>.</p>
<a class="button" href="https://github.com/constanccini/clubismo-off/settings/pages" target="_blank" rel="noreferrer">Abrir configurações do site ↗</a>
<p class="note">Não escolha um modelo sugerido: o arquivo certo está pronto no próximo passo. O endereço do blog continua o mesmo.</p></section>
<section><h2><span>3.</span> Instale o publicador</h2>
<p>Abra um novo arquivo. No campo do nome, cole <code>.github/workflows/pages.yml</code>. No campo grande de conteúdo, cole o texto completo pelo botão abaixo.</p>
<a class="button" href="https://github.com/constanccini/clubismo-off/new/main" target="_blank" rel="noreferrer">Criar arquivo no GitHub ↗</a>
<button class="secondary" data-copy="name">Copiar nome do arquivo</button><button data-copy="workflow">Copiar conteúdo completo</button>
<div id="copy-status" role="status" aria-live="polite"></div>
<details><summary>Ver o conteúdo ou copiar manualmente</summary><textarea id="workflow" readonly aria-label="Conteúdo completo do publicador">WORKFLOW_PLACEHOLDER</textarea><p class="note">O mesmo conteúdo está em <code>publicar-painel.txt</code>, junto deste guia.</p></details>
<p>Clique em <strong>Confirmar alterações</strong> e confirme diretamente na <strong>main</strong>. A primeira execução instala os arquivos do painel e publica o blog.</p>
<a href="https://github.com/constanccini/clubismo-off/actions" target="_blank" rel="noreferrer">Acompanhar “Publicar Clubismo Off” ↗</a>
<p class="note">Aguarde <strong>build</strong> e <strong>deploy</strong> ficarem verdes. Caso não inicie, abra o fluxo “Publicar Clubismo Off” e clique em <strong>Run workflow</strong>. Um erro vermelho precisa ser resolvido antes de seguir.</p></section>
<section><h2><span>4.</span> Entre no seu painel</h2>
<a class="button" href="https://app.pagescms.org" target="_blank" rel="noreferrer">Abrir Pages CMS ↗</a>
<ol><li>Entre com o GitHub.</li><li>Quando solicitado, instale/autorize o Pages CMS para o repositório <strong>clubismo-off</strong>. Use a seleção de repositórios para conceder acesso apenas a ele.</li><li>Escolha <strong>constanccini → clubismo-off → main</strong>.</li></ol>
<p class="success">Você verá <strong>Matérias</strong>, <strong>Fotos</strong> e <strong>Configurações do blog</strong>. A configuração já vem no pacote.</p>
<p class="note">Se aparecer um pedido para criar <code>.pages.yml</code>, confira se está no repositório e na branch corretos e se o passo 3 terminou. Atualize a página do painel.</p></section>
<section><h2>Daqui em diante</h2>
<table><thead><tr><th>Quero…</th><th>No painel</th></tr></thead><tbody>
<tr><td>Publicar uma matéria</td><td>Abra Matérias, crie um item, preencha título, resumo, editoria e texto, ligue <strong>Visível no blog</strong> e salve.</td></tr>
<tr><td>Editar</td><td>Abra uma matéria, altere e salve. O endereço existente é mantido.</td></tr>
<tr><td>Retirar do blog</td><td>Desligue <strong>Visível no blog</strong> e salve. Para apagar o arquivo, use a opção de exclusão.</td></tr>
<tr><td>Usar uma foto</td><td>Selecione ou envie a Foto de capa e preencha descrição e créditos. Para fotos dentro do texto, use o botão de imagem do editor e escreva o crédito abaixo.</td></tr>
<tr><td>Destacar na capa</td><td>Aumente <strong>Prioridade na capa</strong>. Use 10 para colocar acima dos exemplos atuais. Empates são ordenados pela data mais recente.</td></tr>
<tr><td>Tirar “versão de testes”</td><td>Substitua ou exclua os exemplos. Em Configurações do blog, desligue <strong>Mostrar aviso de pré-estreia</strong>. Ative <strong>Permitir aparecer nas buscas</strong> quando estiver pronto.</td></tr>
</tbody></table>
<p>Depois de salvar, a publicação acontece automaticamente. <a href="https://github.com/constanccini/clubismo-off/actions" target="_blank" rel="noreferrer">Confira o andamento</a> e abra <a href="https://constanccini.github.io/clubismo-off/" target="_blank" rel="noreferrer">o blog</a> quando terminar.</p>
<p class="note">O repositório é público. Textos salvos ficam acessíveis no GitHub e no histórico, mesmo fora do blog. A data da matéria é informativa; não agenda a publicação. Excluir uma foto ainda usada por outra matéria pode deixar essa imagem quebrada.</p></section>
<details><summary>Se a publicação não funcionar</summary><p>Abra Actions, a execução mais recente e o passo vermelho. Se houver um campo inválido, corrija a matéria no painel e salve. Se aparecer falta de permissão para a instalação inicial, confira em Settings → Actions → General se os workflows do repositório podem gravar conteúdo; políticas da conta podem restringir essa opção.</p><p>Se algo der errado após a troca da fonte, você pode voltar temporariamente a Settings → Pages → Deploy from a branch → main → /docs. Isso restaura a publicação antiga, sem o painel; volte a GitHub Actions quando resolver o erro.</p></details>
<footer>Referências: <a href="https://pagescms.org/docs/quick-start/">Pages CMS</a> · <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site">GitHub Pages</a>. Pacote preparado para Clubismo Off.</footer>
</main><script>
const values={name:'.github/workflows/pages.yml',workflow:document.querySelector('#workflow').value};
for(const button of document.querySelectorAll('[data-copy]'))button.addEventListener('click',async()=>{
 const value=values[button.dataset.copy];let success=false;
 try{await navigator.clipboard.writeText(value);success=true}catch{}
 if(!success){const box=document.createElement('textarea');box.value=value;document.body.appendChild(box);box.select();success=document.execCommand('copy');box.remove()}
 document.querySelector('#copy-status').textContent=success?'Copiado. Agora cole no campo correspondente do GitHub.':'Abra o conteúdo abaixo e copie manualmente com Ctrl+A e Ctrl+C.';
});
</script></html>'''.replace('WORKFLOW_PLACEHOLDER',workflow_html)
(out/'COMECE-AQUI.html').write_text(guide)
final=root/'outputs'/'Clubismo-Off-Painel.zip'
with ZipFile(final,'w',ZIP_DEFLATED) as archive:
    for name in ['COMECE-AQUI.html','painel-fonte.zip','publicar-painel.txt']:archive.write(out/name,name)
print(f'Pacote: {final}\nArquivos de código: {len(paths)}\nBytes: {final.stat().st_size}\nSHA256: {hashlib.sha256(final.read_bytes()).hexdigest()}')
