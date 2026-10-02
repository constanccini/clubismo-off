import { assessNewsPolicy } from "./news-policy.ts";
import { newsSchema, sourceSchema, urlBelongsToSource, canonicalSourceUrl } from "./news-schema.ts";
import { z } from "zod";

export const repository = "constanccini/clubismo-off";
const apiBase = `https://api.github.com/repos/${repository}`;
export type QueueEntry = { path: string; sha: string; data: Record<string, unknown> };
export type SourceRecord = { name: string; grade: "A" | "B" | "C" | "D"; baseUrl: string; active: boolean };
type Request = typeof fetch;

function headers(token: string) { return { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` }; }
async function request(url: string, token: string, init: RequestInit = {}, fetcher: Request = fetch) {
  const response = await fetcher(url, { ...init, headers: { ...headers(token), ...init.headers }, cache: "no-store", redirect: "error" });
  if (!response.ok) {
    if (response.status === 401) throw new Error("A conexão expirou ou o token é inválido. Conecte novamente.");
    if (response.status === 403) throw new Error("O GitHub recusou a ação. Confira a permissão Contents: Read and write no repositório clubismo-off.");
    if (response.status === 409 || response.status === 422) throw new Error("Este arquivo mudou ou a gravação foi recusada. Atualize a fila antes de tentar novamente.");
    throw new Error(`Não foi possível concluir a ação no GitHub (HTTP ${response.status}). Nenhum sucesso foi confirmado.`);
  }
  return response.json();
}
function decodeFile(content: string) {
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(content.replace(/\s/g, "")), char => char.charCodeAt(0))));
}
function encodeFile(data: unknown) {
  return btoa(Array.from(new TextEncoder().encode(`${JSON.stringify(data, null, 2)}\n`), byte => String.fromCharCode(byte)).join(""));
}
function validatePath(path: string) {
  if (!/^content\/news\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(path)) throw new Error("Caminho da notícia inválido.");
}
export async function connectNewsPanel(token: string, fetcher: Request = fetch): Promise<string> {
  const user = z.object({ login: z.string().min(1) }).parse(await request("https://api.github.com/user", token, {}, fetcher));
  const repo = z.object({ permissions: z.object({ push: z.boolean() }).optional() }).parse(await request(apiBase, token, {}, fetcher));
  if (repo.permissions?.push !== true) throw new Error("Esta conta não tem permissão de edição no repositório clubismo-off.");
  return user.login;
}
async function collection(path: string, token: string, fetcher: Request) {
  const response = await fetcher(`${apiBase}/contents/${path}?ref=main`, { headers: headers(token), cache: "no-store", redirect: "error" });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`Não foi possível carregar ${path} (HTTP ${response.status}).`);
  const listing = await response.json();
  if (!Array.isArray(listing)) throw new Error("A pasta de conteúdo tem formato inesperado.");
  return Promise.all(listing.filter(item => item.type === "file" && /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(item.name)).map(async item => {
    const file = z.object({ sha: z.string().min(1), content: z.string() }).parse(await request(`${apiBase}/contents/${path}/${item.name}?ref=main`, token, {}, fetcher));
    return { path: `${path}/${item.name}`, sha: file.sha as string, data: decodeFile(file.content) as Record<string, unknown> };
  }));
}
export async function loadNewsQueue(token: string, fetcher: Request = fetch) {
  const [entries, sourceFiles] = await Promise.all([collection("content/news", token, fetcher), collection("content/sources", token, fetcher)]);
  const sources: Record<string, SourceRecord> = {};
  for (const file of sourceFiles) {
    const parsed = sourceSchema.safeParse(file.data);
    if (parsed.success) sources[file.path] = parsed.data;
  }
  return { entries: entries.sort((a, b) => a.path.localeCompare(b.path)), sources };
}
export async function postNews(entry: QueueEntry, sources: Record<string, SourceRecord>, allEntries: QueueEntry[], token: string, reviewer: string, fetcher: Request = fetch, now = new Date()) {
  validatePath(entry.path);
  if (!["rascunho", "revisao"].includes(String(entry.data.status))) throw new Error("Somente rascunhos aguardando aprovação podem ser postados pela fila.");
  if (!reviewer.trim()) throw new Error("Conecte uma conta de editor.");
  const timestamp = now.toISOString().replace(/\.\d{3}Z$/, "Z");
  const parsed = newsSchema.safeParse({ ...entry.data, status: "publicado", publishedAt: timestamp, author: "Redação Clubismo Off", reviewer, reviewedAt: timestamp, sourceChecked: true, factsChecked: true, styleChecked: true });
  if (!parsed.success) throw new Error(`O rascunho precisa de ajuste: ${parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
  const n = parsed.data;
  const source = sources[n.source];
  if (!source?.active || !urlBelongsToSource(n.sourceUrl, source.baseUrl)) throw new Error("Confira o cadastro da fonte original e o link da notícia.");
  for (const confirmation of n.confirmations) {
    const s = sources[confirmation.source];
    if (!s?.active || s.grade === "D" || !urlBelongsToSource(confirmation.url, s.baseUrl)) throw new Error("A fonte complementar precisa ser conferida.");
  }
  const confirmedByOfficial = n.confirmations.some(item => sources[item.source]?.grade === "A" && item.source !== n.source && canonicalSourceUrl(item.url) !== canonicalSourceUrl(n.sourceUrl));
  const policy = assessNewsPolicy({ grade: source.grade, type: n.type, transferStage: n.transferStage, sensitive: n.sensitive, confirmedByOfficial });
  if (!policy.canPublish) throw new Error(policy.reason);
  if (["contratacao", "renovacao", "emprestimo", "rescisao"].includes(n.type) === (n.transferStage === "nao_se_aplica")) throw new Error("Confira a etapa do vínculo ou da transferência no editor.");
  if (source.grade !== "A" && n.transferStage === "oficial" && !confirmedByOfficial) throw new Error("Status Oficial exige confirmação de fonte oficial.");
  if (n.sourcePublishedAt && Date.parse(n.sourcePublishedAt) > now.getTime()) throw new Error("A data da fonte está no futuro.");
  if (n.updatedAt || n.correction) throw new Error("Correções de notícia publicada devem ser feitas no editor completo.");
  if (allEntries.some(item => item.path !== entry.path && item.data.status === "publicado" && typeof item.data.sourceUrl === "string" && canonicalSourceUrl(item.data.sourceUrl) === canonicalSourceUrl(n.sourceUrl))) throw new Error("Esta fonte já gerou uma notícia publicada. Revise a anterior para evitar duplicação.");
  // SHA is mandatory: GitHub rejects a stale draft rather than overwriting it.
  return request(`${apiBase}/contents/${entry.path}`, token, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branch: "main", sha: entry.sha, message: `Aprovar notícia: ${n.title}`, content: encodeFile(n) }) }, fetcher);
}
export async function deleteNewsDraft(entry: QueueEntry, token: string, fetcher: Request = fetch) {
  validatePath(entry.path);
  if (!["rascunho", "revisao"].includes(String(entry.data.status))) throw new Error("A fila só exclui rascunhos. Use o editor para retirar uma notícia publicada.");
  return request(`${apiBase}/contents/${entry.path}`, token, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branch: "main", sha: entry.sha, message: `Descartar rascunho: ${String(entry.data.ticket || entry.data.title)}` }) }, fetcher);
}
