
// Define os novos tipos de categoria padronizados
export type SolutionCategory = "Receita" | "Operacional" | "Estratégia";

// Mapeamento de categorias antigas para novas (para compatibilidade)
export const categoryMapping: Record<string, SolutionCategory> = {
  'revenue': 'Receita',
  'operational': 'Operacional', 
  'strategy': 'Estratégia',
  'Receita': 'Receita',
  'Operacional': 'Operacional',
  'Estratégia': 'Estratégia'
};

// Função de utilidade para converter categorias antigas para novas
export const mapLegacyCategory = (category: string): SolutionCategory => {
  return categoryMapping[category] || 'Operacional'; // Valor padrão caso a categoria não seja reconhecida
};

// Função de utilidade para obter o nome amigável das categorias
export const getCategoryDisplayName = (category: SolutionCategory | string): string => {
  switch (category) {
    case 'Receita':
      return 'Receita';
    case 'Operacional':
      return 'Otimização Operacional';
    case 'Estratégia':
      return 'Gestão Estratégica';
    // Compatibilidade com valores antigos
    case 'revenue':
      return 'Receita';
    case 'operational':
      return 'Otimização Operacional';
    case 'strategy':
      return 'Gestão Estratégica';
    default:
      return String(category);
  }
};

// Helper function for safe category handling
export const safeCategoryConversion = (category: string): SolutionCategory => {
  if (!category) return 'Operacional';
  return mapLegacyCategory(category);
};
