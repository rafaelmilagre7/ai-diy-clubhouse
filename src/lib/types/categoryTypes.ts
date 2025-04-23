
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
