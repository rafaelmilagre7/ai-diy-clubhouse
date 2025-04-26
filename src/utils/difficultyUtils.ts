
export const difficultyLabels: Record<string, string> = {
  easy: "Fácil",
  medium: "Normal", 
  advanced: "Avançado",
  // Mapeamentos para valores legados
  beginner: "Fácil",
  intermediate: "Normal"
} as const;

// Função para converter e normalizar valores de dificuldade legados
export const normalizeDifficulty = (difficulty: string): "easy" | "medium" | "advanced" => {
  switch (difficulty) {
    case "beginner":
      return "easy";
    case "intermediate":
      return "medium";
    case "easy":
    case "medium":
    case "advanced":
      return difficulty as "easy" | "medium" | "advanced";
    default:
      console.warn(`Valor inesperado para dificuldade: "${difficulty}". Usando "medium" como padrão.`);
      return "medium";
  }
};

export const getDifficultyLabel = (difficulty: string): string => {
  return difficultyLabels[difficulty] || difficulty;
};

export const getDifficultyColor = (difficulty: string): string => {
  // Normalizar o valor da dificuldade antes de obter a cor
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  
  switch (normalizedDifficulty) {
    case "easy":
      return "bg-green-500 text-white";
    case "medium":
      return "bg-yellow-500 text-white";
    case "advanced":
      return "bg-orange-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

// Função para converter texto traduzido de volta para o enum
export const translateDifficultyToEnum = (difficulty: string): "easy" | "medium" | "advanced" => {
  if (!difficulty) return "medium";
  
  // Se for um valor enum válido, retorna diretamente
  if (["easy", "medium", "advanced"].includes(difficulty)) {
    return difficulty as "easy" | "medium" | "advanced";
  }
  
  // Converte texto traduzido para enum
  switch (difficulty.toLowerCase()) {
    case "fácil":
      return "easy";
    case "normal":
      return "medium";
    case "avançado":
      return "advanced";
    default:
      console.warn(`Valor traduzido inesperado: "${difficulty}". Usando "medium" como padrão.`);
      return "medium";
  }
};
