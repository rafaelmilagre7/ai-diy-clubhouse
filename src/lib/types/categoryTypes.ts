
// Enum para categorias de soluções - compatível com banco de dados
export enum SolutionCategory {
  RECEITA = 'Receita',
  OPERACIONAL = 'Operacional',
  ESTRATEGIA = 'Estratégia'
}

// Type union para compatibilidade
export type SolutionCategoryType = 'Receita' | 'Operacional' | 'Estratégia';

// Função helper para converter string para SolutionCategory
export function getSolutionCategory(category: string): SolutionCategory {
  switch (category) {
    case 'Receita':
      return SolutionCategory.RECEITA;
    case 'Operacional':
      return SolutionCategory.OPERACIONAL;
    case 'Estratégia':
      return SolutionCategory.ESTRATEGIA;
    default:
      return SolutionCategory.RECEITA; // fallback
  }
}

// Função para obter detalhes da categoria - aceita string OU SolutionCategory
export function getCategoryDetails(category: string | SolutionCategory) {
  const categoryStr = typeof category === 'string' ? category : category;
  
  switch (categoryStr) {
    case 'Receita':
    case SolutionCategory.RECEITA:
      return {
        name: 'Receita',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '💰',
        description: 'Estratégias para aumentar receita'
      };
    case 'Operacional':
    case SolutionCategory.OPERACIONAL:
      return {
        name: 'Operacional',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: '⚙️',
        description: 'Otimização de processos operacionais'
      };
    case 'Estratégia':
    case SolutionCategory.ESTRATEGIA:
      return {
        name: 'Estratégia',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        icon: '🎯',
        description: 'Planejamento e estratégias de negócio'
      };
    default:
      return {
        name: 'Geral',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: '📋',
        description: 'Categoria geral'
      };
  }
}
