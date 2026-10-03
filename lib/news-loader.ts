import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assessNewsPolicy } from "./news-policy.ts";
import type { SourceGrade } from "./news-policy.ts";
import { sourceSchema, newsSchema, urlBelongsToSource, canonicalSourceUrl } from "./news-schema.ts";
import type { PublicNews } from "./news-schema.ts";
import { newsSummary } from "./news-copy.ts";
export type { PublicNews } from "./news-schema.ts";

export function readNews(directory = resolve(process.cwd(), "content/news"), sourcesDirectory = resolve(process.cwd(), "content/sources"), now = Date.now()): PublicNews[] {
  if (!existsSync(directory)) return [];
  const seen = new Map<string, string>();
  const readSource = (ref: string, url: string) => {
    const path = resolve(sourcesDirectory, ref.slice("content/sources/".length));
    if (!existsSync(path)) throw new Error(`Fonte não cadastrada: ${ref}.`);
    const parsed = sourceSchema.safeParse(JSON.parse(readFileSync(path, "utf8")));
    if (!parsed.success) throw new Error(`Cadastro de fonte incompleto: ${ref}.`);
    if (!parsed.data.active) throw new Error(`Fonte desativada: ${parsed.data.name}.`);
    if (!urlBelongsToSource(url, parsed.data.baseUrl)) throw new Error(`O link não pertence ao endereço cadastrado para ${parsed.data.name}.`);
    return parsed.data;
  };
  return readdirSync(directory).filter(name => name.endsWith(".json")).map(name => {
    try {
      const raw = JSON.parse(readFileSync(resolve(directory, name), "utf8"));
      // Drafts may be incomplete. Nothing from them is serialized to the site.
      if (raw?.status !== "publicado") return null;
      const slug = name.slice(0, -5);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Nome de arquivo inválido; use letras minúsculas, números e hífens.");
      const parsed = newsSchema.safeParse(raw);
      if (!parsed.success) throw new Error(parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; "));
      const n = parsed.data;
      const source = readSource(n.source, n.sourceUrl);
      const confirmations = n.confirmations.map(item => ({ ...item, record: readSource(item.source, item.url) }));
      if (confirmations.some(item => item.record.grade === "D")) throw new Error("Agregador não serve como confirmação adicional.");
      const confirmedByOfficial = confirmations.some(item => item.record.grade === "A" && item.source !== n.source && canonicalSourceUrl(item.url) !== canonicalSourceUrl(n.sourceUrl));
      const policy = assessNewsPolicy({ grade: source.grade as SourceGrade, type: n.type, transferStage: n.transferStage, sensitive: n.sensitive, confirmedByOfficial });
      if (!policy.canPublish) throw new Error(policy.reason);
      if (["contratacao", "renovacao", "emprestimo", "rescisao"].includes(n.type) && n.transferStage === "nao_se_aplica") throw new Error("Informe a etapa da transferência ou do vínculo.");
      if (source.grade !== "A" && n.transferStage === "oficial" && !confirmedByOfficial) throw new Error("O status Oficial exige uma confirmação de fonte oficial.");
      if (!(["contratacao", "renovacao", "emprestimo", "rescisao"] as string[]).includes(n.type) && n.transferStage !== "nao_se_aplica") throw new Error("A etapa de transferência só se aplica a contratação, renovação, empréstimo ou rescisão.");
      const publicTime = Date.parse(n.publishedAt), reviewTime = Date.parse(n.reviewedAt);
      const updateTime = n.updatedAt ? Date.parse(n.updatedAt) : publicTime;
      if ([publicTime, reviewTime, updateTime, ...(n.sourcePublishedAt ? [Date.parse(n.sourcePublishedAt)] : [])].some(time => time > now)) throw new Error("A data está no futuro. Este painel não agenda publicações.");
      if (n.sourcePublishedAt && Date.parse(n.sourcePublishedAt) > reviewTime) throw new Error("A revisão não pode ser anterior à fonte.");
      if (reviewTime > updateTime) throw new Error("A publicação ou atualização não pode ser anterior à revisão.");
      if (updateTime < publicTime) throw new Error("A atualização não pode ser anterior à publicação.");
      if (!!n.updatedAt !== !!n.correction) throw new Error("Preencha juntos a data de atualização e a nota de correção/atualização.");
      const key = canonicalSourceUrl(n.sourceUrl);
      if (seen.has(key)) throw new Error(`Fonte original já utilizada em ${seen.get(key)}. Atualize essa nota em vez de duplicá-la.`);
      seen.set(key, name);
      // Explicit allowlist: source excerpts, reviewer data, grades and drafts
      // never enter the public build payload (the GitHub repository is public).
      return { slug, title: n.title, body: n.body, lead: newsSummary(n.body), type: n.type, transferStage: n.transferStage,
        author: n.author, publishedAt: n.publishedAt, updatedAt: n.updatedAt, correction: n.correction,
        image: n.image, imageAlt: n.imageAlt, imageCaption: n.imageCaption, imageCredit: n.imageCredit,
        imageSource: n.imageSource, imageLicense: n.imageLicense, imageLicenseUrl: n.imageLicenseUrl,
        source: { name: source.name, url: n.sourceUrl, publishedAt: n.sourcePublishedAt },
        confirmations: confirmations.map(item => ({ name: item.record.name, url: item.url })),
      } satisfies PublicNews;
    } catch (error) { throw new Error(`Revise Últimas / ${name}: ${error instanceof Error ? error.message : String(error)}`); }
  }).filter((item): item is PublicNews => item !== null)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.slug.localeCompare(b.slug));
}
