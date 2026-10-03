# Contrato da tarefa Redação Clubismo Off

Destino exclusivo: `constanccini/clubismo-off`, branch `main`. A tarefa pesquisa e cria rascunhos. A publicação depende de uma ação de Bruno. Nunca salvar `status: publicado`, marcar revisão humana, editar textos existentes, apagar arquivos ou alterar código/configurações nesta tarefa.

## Antes de gravar

1. Leia este contrato, `lib/news-schema.ts`, `lib/news-policy.ts`, `content/news/`, `content/articles/` e `content/sources/` pelo conector GitHub. Pasta inexistente significa coleção vazia; outro erro interrompe a gravação.
2. Abra a fonte original na web e confira data, autoria e fatos. Prefira fonte oficial A. Jornalista/agência confiável B exige atribuição explícita e corroboração. Não use C ou D nesta rotina. Não gere texto de tema sensível ou qualquer tipo bloqueado pelo manual.
3. Evite repetir o mesmo fato por título, pessoas/clube e URL original, inclusive se já publicado ou arquivado. Remova parâmetros de rastreamento e fragmentos dos links. Considere as rodadas recentes da conversa e os commits recentes de descarte. Não republique um fato descartado sem uma novidade relevante.
4. Reutilize a fonte cadastrada e ativa. Não reative nem altere fontes existentes. Para uma fonte nova verificada, crie `content/sources/<nome-estavel>.json` com `name`, `grade` (`A` ou `B`), `baseUrl` HTTPS de domínio/perfil conferido e `active: true`. Um perfil cadastrado autoriza somente seu próprio caminho, não todos os usuários da rede. Grave e confira a fonte antes da notícia.

## Arquivo da notícia

Crie um arquivo novo `content/news/aaaammdd-hh-nn-titulo-curto.json`, com letras minúsculas sem acentos, números e hífens. O prefixo usa a rodada no horário de Brasília; `ticket` usa `AAAAMMDD-HH-NN`. Se já existir, não sobrescreva. Escreva a notícia inteira em `body`, com parágrafos separados por uma linha em branco. O painel oferece um editor visual e o site aceita Markdown básico; prefira parágrafos simples. Não inclua HTML, imagens dentro do texto, segredos, dados privados ou alegações não comprovadas.

Não divida o texto em campos `lead`, `details` ou `context`, nem escreva esses rótulos dentro da notícia. O primeiro parágrafo informa quem fez o quê e quando; os demais trazem os detalhes e o contexto comprovados. A assinatura, a capa e a fonte são renderizadas a partir de seus próprios campos. Não repita o título, a assinatura ou uma seção de fontes dentro de `body`.

Campos obrigatórios do rascunho:

| Campo | Conteúdo |
| --- | --- |
| `ticket` | Código único da rodada e posição |
| `title` | Manchete factual, até 160 caracteres |
| `body` | Texto completo e pronto para leitura, com parágrafos. Até 6.000 caracteres; o limite não é uma meta de tamanho. Não acrescentar fatos para preencher espaço |
| `preview` | Link Markdown `[Abrir prévia da notícia](https://constanccini.github.io/clubismo-off/admin/previa/?noticia=<nome-do-arquivo-sem-json>)`, usando o nome real escolhido para o arquivo |
| `type` | Um valor objetivo aceito em `lib/news-policy.ts` |
| `transferStage` | `oficial`, `negociacao`, `acerto` ou `nao_se_aplica`, conforme a fonte; nunca interesse |
| `sensitive` | `false`; tema sensível fica fora desta rotina |
| `source` | Caminho exato da fonte: `content/sources/<nome>.json` |
| `sourceUrl` | Link HTTPS direto do comunicado/notícia, pertencente à fonte |
| `sourcePublishedAt` | Data e hora com fuso, sem milissegundos, somente se informadas; caso contrário string vazia. Não inventar horário para uma fonte que informa só o dia |
| `evidence` | Resumo factual de quais dados foram conferidos, escrito com suas palavras. Se disponível só a data, registre-a aqui |
| `confirmations` | Lista vazia ou objetos com `source`, `url` e `evidence` de confirmações verificadas |
| `origin` | `redacao` |
| `status` | `revisao` |
| `author` | `Redação Clubismo Off` |
| `publishedAt`, `updatedAt`, `correction`, `reviewer`, `reviewedAt` | Strings vazias |
| `sourceChecked`, `factsChecked`, `styleChecked` | `false`; reservados à aprovação humana |

Para contratação, renovação, empréstimo ou rescisão, a etapa deve corresponder ao fato confirmado; nos outros tipos use `nao_se_aplica`. `oficial` exige fonte A ou confirmação oficial adicional. Contratação encaminhada não é contratação concluída. Não inclua boatos.

## Imagens e atualidade

O painel aceita os campos opcionais `image`, `imageAlt`, `imageCaption`, `imageCredit`, `imageSource`, `imageLicense` e `imageLicenseUrl`. A tarefa pode referenciar uma foto já existente em `public/images/`, após conferir pertinência, autor e licença; não altera nem envia arquivos de mídia nesta rotina. Sem imagem adequada, deixe os campos vazios. Nunca invente uma imagem ou um endereço. Fotografias de arquivo devem ter ano e contexto na legenda e não podem ser apresentadas como registro do fato atual.

Use `reviewNote` para alertas ao editor, como uma previsão prestes a vencer ou atribuição a fonte secundária. Esse campo não aparece no blog. Datas de publicação e revisão continuam reservadas ao editor: o código da rodada não é a data de publicação.

## Conferência e entrega

Use criação de arquivo, nunca atualização. Leia cada arquivo de volta e confirme conteúdo e `status: revisao`. Os rascunhos aparecem na fila pelo GitHub, independentemente da geração de páginas do blog. Não são publicados no site.

Informe a rodada, uma lista única numerada com as notícias completas (sem rótulos de lead, detalhes e contexto), as fontes e o endereço `https://app.pagescms.org/constanccini/clubismo-off/main/collection/ultimas`. Diga quais códigos foram confirmados na fila. Se houver falha, entregue o texto no chat e diga claramente quais não foram salvos. Não finja botões na conversa. No Pages CMS, o editor lê e corrige **Texto da notícia**. Depois de salvar, o link **Ver como ficará no blog** abre a prévia da versão salva. Após revisar texto e fontes, o editor salva e clica no botão **Publicar** no topo. O botão registra a decisão humana e o horário; a notícia sai de **Fila**, passa a **Matérias** e entra no site. Edição, retirada do ar e exclusão das publicadas ficam em **Matérias**. A tarefa nunca executa esse botão nem move arquivos; `content/articles/` é somente leitura para evitar duplicação. Não encaminhe Bruno ao painel extra de token. Não envie mensagens para terceiros.
