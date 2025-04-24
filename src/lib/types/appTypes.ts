
/**
 * Arquivo central de tipos para a aplicação
 * Consolidando definições que estavam espalhadas em diferentes arquivos
 */

// Tipos essenciais de categoria
export type SolutionCategory = "revenue" | "operational" | "strategy";

// Função para validar se uma string é uma categoria válida
export const isSolutionCategory = (category: string): category is SolutionCategory => {
  return ["revenue", "operational", "strategy"].includes(category);
};

// Função robusta para converter string para o tipo SolutionCategory, com fallback
export const toSolutionCategory = (category: string | undefined): SolutionCategory => {
  if (!category) {
    return "operational";
  }
  
  const normalizedCategory = category.toLowerCase();
  
  // Mapeamento de possíveis valores vindos do banco
  if (normalizedCategory === "operations" || 
      normalizedCategory === "operacional" || 
      normalizedCategory === "operational") {
    return "operational";
  }
  
  if (normalizedCategory === "receita" || 
      normalizedCategory === "revenue") {
    return "revenue";
  }
  
  if (normalizedCategory === "estratégia" || 
      normalizedCategory === "strategy") {
    return "strategy";
  }
  
  // Verificação final
  return isSolutionCategory(normalizedCategory) ? 
    normalizedCategory as SolutionCategory : "operational";
};

// Tradução de categorias para exibição
export const getCategoryDisplayName = (category: SolutionCategory): string => {
  switch (category) {
    case "revenue":
      return "Receita";
    case "operational":
      return "Operacional";
    case "strategy":
      return "Estratégia";
    default:
      return "Operacional";
  }
};

// Helper para estilo de categorias
export const getCategoryStyles = (category: SolutionCategory) => {
  switch (category) {
    case "revenue":
      return "bg-gradient-to-r from-revenue to-revenue-light text-white";
    case "operational":
      return "bg-gradient-to-r from-operational to-operational-light text-white";
    case "strategy":
      return "bg-gradient-to-r from-strategy to-strategy-light text-white";
    default:
      return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
  }
};
