
// Type definitions for categories in the application
export type SolutionCategory = "revenue" | "operational" | "strategy";

// Helper function to validate if a string is a valid SolutionCategory
export const isSolutionCategory = (category: string): category is SolutionCategory => {
  return ["revenue", "operational", "strategy"].includes(category);
};

// Function to convert string to SolutionCategory, with a fallback
export const toSolutionCategory = (category: string | undefined): SolutionCategory => {
  // Verificação de valor undefined/null
  if (!category) {
    console.warn("Categoria indefinida, usando 'operational' como fallback");
    return "operational";
  }
  
  // Converter para lowercase para aumentar a robustez
  const normalizedCategory = category.toLowerCase();
  
  // Mapeamento de possíveis valores do banco para o tipo correto
  if (normalizedCategory === "operations" || normalizedCategory === "operacional") {
    return "operational";
  }
  
  if (normalizedCategory === "receita") {
    return "revenue";
  }
  
  if (normalizedCategory === "estratégia") {
    return "strategy";
  }
  
  // Verifica se é um valor válido, caso contrário usa fallback
  return isSolutionCategory(category) ? category as SolutionCategory : "operational";
};
