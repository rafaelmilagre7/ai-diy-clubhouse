
// Type definitions for categories in the application
export type SolutionCategory = "revenue" | "operational" | "strategy";

// Helper function to validate if a string is a valid SolutionCategory
export const isSolutionCategory = (category: string): category is SolutionCategory => {
  return ["revenue", "operational", "strategy"].includes(category);
};

// Function to convert string to SolutionCategory, with a fallback
export const toSolutionCategory = (category: string): SolutionCategory => {
  // Se "operations" for enviado do banco, converter para "operational"
  if (category === "operations") {
    return "operational";
  }
  return isSolutionCategory(category) ? category : "operational";
};
