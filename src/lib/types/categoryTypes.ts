
// Tipos de categorias de soluções
export type SolutionCategory = 'Receita' | 'Operacional' | 'Estratégia';

// Mapeamento de cores por categoria
export const categoryColorMap: Record<SolutionCategory, string> = {
  'Receita': 'success',
  'Operacional': 'info', 
  'Estratégia': 'secondary'
};

// Configuração de categorias com ícones e cores
export interface CategoryConfig {
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export const solutionCategories: Record<SolutionCategory, CategoryConfig> = {
  'Receita': {
    name: 'Receita',
    color: 'success',
    icon: 'TrendingUp',
    description: 'Soluções focadas em aumentar receita e vendas'
  },
  'Operacional': {
    name: 'Operacional', 
    color: 'info',
    icon: 'Settings',
    description: 'Soluções para otimizar processos e operações'
  },
  'Estratégia': {
    name: 'Estratégia',
    color: 'secondary', 
    icon: 'BarChart',
    description: 'Soluções estratégicas e de planejamento'
  }
};
