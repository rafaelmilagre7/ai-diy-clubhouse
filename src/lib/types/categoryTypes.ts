
// Tipos de categorias de soluções
export type SolutionCategory = 'Receita' | 'Operacional' | 'Estratégia';

// Mapeamento de cores por categoria usando o novo design system
export const categoryColorMap: Record<SolutionCategory, string> = {
  'Receita': 'success',
  'Operacional': 'info', 
  'Estratégia': 'secondary'
};

// Configuração de categorias com ícones e cores
export interface CategoryConfig {
  name: SolutionCategory;
  color: string;
  icon: string;
  description?: string;
  badgeVariant: 'success' | 'info' | 'secondary';
}

export const solutionCategories: Record<SolutionCategory, CategoryConfig> = {
  'Receita': {
    name: 'Receita',
    color: 'success',
    icon: 'TrendingUp',
    description: 'Soluções focadas em aumentar receita e vendas',
    badgeVariant: 'success'
  },
  'Operacional': {
    name: 'Operacional', 
    color: 'info',
    icon: 'Settings',
    description: 'Soluções para otimizar processos e operações',
    badgeVariant: 'info'
  },
  'Estratégia': {
    name: 'Estratégia',
    color: 'secondary', 
    icon: 'BarChart',
    description: 'Soluções estratégicas e de planejamento',
    badgeVariant: 'secondary'
  }
};

// Função utilitária para obter configuração da categoria
export function getCategoryConfig(category: SolutionCategory): CategoryConfig {
  return solutionCategories[category] || solutionCategories['Receita'];
}

// Função para validar categoria
export function isValidCategory(category: string): category is SolutionCategory {
  return Object.keys(solutionCategories).includes(category);
}
