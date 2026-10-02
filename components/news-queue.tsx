"use client";
import { useState } from "react";
import Link from "next/link";
import { connectNewsPanel, loadNewsQueue, postNews, deleteNewsDraft, repository } from "@/lib/news-panel";
import type { QueueEntry, SourceRecord } from "@/lib/news-panel";

const example: QueueEntry = { path: "content/news/exemplo-ficticio.json", sha: "", data: {
  ticket: "EXEMPLO-01", status: "revisao", title: "Clube Exemplo renova contrato de atleta até dezembro de 2029",
  lead: "O Clube Exemplo anunciou em 30 de setembro de 2026 a renovação do contrato de Atleta Exemplo até dezembro de 2029.",
  details: "O comunicado do clube informa a duração do novo vínculo. O documento não informa os valores do acordo.",
  context: "", source: "content/sources/clube-exemplo.json", sourceUrl: "https://clube-exemplo.invalid/comunicado", author: "Redação Clubismo Off",
} };
const field = (entry: QueueEntry, key: string) => typeof entry.data[key] === "string" ? entry.data[key] as string : "";

export function NewsQueue() {
  // Credentials live only in this component's memory. Never write them to a
  // cookie, storage, logs, generated pages, query strings or the repository.
  const [token, setToken] = useState("");
  const [login, setLogin] = useState("");
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [sources, setSources] = useState<Record<string, SourceRecord>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [demo, setDemo] = useState(false);
  const pending = entries.filter(entry => ["rascunho", "revisao"].includes(field(entry, "status")));

  async function refresh() {
    setBusy(true); setError("");
    try { const data = await loadNewsQueue(token); setEntries(data.entries); setSources(data.sources); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível atualizar a fila."); }
    finally { setBusy(false); }
  }
  async function connect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const user = await connectNewsPanel(token.trim());
      const data = await loadNewsQueue(token.trim());
      setToken(token.trim()); setLogin(user); setEntries(data.entries); setSources(data.sources); setDemo(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível conectar."); }
    finally { setBusy(false); }
  }
  function disconnect() { setToken(""); setLogin(""); setEntries([]); setSources({}); setError(""); setNotice(""); setDemo(false); }
  async function act(entry: QueueEntry, action: "post" | "delete") {
    setError(""); setNotice("");
    if (demo) {
      setEntries(items => items.filter(item => item.path !== entry.path));
      setNotice(action === "post" ? "Simulação concluída: na fila real, o texto aprovado seria enviado para publicação. Nenhuma notícia foi publicada." : "Exemplo removido da simulação. Nenhum arquivo foi alterado.");
      return;
    }
    setBusy(true);
    try {
      if (action === "post") await postNews(entry, sources, entries, token, login);
      else await deleteNewsDraft(entry, token);
      setEntries(items => action === "post" ? items.map(item => item.path === entry.path ? { ...item, data: { ...item.data, status: "publicado" } } : item) : items.filter(item => item.path !== entry.path));
      setNotice(action === "post" ? "Aprovação salva no GitHub. O site será atualizado quando a publicação terminar; acompanhe pelo link abaixo." : "Rascunho excluído da fila. O histórico do GitHub mantém a versão anterior.");
    } catch (e) { setError(e instanceof Error ? e.message : "A ação não foi confirmada. Atualize a fila antes de tentar novamente."); }
    finally { setBusy(false); }
  }

  return <div className="redacao-queue">
    {!login && !demo && <section className="queue-connect" aria-labelledby="connect-heading"><h2 id="connect-heading">Conecte sua fila de aprovação</h2>
      <p>As notícias salvas como rascunho ficam aqui para você ler, postar ou excluir. A conexão com o GitHub confirma sua permissão de editor.</p>
      <form onSubmit={connect}><label htmlFor="github-token">Token de acesso do GitHub</label><input id="github-token" type="password" value={token} onChange={event => setToken(event.target.value)} autoComplete="off" required spellCheck={false} />
        <button className="queue-primary" disabled={busy || !token.trim()}>{busy ? "Conectando…" : "Conectar"}</button></form>
      <p className="queue-help">O token fica somente na memória desta aba e é enviado diretamente ao GitHub. Ao sair ou recarregar, conecte novamente. Não o envie pelo chat.</p>
      <details><summary>Como liberar o acesso</summary><p>No GitHub, crie um token de acesso específico para <strong>clubismo-off</strong>, com a permissão <strong>Contents: Read and write</strong>. Cole-o no campo acima. Não inclua outros repositórios.</p><a className="text-link" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">Abrir configurações de token</a></details>
      <div className="queue-alternatives"><button type="button" onClick={() => { setDemo(true); setEntries([example]); setError(""); setToken(""); }}>Ver uma demonstração</button><a href="https://app.pagescms.org" className="text-link">Usar o editor completo</a></div>
    </section>}
    {(login || demo) && <div className="queue-toolbar"><p>{demo ? "Demonstração — exemplo fictício, sem conexão com o blog." : `Conectado como ${login} · ${pending.length} aguardando aprovação`}</p><div>{!demo && <button onClick={refresh} disabled={busy}>Atualizar fila</button>}<button onClick={disconnect} disabled={busy}>{demo ? "Sair da demonstração" : "Sair"}</button></div></div>}
    {error && <p role="alert" className="queue-error">{error}</p>}
    {notice && <p role="status" className="queue-notice">{notice}{!demo && <> <a href={`https://github.com/${repository}/actions`} target="_blank" rel="noreferrer">Acompanhar publicação</a>.</>}</p>}
    {(login || demo) && <>
      <p className="queue-help">Leia o texto e confira as fontes. <strong>{demo ? "Simular postagem" : "Postar"}</strong> confirma sua aprovação desta versão. A assinatura será <strong>Redação Clubismo Off</strong>.</p>
      {!pending.length && <div className="queue-empty"><h2>{demo ? "Demonstração concluída." : "Nenhum rascunho aguardando aprovação."}</h2><p>{demo ? "Na fila real, cada nova notícia aparece neste mesmo formato." : "As notícias verificadas nas rodadas de pesquisa aparecem nesta fila para sua aprovação. Clique em Atualizar fila para buscar novos rascunhos. Uma rodada pode terminar sem novidades relevantes."}</p>{demo && <button onClick={() => { setEntries([example]); setNotice(""); }}>Repetir exemplo</button>}</div>}
      {pending.map((entry, index) => <article className="queue-card" key={entry.path}><header><span className="queue-number">{String(index + 1).padStart(2, "0")}</span><div><span className="eyebrow">{field(entry, "ticket") || entry.path.split("/").pop()?.replace(".json", "")}</span><h2>{field(entry, "title") || "Rascunho sem título"}</h2></div></header>
        <div className="queue-copy"><p className="queue-lead">{field(entry, "lead")}</p><p>{field(entry, "details")}</p>{field(entry, "context") && <p>{field(entry, "context")}</p>}</div>
        <div className="queue-source"><strong>Fonte: </strong>{demo ? "Clube Exemplo — comunicado fictício" : /^https:\/\//.test(field(entry, "sourceUrl")) ? <a href={field(entry, "sourceUrl")} target="_blank" rel="noreferrer">{sources[field(entry, "source")]?.name || "Abrir fonte original"}</a> : "Fonte ainda não informada"}</div>
        {!demo && Array.isArray(entry.data.confirmations) && entry.data.confirmations.map((item: { source?: string; url?: string }, i: number) => item.url?.startsWith("https://") ? <p className="queue-source" key={i}>Fonte complementar: <a href={item.url} target="_blank" rel="noreferrer">{sources[item.source || ""]?.name || "Abrir fonte"}</a></p> : null)}
        <p className="queue-byline">Redação Clubismo Off</p><div className="queue-actions"><button className="queue-primary" disabled={busy} onClick={() => act(entry, "post")}>{demo ? "Simular postagem" : "Postar"}</button><button className="queue-delete" disabled={busy} onClick={() => act(entry, "delete")}>{demo ? "Simular exclusão" : "Excluir"}</button>{!demo && <a href="https://app.pagescms.org">Editar no painel</a>}</div>
      </article>)}
    </>}
    <p className="queue-help">O repositório do blog é público: rascunhos também podem ser lidos no GitHub. <Link href="/admin">Voltar ao painel</Link>.</p>
  </div>;
}
