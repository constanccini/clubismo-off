# Contrato da tarefa Redação Clubismo Off

Destino exclusivo: `constanccini/clubismo-off`, branch `main`. A tarefa pesquisa e cria rascunhos. A publicação depende de uma ação de Bruno. Nunca salvar `status: publicado`, marcar revisão humana, editar textos existentes, apagar arquivos ou alterar código/configurações nesta tarefa.

## Antes de gravar

1. Leia este contrato, `lib/news-schema.ts`, `lib/news-policy.ts`, `content/news/` e `content/sources/` pelo conector GitHub. Pasta inexistente significa coleção vazia; outro erro interrompe a gravação.
2. Abra a fonte original na web e confira data, autoria e fatos. Prefira fonte oficial A. Jornalista/agência confiável B exige atribuição explícita e corroboração. Não use C ou D nesta rotina. Não gere texto de tema sensível ou qualquer tipo bloqueado pelo manual.
3. Evite repetir o mesmo fato por título, pessoas/clube e URL original, inclusive se já publicado ou arquivado. Remova parâmetros de rastreamento e fragmentos dos links. Considere as rodadas recentes da conversa e os commits recentes de descarte. Não republique um fato descartado sem uma novidade relevante.
4. Reutilize a fonte cadastrada e ativa. Não reative nem altere fontes existentes. Para uma fonte nova verificada, crie `content/sources/<nome-estavel>.json` com `name`, `grade` (`A` ou `B`), `baseUrl` HTTPS de domínio/perfil conferido e `active: true`. Um perfil cadastrado autoriza somente seu próprio caminho, não todos os usuários da rede. Grave e confira a fonte antes da notícia.

## Arquivo da notícia

Crie um arquivo novo `content/news/aaaammdd-hh-nn-titulo-curto.json`, com letras minúsculas sem acentos, números e hífens. O prefixo usa a rodada no horário de Brasília; `ticket` usa `AAAAMMDD-HH-NN`. Se já existir, não sobrescreva. Não inclua HTML, Markdown, imagens, segredos, dados privados ou alegações não comprovadas. O texto é renderizado como texto simples.

Campos obrigatórios do rascunho:

| Campo | Conteúdo |
| --- | --- |
| `ticket` | Código único da rodada e posição |
| `title` | Manchete factual, até 160 caracteres |
| `lead` | Quem fez o quê e quando, até 650 caracteres |
| `details` | Detalhes confirmados, até 1.800 caracteres |
| `context` | Contexto comprovado, até 1.000 caracteres, ou string vazia |
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

## Conferência e entrega

Use criação de arquivo, nunca atualização. Leia cada arquivo de volta e confirme conteúdo e `status: revisao`. Os rascunhos aparecem na fila pelo GitHub, independentemente da geração de páginas do blog. Não são publicados no site.

Informe a rodada, uma lista única numerada com os textos e fontes e o endereço `https://constanccini.github.io/clubismo-off/admin/redacao/`. Diga quais códigos foram confirmados na fila. Se houver falha, entregue o texto no chat e diga claramente quais não foram salvos. Não finja botões na conversa. O botão **Postar** fica na fila e exige acesso de editor. Não envie mensagens para terceiros.
