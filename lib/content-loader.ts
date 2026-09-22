import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

export type Category = "opiniao" | "analises" | "resenha" | "noticias";
export const categories: Record<Category, { label: string; description: string }> = {
  opiniao: { label: "Opinião", description: "Ideias para discordar, repensar e levar para a resenha." },
  analises: { label: "Análises", description: "O que o placar sozinho não consegue contar." },
  resenha: { label: "Resenha", description: "Porque o futebol também acontece fora das quatro linhas." },
  noticias: { label: "Notícias", description: "Informação apurada sobre o futebol brasileiro." },
};

const optionalText = z.preprocess(value => value ?? "", z.string());
const optionalLink = optionalText.refine(value => !value || /^https?:\/\//i.test(value), "Use um link completo, começando com https://.");
const articleSchema = z.object({
  title: z.string().trim().min(1, "Preencha o título."),
  excerpt: z.string().trim().min(1, "Preencha o resumo."),
  category: z.enum(["opiniao", "analises", "resenha", "noticias"]),
  topic: optionalText,
  author: optionalText,
  date: optionalText.refine(value => !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value), "Escolha uma data válida."),
  published: z.literal(true),
  demo: z.boolean().default(false),
  priority: z.preprocess(value => value ?? 0, z.number().int().min(0).max(100).default(0)),
  image: optionalText.refine(value => !value || /^https?:\/\//i.test(value) || (value.startsWith("/images/") && !value.includes("..") && !value.includes("\\")), "Escolha uma imagem da biblioteca de fotos."),
  imageAlt: optionalText,
  imageCaption: optionalText,
  imageCredit: optionalText,
  imageSource: optionalLink,
  imageLicense: optionalText,
  imageLicenseUrl: optionalLink,
  body: z.string().trim().min(1, "Preencha o texto da matéria."),
}).refine(article => !article.image || article.imageAlt.trim().length > 0, { path: ["imageAlt"], message: "Descreva a imagem de capa." });

export type Article = z.infer<typeof articleSchema> & { slug: string; minutes: number };

// Run at build time. Deleting the last file may also remove its Git directory.
export function readArticles(directory = resolve(process.cwd(), "content/articles")): Article[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter(name => name.endsWith(".json")).map(name => {
    const raw = JSON.parse(readFileSync(resolve(directory, name), "utf8"));
    if (raw?.published !== true) return null;
    const slug = name.slice(0, -5);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Nome inválido em ${name}: use letras minúsculas, números e hífens.`);
    const parsed = articleSchema.safeParse(raw);
    if (!parsed.success) throw new Error(`Revise ${name}: ${parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
    const words = parsed.data.body.split(/\s+/).length;
    return { ...parsed.data, slug, minutes: Math.max(1, Math.ceil(words / 200)) };
  }).filter((article): article is Article => article !== null)
    .sort((a, b) => b.priority - a.priority || b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

