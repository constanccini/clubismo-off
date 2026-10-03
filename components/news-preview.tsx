"use client";
import { useEffect, useRef, useState } from "react";
import { NewsArticle } from "@/components/news-article";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { newsEditorUrl, newsFilePattern, sourceFilePattern, newsPreviewItem } from "@/lib/news-preview";
import type { PublicNews } from "@/lib/news-schema";

const api = "https://api.github.com/repos/constanccini/clubismo-off/contents/";
type Choice = { slug: string; label: string };
async function get(path: string, signal: AbortSignal) {
  const response = await fetch(`${api}${path}?ref=main`, { signal, cache: "no-store", headers: { Accept: "application/vnd.github+json" } });
  if (response.status === 404 && path === "content/news") return [];
  if (!response.ok) throw new Error(response.status === 404 ? "Essa notícia não está mais na fila." : response.status === 403 || response.status === 429 ? "O acesso às prévias está temporariamente limitado. Tente novamente mais tarde; seus textos continuam no painel." : "Não foi possível carregar a versão salva. Tente atualizar a prévia.");
  return response.json();
}
async function readFile(path: string, signal: AbortSignal): Promise<Record<string, unknown>> {
  const file = await get(path, signal);
  if (!file || typeof file !== "object" || !("content" in file) || typeof file.content !== "string" || !("encoding" in file) || file.encoding !== "base64") throw new Error("Não foi possível ler a notícia salva.");
  const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g, "")), character => character.charCodeAt(0))));
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("O conteúdo salvo precisa ser conferido no painel.");
  return data;
}

export function NewsPreview() {
  const [choices, setChoices] = useState<Choice[]>([]);
  const [selected, setSelected] = useState("");
  const [item, setItem] = useState<PublicNews | null>(null);
  const [note, setNote] = useState("");
  const [stage, setStage] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);

  async function load(requested = "") {
    controller.current?.abort();
    const current = new AbortController(); controller.current = current;
    const signal = current.signal;
    setBusy(true); setError(""); setItem(null); setNote("");
    try {
      const listing = await get("content/news", signal);
      if (!Array.isArray(listing)) throw new Error("Não foi possível ler a fila de notícias.");
      const files: Choice[] = listing.filter(file => file.type === "file" && file.name.endsWith(".json") && newsFilePattern.test(file.name.slice(0, -5))).map(file => {
        const slug = file.name.slice(0, -5);
        const code = slug.match(/^\d{8}-\d{2}-\d{2}/)?.[0] || "";
        return { slug, label: `${code ? `${code} · ` : ""}${slug.replace(/^\d{8}-\d{2}-\d{2}-/, "").replace(/-/g, " ")}` };
      }).sort((a, b) => b.slug.localeCompare(a.slug));
      setChoices(files);
      if (!files.length) return;
      const slug = requested || files[0].slug;
      if (!newsFilePattern.test(slug) || !files.some(file => file.slug === slug)) throw new Error("Essa notícia não está mais na fila. Escolha outra no campo acima.");
      setSelected(slug);
      const data = await readFile(`content/news/${slug}.json`, signal);
      const confirmations = Array.isArray(data.confirmations) ? data.confirmations : [];
      const refs = [...new Set([data.source, ...confirmations.map(source => source?.source)].filter((source): source is string => typeof source === "string" && sourceFilePattern.test(source)))];
      const names = await Promise.all(refs.map(async path => {
        const source = await readFile(path, signal);
        return [path, typeof source.name === "string" ? source.name : "Abrir fonte"] as const;
      }));
      if (signal.aborted) return;
      setItem(newsPreviewItem(data, slug, Object.fromEntries(names)));
      setNote(typeof data.reviewNote === "string" ? data.reviewNote : "");
      setStage(data.status === "publicado" ? "Versão salva de uma notícia publicada" : "Prévia — notícia ainda não publicada");
      const url = new URL(window.location.href); url.searchParams.set("noticia", slug); window.history.replaceState(null, "", url);
    } catch (e) {
      if (!signal.aborted) setError(e instanceof Error ? e.message : "Não foi possível abrir a prévia.");
    } finally { if (!signal.aborted) setBusy(false); }
  }

  useEffect(() => {
    void load(new URLSearchParams(window.location.search).get("noticia") || "");
    return () => controller.current?.abort();
  }, []);

  return <>
    <section className="news-preview-toolbar" aria-label="Controles da prévia">
      <div><strong>Prévia da notícia</strong><p>Veja o texto salvo com o formato do blog. Para conferir uma alteração, salve no painel e atualize esta prévia.</p></div>
      <div className="news-preview-actions"><a className="panel-button" href={newsEditorUrl} target="_blank" rel="noreferrer">Editar no painel</a><button type="button" disabled={busy} onClick={() => void load(selected)}>Atualizar prévia</button></div>
      <div className="news-preview-select"><label htmlFor="preview-story">Escolher notícia</label><NativeSelect id="preview-story" value={selected} disabled={busy || !choices.length} onChange={event => void load(event.target.value)} aria-label="Escolher notícia">
        {!choices.length && <NativeSelectOption value="">{busy ? "Carregando notícias…" : "Nenhuma notícia"}</NativeSelectOption>}
        {choices.map(choice => <NativeSelectOption value={choice.slug} key={choice.slug}>{choice.label}</NativeSelectOption>)}
      </NativeSelect></div>
      <p className="news-preview-stage">{item ? stage : "Abrir esta prévia não publica nem altera a notícia."}</p>
    </section>
    {busy && <p role="status" className="news-preview-status">Carregando a versão salva…</p>}
    {error && <p role="alert" className="queue-error">{error}</p>}
    {!busy && !error && !choices.length && <p className="news-preview-status">Nenhuma notícia salva na fila.</p>}
    {item && <>{note && <aside className="news-preview-note"><strong>Atenção antes de publicar</strong><p>{note}</p></aside>}<NewsArticle item={item} preview /></>}
  </>;
}
