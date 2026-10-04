import { z } from "zod";
import { newsTypes, transferStages } from "./news-policy.ts";
import type { NewsType } from "./news-policy.ts";
import { newsBody } from "./news-copy.ts";
import { categoryKeys } from "./categories.ts";
import type { Category } from "./categories.ts";

const optionalText = z.preprocess(value => value ?? "", z.string().trim());
const text = z.string().trim().min(1, "Preencha este campo.");
const safeUrl = text.refine(value => {
  try { const url = new URL(value); return url.protocol === "https:" && !!url.hostname && !url.username && !url.password; } catch { return false; }
}, "Use um endereço HTTPS completo e sem credenciais.");
const timestamp = text.refine(value => {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:Z|[+-]\d{2}:\d{2})$/);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const date = new Date(`${match[1]}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === match[1] && Number(match[2]) < 24 && Number(match[3]) < 60 && Number(match[4] || 0) < 60;
}, "Informe data e hora válidas com fuso, por exemplo 2026-09-30T18:31-03:00.");
const optionalTimestamp = z.preprocess(value => value ?? "", z.union([z.literal(""), timestamp]));
const optionalUrl = z.preprocess(value => value ?? "", z.union([z.literal(""), safeUrl]));
const imagePath = optionalText.refine(value => !value || safeUrl.safeParse(value).success || (/^\/images\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes("..")), "Escolha uma imagem da biblioteca de fotos ou um endereço HTTPS.");
export type NewsImageData = {
  image: string; imageAlt: string; imageCaption: string; imageCredit: string;
  imageSource: string; imageLicense: string; imageLicenseUrl: string;
};
const sourceRef = text.regex(/^content\/sources\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/, "Escolha uma fonte cadastrada.");
export const sourceSchema = z.object({
  name: text, grade: z.enum(["A", "B", "C", "D"]), baseUrl: safeUrl,
  active: z.boolean().default(false),
});
const confirmationSchema = z.object({ source: sourceRef, url: safeUrl, evidence: text });
export const newsSchema = z.preprocess(value => {
  if (!value || typeof value !== "object" || Array.isArray(value) || "body" in value) return value;
  return { ...value, body: newsBody(value as Record<string, unknown>) };
}, z.object({
  title: text.max(160), body: text.max(6000, "Limite a notícia a 6.000 caracteres."),
  category: z.enum(categoryKeys).default("noticias"),
  type: z.enum(Object.keys(newsTypes) as [NewsType, ...NewsType[]]),
  transferStage: z.enum(Object.keys(transferStages) as [keyof typeof transferStages, ...(keyof typeof transferStages)[]]).default("nao_se_aplica"),
  sensitive: z.boolean().default(false),
  source: sourceRef, sourceUrl: safeUrl, sourcePublishedAt: optionalTimestamp, evidence: text,
  confirmations: z.preprocess(value => value ?? [], z.array(confirmationSchema)),
  origin: z.enum(["manual", "redacao"]).default("manual"), status: z.literal("publicado"),
  ticket: optionalText,
  reviewNote: optionalText,
  image: imagePath, imageAlt: optionalText, imageCaption: optionalText, imageCredit: optionalText,
  imageSource: optionalUrl, imageLicense: optionalText, imageLicenseUrl: optionalUrl,
  publishedAt: timestamp, updatedAt: optionalTimestamp, correction: optionalText,
  author: optionalText.transform(value => value || "Redação Clubismo Off"),
  reviewer: text, reviewedAt: timestamp,
  sourceChecked: z.literal(true, { errorMap: () => ({ message: "Confira a fonte original e confirme a revisão." }) }),
  factsChecked: z.literal(true, { errorMap: () => ({ message: "Confira cada dado, incluindo datas e informações ausentes." }) }),
  styleChecked: z.literal(true, { errorMap: () => ({ message: "Revise neutralidade, atribuição e ausência de especulação." }) }),
}).refine(item => !item.image || !!item.imageAlt, { path: ["imageAlt"], message: "Descreva a imagem de capa." }));

export type PublicNews = NewsImageData & {
  slug: string; title: string; body: string; lead: string; type: NewsType; category: Category;
  transferStage: keyof typeof transferStages; author: string; publishedAt: string; updatedAt: string; correction: string;
  source: { name: string; url: string; publishedAt: string };
  confirmations: { name: string; url: string }[];
};

// Match origin AND path. A registered social profile must not authorize every
// other account on the same host. No network calls or URL scraping happen here.
export function urlBelongsToSource(urlValue: string, baseValue: string) {
  try {
    const url = new URL(urlValue), base = new URL(baseValue);
    const basePath = base.pathname.replace(/\/+$/, "");
    return safeUrl.safeParse(urlValue).success && safeUrl.safeParse(baseValue).success && url.origin === base.origin && (!basePath || url.pathname === basePath || url.pathname.startsWith(`${basePath}/`));
  } catch { return false; }
}
export function canonicalSourceUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) if (/^utm_|^(fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString();
}
