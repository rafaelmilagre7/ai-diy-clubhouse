
/**
 * Converte qualquer valor de entrada para um tipo de dificuldade padrão para a interface
 * @param difficulty Valor de dificuldade a ser convertido
 * @returns Valor padronizado: "easy", "medium" ou "advanced"
 */
export function toSolutionDifficulty(
  difficulty?: string | null
): "easy" | "medium" | "advanced" {
  if (!difficulty) return "medium";
  
  const difficultyLower = String(difficulty).toLowerCase();
  
  // Mapeamento para normalização
  const difficultyMap: Record<string, "easy" | "medium" | "advanced"> = {
    'beginner': 'easy',
    'easy': 'easy',
    'intermediate': 'medium', 
    'medium': 'medium',
    'advanced': 'advanced',
    'hard': 'advanced'
  };
  
  return difficultyMap[difficultyLower] || "medium";
}

/**
 * Converte um valor de dificuldade para o formato aceito pelo banco de dados
 * @param difficulty Valor de dificuldade a ser convertido
 * @returns Valor compatível com o enum do banco de dados
 */
export function toDatabaseDifficulty(
  difficulty?: string | null
): "beginner" | "intermediate" | "advanced" {
  if (!difficulty) return "intermediate";
  
  const difficultyLower = String(difficulty).toLowerCase();
  
  // Mapeamento para o banco de dados
  const databaseMap: Record<string, "beginner" | "intermediate" | "advanced"> = {
    'beginner': 'beginner',
    'easy': 'beginner',
    'intermediate': 'intermediate',
    'medium': 'intermediate',
    'advanced': 'advanced',
    'hard': 'advanced'
  };
  
  return databaseMap[difficultyLower] || "intermediate";
}
