# Redação Clubismo Off

## O fluxo do Bruno

1. A tarefa **Redação Clubismo Off**, no ChatGPT, pesquisa às 0h, 6h, 12h e 18h de Brasília. Prepara até quatro textos por rodada, numerados, com fontes e a assinatura **Redação Clubismo Off**, e salva os rascunhos no GitHub para revisão. Não publica nada.
2. A fila principal fica no [Pages CMS](https://app.pagescms.org/constanccini/clubismo-off/main/collection/ultimas), coleção **Fila de notícias**. Ela lê os rascunhos em `content/news/`, sem dividir por assunto, ordenados pelo código da rodada.
3. Abra a notícia, leia o texto e a fonte, faça as correções, preencha a revisão e a data de publicação, marque as conferências, escolha **Publicado** e salve. A página entra no ar depois que o fluxo **Publicar Clubismo Off** termina. Você também pode excluir o rascunho.
4. Para editar, use o Pages CMS, coleção **Fila de notícias**. Para retirar uma notícia publicada, mude a etapa para **Arquivado** e salve. A fila rápida só exclui rascunhos.

**Ligação com a fila:** a tarefa usa o conector GitHub autorizado para criar arquivos em `content/news/`, sempre com `status: revisao`. O contrato está em `REDACAO-AUTOMACAO.md`. Cada gravação deve ser lida de volta antes de confirmar a entrega. Se a tarefa não conseguir salvar, entrega os textos no chat e informa a falha; não afirma que chegaram ao painel. Rascunhos não são exportados para o blog. A aprovação é feita pelo editor.

## Imagens e alertas no Pages CMS

Leia **Atenção antes de publicar**, quando preenchido. O campo registra observações de atualidade e não aparece na matéria. Capas são opcionais; legenda, autor, fonte e licença acompanham a fotografia. Fotos de arquivo devem informar o ano. A prévia de Brasil x Estados Unidos de 01/10 foi recuperada como **Rascunho**, com aviso de jogo encerrado; os outros 13 textos da importação aguardam revisão.

## Tela opcional de aprovação rápida

O blog permanece no GitHub Pages, sem servidor novo. A fila usa a API do GitHub diretamente do navegador. Conecte um token de acesso restrito a `constanccini/clubismo-off`, com **Contents: Read and write**. O token fica somente na memória da aba: não vai para o código, arquivos, endereço, cookies, armazenamento do navegador ou logs. Ao recarregar ou sair, conecte novamente. Nunca envie o token pelo chat.

O Pages CMS é o painel principal escolhido por Bruno e usa seu acesso já conectado ao GitHub, sem exigir token adicional. A autenticação dele não é compartilhada com esta fila, pois são sites diferentes. A integração GitHub usada pelo assistente também é separada do token usado pelo editor.

O repositório é público. Rascunhos não saem nas páginas do blog, mas seus arquivos e histórico são públicos no GitHub. Não incluir dados confidenciais nos campos de conferência.

## Demonstração sem publicar

Abra `/admin/redacao/` e clique em **Ver uma demonstração**. O exemplo usa clube e atleta fictícios. **Simular postagem** e **Simular exclusão** mostram o fluxo sem fazer chamadas de gravação ao GitHub. Nenhuma notícia de exemplo é adicionada a `content/news/`.

No editor completo: cadastre uma fonte em **Fontes**, confira seu endereço e ative-a. Crie a nota em **Fila de notícias**, preencha título, lead, detalhes e link da fonte, salve como **Rascunho** e depois como **Aguardando Bruno**. Ela aparecerá na fila rápida. O botão Postar preenche assinatura, revisor, horário e os registros de aprovação. Quem usa o editor completo para publicar precisa preencher essas conferências manualmente.

## Regras editoriais

- Um fato por nota, título factual, lead com quem fez o quê e quando, detalhes objetivos, contexto apenas se comprovado e fonte original identificada com link.
- Não opinar, especular, usar adjetivos promocionais ou sensacionalismo, transformar rumores em fatos, nem inventar dados ausentes.
- Não concluir que algo nunca foi divulgado apenas porque não aparece no documento. Quando relevante, usar “O comunicado não informa os valores”. Não completar prazos, datas, estatísticas, causas ou diagnósticos.
- Fonte A: oficial. B: jornalista ou agência confiável. C: imprensa geral, exige confirmação oficial adicional. D: agregador ou torcida, não aceita para publicação.
- A classe da fonte não é a permissão de automação. Temas sensíveis nunca são elegíveis, inclusive quando estão em comunicado oficial. Rumor, interesse, análise e opinião não entram em Últimas.
- Interesse não publica; negociação e acerto exigem revisão e atribuição; Oficial exige fonte oficial ou confirmação oficial adicional.
- Todas as publicações exigem decisão humana nesta versão. A elegibilidade futura é apenas um resultado de classificação; não liga robô, agenda ou publicador.
- Ao corrigir nota publicada, refaça a revisão, mantenha a data original, informe a data de atualização e explique a correção para o leitor.

A validação técnica confere formato, datas, links, fontes cadastradas, revisão e duplicidade do link original. Ela **não comprova a veracidade do texto nem substitui a leitura humana**. As caixas de revisão registram a decisão do editor; não constituem um sistema independente de permissões por cargo. Uma pessoa com acesso de escrita ao repositório pode alterar arquivos.

## Arquitetura e preservação

- Matérias autorais seguem em `content/articles/`, com as categorias, endereços e destaque originais.
- Notícias aprovadas ficam em `content/news/` e aparecem em uma lista única em `/ultimas/`, abaixo dos destaques na capa. Não competem pela prioridade dos textos autorais.
- Fontes ficam em `content/sources/`. O vínculo verifica domínio e caminho, inclusive para perfis sociais. O editor deve conferir a identidade do perfil; um selo sozinho não basta.
- `scripts/prepare-content.mjs` exporta somente notícias publicadas e validadas. Os arquivos gerados não incluem rascunhos, evidências internas ou dados de revisão.
- Uma nota inválida bloqueia a nova publicação do site; a última versão publicada permanece. O erro aparece em GitHub → Actions. Corrija a nota ou volte sua etapa para Rascunho e salve.
- Os horários públicos usam America/Sao_Paulo. Datas futuras são recusadas; este campo não agenda postagem.
- A fila grava usando o SHA da versão que você leu. Se outro editor alterou a notícia, a aprovação é recusada e a fila deve ser atualizada.
- A atualização não recria matérias de exemplo nem fotos apagadas, não muda as configurações do blog e não refaz a identidade visual.

## Gravação recorrente dos rascunhos

A tarefa pode criar fontes verificadas e notas no repositório, sempre como `status: revisao`, com `origin: redacao` e código `ticket` da rodada. Ela não deve preencher aprovação, mudar para Publicado, excluir conteúdo, alterar código ou repetir uma notícia já enviada. Preserve os slugs e confira o estado atual antes de gravar. Notifique falhas sem alegar que os textos chegaram à fila.

O contrato de dados está em `lib/news-schema.ts`; as regras em `lib/news-policy.ts`. Os campos de publicação são preenchidos somente após a aprovação humana. Não usar o agendamento para publicar automaticamente, mesmo para fonte A.

## Verificação

`node --test tests/*.test.mjs` verifica preservação das matérias, estados da fila, regras de fonte e assunto, datas, duplicidade, gravação com versão, exclusão restrita e erros de acesso. `pnpm run build` exporta as páginas para GitHub Pages. A verificação de chamadas ao GitHub usa respostas simuladas e não equivale a comprovar a permissão da conta real.

Referências de implementação: [Pages CMS](https://pagescms.org/docs/configuration/content/fields/), [permissões do GitHub](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens), [tarefas agendadas](https://learn.chatgpt.com/docs/automations).
