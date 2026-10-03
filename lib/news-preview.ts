import type { PublicNews } from "./news-schema.ts";
import { newsBody, newsSummary } from "./news-copy.ts";

export const newsEditorUrl = "https://app.pagescms.org/constanccini/clubismo-off/main/collection/ultimas";
export const newsFilePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const sourceFilePattern = /^content\/sources\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;
const string = (value: unknown) => typeof value === "string" ? value : "";
const safeUrl = (value: unknown) => {
  try { const url = new URL(string(value)); return url.protocol === "https:" && !url.username && !url.password ? url.href : ""; } catch { return ""; }
};
const date = (value: unknown) => /^\d{4}-\d{2}-\d{2}T/.test(string(value)) && Number.isFinite(Date.parse(string(value))) ? string(value) : "";

/** Preview data is read in the browser, never added to the site's public news payload. */
export function newsPreviewItem(data: Record<string, unknown>, slug: string, sourceNames: Record<string, string>): PublicNews {
  const image = string(data.image);
  return {
    slug, title: string(data.title) || "Notícia sem título", body: newsBody(data), lead: newsSummary(newsBody(data)),
    type: "nota_oficial", transferStage: data.transferStage === "oficial" ? "oficial" : "nao_se_aplica",
    author: string(data.author) || "Redação Clubismo Off", publishedAt: date(data.publishedAt), updatedAt: date(data.updatedAt), correction: string(data.correction),
    image: /^\/images\/[a-zA-Z0-9_./-]+$/.test(image) && !image.includes("..") ? image : safeUrl(image),
    imageAlt: string(data.imageAlt), imageCaption: string(data.imageCaption), imageCredit: string(data.imageCredit),
    imageSource: safeUrl(data.imageSource), imageLicense: string(data.imageLicense), imageLicenseUrl: safeUrl(data.imageLicenseUrl),
    source: { name: sourceNames[string(data.source)] || "Abrir fonte original", url: safeUrl(data.sourceUrl), publishedAt: date(data.sourcePublishedAt) },
    confirmations: (Array.isArray(data.confirmations) ? data.confirmations : []).filter(item => item && typeof item === "object" && safeUrl(item.url)).map(item => ({ name: sourceNames[string(item.source)] || "Abrir fonte complementar", url: safeUrl(item.url) })),
  };
}
