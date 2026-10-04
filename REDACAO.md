# Redação Clubismo Off

## O fluxo do Bruno

1. A tarefa **Redação Clubismo Off**, no ChatGPT, pesquisa às 0h, 6h, 12h e 18h de Brasília. Prepara até quatro textos por rodada, numerados, com fontes e a assinatura **Redação Clubismo Off**, e salva os rascunhos no GitHub para revisão. Não publica nada.
2. A fila principal fica no [Pages CMS](https://app.pagescms.org/constanccini/clubismo-off/main/collection/ultimas), coleção **Fila**. Ela lê os rascunhos em `content/news/`, sem dividir por assunto, ordenados pelo código da rodada.
3. Abra a notícia e leia **Texto da notícia**, que reúne todos os parágrafos em um editor visual. Corrija o que desejar e salve mantendo **Rascunho** ou **Aguardando Bruno**. O link **Ver como ficará no blog** abre a prévia da última versão salva, com título, parágrafos, assinatura, capa e fontes. A prévia não publica nem altera nada. Após novas correções, salve no painel e clique em **Atualizar prévia**.
4. Após conferir o texto e as fontes, salve e clique em **Publicar**, no topo da notícia. Confirme a publicação da versão salva. O botão registra a aprovação, identifica o editor e preenche os horários. A notícia sai da **Fila**, passa para **Matérias** e entra no site ao concluir o fluxo **Publicar Clubismo Off**. Você também pode excluir um rascunho da Fila.
5. Para editar uma notícia publicada, abra **Matérias**, faça a alteração e salve. Para retirar do ar, desligue **Visível no blog** e salve; para excluir, use a exclusão da própria matéria. O endereço público continua o mesmo. As notícias retiradas permanecem em Matérias para você poder recuperá-las.

**Ligação com a fila:** a tarefa usa o conector GitHub autorizado para criar arquivos em `content/news/`, sempre com `status: revisao`. O contrato está em `REDACAO-AUTOMACAO.md`. Cada gravação deve ser lida de volta antes de confirmar a entrega. Se a tarefa não conseguir salvar, entrega os textos no chat e informa a falha; não afirma que chegaram ao painel. Rascunhos não são exportados para o blog. A aprovação é feita pelo editor.

## Imagens e alertas no Pages CMS

Leia **Atenção antes de publicar**, quando preenchido. O campo registra observações de atualidade e não aparece na matéria. Capas são opcionais; legenda, autor, fonte e licença acompanham a fotografia. Fotos de arquivo devem informar o ano. A prévia de Brasil x Estados Unidos de 01/10 foi recuperada como **Rascunho**, com aviso de jogo encerrado; os outros 13 textos da importação aguardam revisão.

## Painel e publicação

O Pages CMS é o painel principal e usa o acesso conectado ao GitHub. Não exige um token adicional. A antiga rota `/admin/redacao/` encaminha para a Fila do Pages CMS.

**Salvar** guarda a revisão. **Publicar** envia a última versão salva para o blog: alterações ainda não salvas não fazem parte dela. Se alguém alterou a notícia depois que o editor a abriu, o botão recusa a versão antiga; reabra a notícia e confira o texto atual. O resultado da execução aparece junto ao botão no Pages CMS e em GitHub → Actions.

Para novos rascunhos, cadastre a fonte em **Fontes**, confira o endereço e ative-a. Crie a notícia em **Fila**, preencha título, texto e fonte e salve. O link **Ver como ficará no blog** mostra o texto completo com a mesma diagramação usada na notícia publicada.

Em **Configurações do blog**, **Mostrar aviso de pré-estreia** controla todos os avisos de demonstração. Está desligado. Para mudar a opção, salve e aguarde a atualização do site. O favicon usa a logo aprovada do Clubismo Off.

O repositório é público. Rascunhos não entram nas páginas do blog, mas seus arquivos e histórico podem ser lidos no GitHub. Não inclua dados confidenciais na conferência.

## Regras editoriais

- Um fato por nota, título factual, lead com quem fez o quê e quando, detalhes objetivos, contexto apenas se comprovado e fonte original identificada com link.
- Não opinar, especular, usar adjetivos promocionais ou sensacionalismo, transformar rumores em fatos, nem inventar dados ausentes.
- Não concluir que algo nunca foi divulgado apenas porque não aparece no documento. Quando relevante, usar “O comunicado não informa os valores”. Não completar prazos, datas, estatísticas, causas ou diagnósticos.
- Fonte A: oficial. B: jornalista ou agência confiável. C: imprensa geral, exige confirmação oficial adicional. D: agregador ou torcida, não aceita para publicação.
- A classe da fonte não é a permissão de automação. Temas sensíveis nunca são elegíveis, inclusive quando estão em comunicado oficial. Rumor e interesse não são publicados como fatos. A automação não escreve análise ou opinião. Últimas é a lista cronológica de todas as publicações aprovadas, incluindo textos autorais.
- Interesse não publica; negociação e acerto exigem revisão e atribuição; Oficial exige fonte oficial ou confirmação oficial adicional.
- Todas as publicações exigem decisão humana nesta versão. A elegibilidade futura é apenas um resultado de classificação; não liga robô, agenda ou publicador.
- Ao corrigir nota publicada, refaça a revisão, mantenha a data original, informe a data de atualização e explique a correção para o leitor.

A validação técnica confere formato, datas, links, fontes cadastradas, revisão e duplicidade do link original. Ela **não comprova a veracidade do texto nem substitui a leitura humana**. O clique em Publicar registra a decisão do editor; não constitui um sistema independente de permissões por cargo. Uma pessoa com acesso de escrita ao repositório pode alterar arquivos.

## Arquitetura e preservação

- `content/news/` é a Fila de rascunhos. O botão nativo do Pages CMS dispara `pages.yml` com o contexto da notícia, incluindo o SHA do arquivo salvo.
- `scripts/publish-news.mjs` valida o rascunho e prepara a mudança para `content/articles/`, marcada com `recordType: noticia`. O mesmo commit adiciona a matéria e remove o rascunho; só é enviado após testes e geração das páginas passarem. Uma gravação concorrente recusa o envio, sem sobrescrever a revisão.
- **Matérias** reúne conteúdo autoral e notícias aprovadas. `settings.content.merge` do Pages CMS preserva os dados de revisão fora dos campos visíveis ao editar.
- As notícias mantêm seus endereços em `/ultimas/`; os textos autorais mantêm `/materia/`. O catálogo público unifica os dois formatos em Em campo, Últimas e na editoria escolhida. A editora define `category` antes de publicar e o botão a preserva. Rascunhos nunca entram no catálogo.
- O mesmo workflow envia o site após a mudança de conteúdo; não depende de um segundo workflow provocado pelo commit do robô. Repetir uma execução já aprovada apenas refaz a publicação, sem duplicar a notícia ou recolocar no ar uma matéria retirada.
- Fontes ficam em `content/sources/`. O vínculo verifica domínio e caminho, inclusive para perfis sociais. O editor deve conferir a identidade do perfil; um selo sozinho não basta.
- `scripts/prepare-content.mjs` exporta somente notícias publicadas e validadas. Os arquivos gerados não incluem rascunhos, evidências internas ou dados de revisão.
- O texto único fica em `body`; a leitura ainda aceita os campos antigos em arquivos não migrados. Quando `body` existe, ele é a única versão usada. Um texto apagado intencionalmente não é substituído por conteúdo antigo.
- A prévia em `/admin/previa/` consulta o repositório público no navegador e usa o mesmo componente de diagramação da página publicada. Os textos de rascunho não entram no HTML gerado, no payload de notícias ou nas páginas públicas de notícias. A prévia tem instrução de não indexar e só faz leituras; não é uma área privada e não exige token.
- Uma nota inválida bloqueia a nova publicação do site; a última versão publicada permanece. O erro aparece em GitHub → Actions. Corrija a nota em Matérias ou desligue Visível no blog e salve. Se o erro ocorrer antes de mover o rascunho, ele permanece na Fila.
- Os horários públicos usam America/Sao_Paulo. Datas futuras são recusadas; este campo não agenda postagem.
- A fila grava usando o SHA da versão que você leu. Se outro editor alterou a notícia, a aprovação é recusada e a fila deve ser atualizada.
- A atualização não recria matérias de exemplo nem fotos apagadas e preserva a identidade visual aprovada.

## Gravação recorrente dos rascunhos

A tarefa pode criar fontes verificadas e notas no repositório, sempre como `status: revisao`, com `origin: redacao` e código `ticket` da rodada. Ela não deve preencher aprovação, mudar para Publicado, excluir conteúdo, alterar código ou repetir uma notícia já enviada. Preserve os slugs e confira a Fila e Matérias (`content/articles/`, somente leitura para a tarefa) antes de gravar. Notifique falhas sem alegar que os textos chegaram à fila.

O contrato de dados está em `lib/news-schema.ts`; as regras em `lib/news-policy.ts`. Os campos de publicação são preenchidos somente após a aprovação humana. Não usar o agendamento para publicar automaticamente, mesmo para fonte A.

## Verificação

`node --test tests/*.test.mjs` verifica preservação das matérias, estados da fila, regras de fonte e assunto, datas, duplicidade, gravação com versão, exclusão restrita e erros de acesso. `pnpm run build` exporta as páginas para GitHub Pages. Os testes de publicação usam arquivos temporários e verificam movimento, preservação, recusa de revisão antiga, edição, retirada e exclusão. Não publicam notícias reais nem comprovam a permissão da sessão do Pages CMS.

Referências de implementação: [Pages CMS](https://pagescms.org/docs/configuration/content/fields/), [permissões do GitHub](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens), [tarefas agendadas](https://learn.chatgpt.com/docs/automations).

## Em campo e leituras da semana

- O carrossel mostra até seis destaques; os demais seguem em cartões. Capas são opcionais e mantêm os créditos.
- Sem medição, toda a capa segue a hora de publicação, da mais recente à mais antiga. A antiga prioridade manual não altera essa ordem.
- Com o contador compartilhado ativo, Em campo prioriza as leituras dos últimos sete dias; empates e itens sem leituras usam a hora de publicação. Últimas e editorias continuam cronológicas.
- O serviço dedicado `Leituras do Clubismo Off` foi preparado com D1. Ele começa privado e só pode ser ativado para os visitantes após a autorização do dono para acesso público.
- Origem prevista do serviço: `https://clubismo-off-leituras.chummy-map-9946.chatgpt.site`. Projeto Sites: `appgprj_6ac1c4bb16e081918c1cc94e056767bf`.
- `lib/readership-config.ts` permanece vazio até confirmar acesso público e persistência. Nenhum token entra no código do navegador.
- O catálogo `public/catalog.json` é gerado no build apenas com identificadores e endereços publicados.
- A leitura é contada após dois segundos de página visível e deduplicada por sessão/aba a cada 30 minutos. Essa contagem não é de pessoas únicas. Relatório inválido, antigo ou indisponível mantém a ordem cronológica.
