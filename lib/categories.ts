export type Category = "opiniao" | "analises" | "resenha" | "noticias";
export const categoryKeys = ["opiniao", "analises", "resenha", "noticias"] as const;
export const categories: Record<Category, { label: string; description: string }> = {
  opiniao: { label: "Opinião", description: "Ideias para discordar, repensar e levar para a resenha." },
  analises: { label: "Análises", description: "O que o placar sozinho não consegue contar." },
  resenha: { label: "Resenha", description: "Porque o futebol também acontece fora das quatro linhas." },
  noticias: { label: "Notícias", description: "Informação apurada sobre o futebol brasileiro." },
};
