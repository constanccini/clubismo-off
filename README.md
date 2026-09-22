# Clubismo Off

Blog de futebol brasileiro com visual de jornal esportivo, capa, editorias e páginas completas de matérias. Responsivo, sem login e sem comentários. A publicação é estática: o GitHub Pages recebe apenas HTML, CSS, JavaScript e imagens, sem banco de dados ou servidor de aplicação.

## Publicar gratuitamente no GitHub Pages

1. Envie este projeto para a branch `main` de um repositório público no GitHub. O plano gratuito do GitHub Pages atende repositórios públicos.
2. No repositório, abra **Settings → Pages → Build and deployment → Source** e selecione **GitHub Actions**.
3. Abra **Actions → Publicar Clubismo Off → Run workflow**. Depois, alterações enviadas à branch `main` publicam automaticamente.
4. Aguarde o trabalho **deploy** terminar. O endereço publicado aparece em **Settings → Pages** e na execução da publicação.

O fluxo em `.github/workflows/pages.yml` usa o endereço informado pelo próprio GitHub para preparar links e imagens. Assim funciona tanto em `usuario.github.io/repositorio/` quanto em um site de usuário ou domínio próprio. Não é necessário inserir token no código. O repositório e a publicação ainda precisam ser conectados à conta do proprietário.

Documentação: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) e [publicação com GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Logo

A versão corrigida da logo enviada pelo proprietário (`99199.png`) está em `public/images/logo-clubismo-off.png`, aplicada em tamanho compacto à esquerda do cabeçalho e no rodapé. O verde da interface acompanha a marca.

O PNG original foi preservado sem alterações. O enquadramento em CSS apenas acomoda suas margens brancas no layout, mantendo as proporções. Para trocar a logo no futuro, atualize `brand.logo` em `lib/site.ts` e ajuste `.brand-logo-frame` e `.brand-logo` em `app/globals.css` conforme as margens do novo arquivo.

## Painel de matérias

Acesse [Pages CMS](https://app.pagescms.org), entre com o GitHub, autorize o aplicativo para `constanccini/clubismo-off` e selecione a branch `main`. A configuração `.pages.yml` mostra **Matérias**, **Fotos** e **Configurações do blog**. O site também tem o atalho `/admin/`.

- **Criar:** abra Matérias, crie um item, preencha título, resumo, editoria e texto. Escolha a foto de capa, descreva a imagem e informe os créditos. Para publicar, ligue **Visível no blog** e salve.
- **Editar:** abra a matéria, altere os campos e salve. Mudar o título mantém o endereço existente.
- **Retirar temporariamente:** desligue **Visível no blog** e salve.
- **Excluir:** use a ação de exclusão da matéria. A publicação seguinte retira a matéria da capa, da editoria e do seu endereço.
- **Fotos no texto:** use o botão de imagem do editor. A capa tem campos próprios para descrição, legenda e créditos. Nas fotos dentro do texto, escreva a legenda e o crédito logo abaixo.
- **Ordenar a capa:** números maiores em **Prioridade na capa** aparecem primeiro; em caso de empate, as datas mais recentes vêm antes. Para destacar um texto novo acima dos exemplos, use prioridade 10. O tempo de leitura é calculado automaticamente.
- **Encerrar a pré-estreia:** substitua ou exclua os seis exemplos, desligue **Mostrar aviso de pré-estreia** em Configurações do blog e, quando estiver pronto, ligue **Permitir aparecer nas buscas**. Matérias marcadas como demonstração continuam identificadas e não são indexadas.

Depois de salvar, acompanhe **Actions → Publicar Clubismo Off**. A mudança aparece quando o trabalho **deploy** termina com sucesso. Se houver erro, a versão anterior permanece no ar: confira o passo que falhou, corrija o campo indicado e salve novamente.

**Visibilidade:** este repositório é público. Textos fora do blog continuam acessíveis como arquivos no GitHub, inclusive no histórico. O painel usa a autenticação e as permissões do GitHub; não há senha nem token gravado no site. A data da matéria é informativa, sem agendamento.

Os textos ficam em `content/articles/*.json`, com corpo em Markdown; as configurações ficam em `content/settings.json`. O nome do arquivo define o endereço e fica estável nas edições. Só `published: true` gera página. A publicação é reconstruída inteira, incluindo quando não existe nenhuma matéria.

### Instalar no repositório que hoje contém apenas a pasta docs

O pacote de instalação contém `painel-fonte.zip`, `COMECE-AQUI.html` e uma cópia em texto do workflow. Abra o HTML para seguir os links da sua conta. Envie o ZIP interno inteiro, sem extrair, à raiz do repositório; configure Pages para GitHub Actions; depois crie `.github/workflows/pages.yml` com o workflow fornecido.

Na primeira execução, o workflow extrai o código e grava os arquivos no GitHub. Ele usa a permissão `contents: write` somente para essa instalação inicial. Quando `package.json` já existe, a extração é ignorada: matérias excluídas não reaparecem. As execuções seguintes leem o conteúdo editado pelo painel, verificam, compilam e publicam `out/`. O conteúdo antigo de `docs/` permanece no repositório, mas deixa de ser a fonte de publicação.

O pacote não instala nem autoriza o aplicativo Pages CMS em sua conta. Essa conexão precisa ser feita pelo proprietário no primeiro acesso. [Guia oficial do Pages CMS](https://pagescms.org/docs/quick-start/).

## Domínio próprio

Depois de registrar um domínio, configure-o em **Settings → Pages → Custom domain** e crie os registros DNS indicados na documentação do GitHub. Ative **Enforce HTTPS** quando o certificado estiver disponível e execute novamente a publicação para recalcular os caminhos das páginas.

Nenhum domínio foi configurado ainda. A hospedagem no GitHub Pages pode ser gratuita; o registro de um domínio é contratado separadamente.

[Guia oficial para configurar o domínio](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Desenvolvimento

Use Node.js 24 e a versão de pnpm indicada em `package.json`.

```sh
pnpm install --frozen-lockfile --prod=false
pnpm run dev
pnpm run build
```

O resultado publicável fica em `out/`. Envie somente essa pasta ao servidor estático; não publique intermediários de build. `public/.nojekyll` é copiado para a saída.

O preview usa Vite/Vinext e o build usa o exportador estático do Next.js, ambos sobre o mesmo código App Router. A exportação do Next gera os diretórios `index.html` compatíveis com o GitHub Pages. Não há funções de servidor no blog publicado.

No ambiente Sites, execute `configure-execution-profile.mjs` do plugin antes de retomar o desenvolvimento e use o preview supervisionado. A seleção local em `.sites-runtime/` não deve ser enviada ao GitHub. A configuração de hospedagem identifica o projeto de origem; o destino desta versão é o GitHub Pages.

## Fotografias

- Maracanã à noite: [Alexandre Cabus / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Maracana_a_Noite.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Foto redimensionada, com enquadramento adaptável; a derivação mantém a mesma licença.
- Bola no gramado: [Marcel Strauß / Unsplash](https://unsplash.com/photos/white-red-and-blue-soccer-ball-on-green-grass-Xo5MkDpEohw), [licença Unsplash](https://unsplash.com/license).

Os créditos também aparecem no rodapé e nas legendas. São imagens de arquivo, usadas como ilustração, sem associação a uma partida atual.
