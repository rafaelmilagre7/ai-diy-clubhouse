
import { SolutionCategory } from "@/types/solution";

/**
 * Converte uma string para o tipo SolutionCategory
 */
export function toSolutionCategory(category: string | SolutionCategory | undefined): SolutionCategory {
  if (!category) {
    return "revenue";
  }
  
  // Normalizar categorias antigas para o novo padrão
  if (category === "operations" || category === "operational") {
    return "operational";
  }
  
  if (category === "revenue" || category === "strategy") {
    return category;
  }
  
  // Valor padrão caso a categoria não seja reconhecida
  return "revenue";
}

/**
 * Retorna o nome de exibição formatado para uma categoria
 */
export function getCategoryDisplayName(category: SolutionCategory): string {
  switch (category) {
    case "revenue":
      return "Aumento de Receita";
    case "operational":
      return "Otimização Operacional";
    case "strategy":
      return "Gestão Estratégica";
    default:
      return "Categoria";
  }
}

/**
 * Retorna as classes de estilo para cada categoria
 */
export function getCategoryStyles(category: SolutionCategory): {
  text: string;
  bg: string;
  border: string;
  hover: string;
} {
  switch (category) {
    case "revenue":
      return {
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        hover: "hover:bg-emerald-100"
      };
    case "operational":
      return {
        text: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
        hover: "hover:bg-blue-100"
      };
    case "strategy":
      return {
        text: "text-purple-700",
        bg: "bg-purple-50",
        border: "border-purple-200",
        hover: "hover:bg-purple-100"
      };
    default:
      return {
        text: "text-gray-700",
        bg: "bg-gray-50",
        border: "border-gray-200",
        hover: "hover:bg-gray-100"
      };
  }
}
