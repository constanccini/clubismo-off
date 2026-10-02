// Policy describes eligibility for a FUTURE integration. There is no publisher,
// scheduler, crawler or AI text generator in this phase.
export const publicationMode = "manual" as const;
export const newsTypes = {
  contratacao: "Contratação", renovacao: "Renovação", emprestimo: "Empréstimo",
  rescisao: "Rescisão", nota_oficial: "Nota oficial", partida: "Data, horário ou local de jogo",
  convocacao: "Convocação ou desconvocação", bid: "Inscrição no BID", suspensao: "Suspensão confirmada",
  escalacao: "Escalação oficial", resultado: "Resultado", sorteio: "Sorteio", tabela: "Tabela de competição",
  lesao: "Comunicado de lesão", rumor: "Rumor", acusacao: "Acusação ou investigação",
  politica: "Política interna", financas: "Finanças complexas", arbitragem: "Arbitragem controversa",
  legislacao: "Legislação ou regulamento", bastidores: "Bastidores ou conflito",
  analise: "Análise", opiniao: "Opinião",
} as const;
export type NewsType = keyof typeof newsTypes;
export type SourceGrade = "A" | "B" | "C" | "D";
export const transferStages = { nao_se_aplica: "Não se aplica", interesse: "Interesse", negociacao: "Negociação", acerto: "Acerto", oficial: "Oficial" } as const;
export type TransferStage = keyof typeof transferStages;
const sensitiveTypes = new Set<NewsType>(["rumor", "acusacao", "politica", "financas", "arbitragem", "legislacao", "bastidores", "analise", "opiniao"]);
const transferTypes = new Set<NewsType>(["contratacao", "renovacao", "emprestimo", "rescisao"]);

export function assessNewsPolicy(input: { grade: SourceGrade; type: NewsType; transferStage: TransferStage; sensitive: boolean; confirmedByOfficial: boolean }) {
  const result = (level: "A" | "B" | "C", canPublish: boolean, futureAutomatic: boolean, reason: string) => ({ level, canPublish, futureAutomatic, reason, publicationMode });
  if (input.grade === "D") return result("C", false, false, "Agregadores e páginas de torcida não são fontes aceitas em Últimas. Localize a fonte original.");
  if (["rumor", "analise", "opiniao"].includes(input.type) || input.transferStage === "interesse") return result("C", false, false, "Rumor, interesse, análise e opinião ficam fora de Últimas. Use o fluxo editorial autoral quando houver apuração.");
  if (input.grade === "C" && !input.confirmedByOfficial) return result("C", false, false, "Imprensa geral exige confirmação adicional de fonte oficial cadastrada.");
  if (input.sensitive || sensitiveTypes.has(input.type)) return result("C", true, false, "Tema sensível: exige apuração e decisão humana, mesmo com fonte oficial. Nunca automático.");
  if (transferTypes.has(input.type) && input.transferStage !== "oficial") return result("B", true, false, "Negociação ou acerto: somente rascunho para revisão humana, com atribuição explícita à fonte.");
  if (input.grade !== "A") return result("B", true, false, "Fonte secundária: rascunho para aprovação humana.");
  return result("A", true, true, "Fato objetivo de fonte oficial: elegível para uma futura integração. Hoje exige aprovação humana.");
}

export function formatNewsTime(value: string, withDate = false) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", ...(withDate ? { day: "2-digit", month: "2-digit", year: "numeric" } as const : {}), hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
export function newsDateKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}
