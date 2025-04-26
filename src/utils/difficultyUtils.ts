
export const difficultyLabels: Record<string, string> = {
  easy: "Fácil",
  medium: "Normal", 
  advanced: "Avançado"
} as const;

export const getDifficultyLabel = (difficulty: string): string => {
  return difficultyLabels[difficulty] || difficulty;
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
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
