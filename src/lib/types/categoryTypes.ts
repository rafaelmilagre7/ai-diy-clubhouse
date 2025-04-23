import { SolutionCategory } from '@/types/solution';

// Re-export the type to maintain existing imports
export type { SolutionCategory };

export const toSolutionCategory = (category: string): SolutionCategory => {
  if (category === 'revenue' || category === 'operational' || category === 'strategy') {
    return category as SolutionCategory;
  }
  return 'strategy';
};

export const getCategoryDisplayName = (category: SolutionCategory): string => {
  switch (category) {
    case 'revenue':
      return 'Aumento de Receita';
    case 'operational':
      return 'Otimização Operacional';
    case 'strategy':
      return 'Gestão Estratégica';
    default:
      return 'Gestão Estratégica';
  }
};

export const getCategoryStyles = (category: SolutionCategory) => {
  switch (category) {
    case 'revenue':
      return {
        text: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        hover: 'hover:bg-emerald-100',
        badge: 'bg-emerald-50 text-emerald-600 border-emerald-200'
      };
    case 'operational':
      return {
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
        badge: 'bg-blue-50 text-blue-600 border-blue-200'
      };
    case 'strategy':
    default:
      return {
        text: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100',
        badge: 'bg-purple-50 text-purple-600 border-purple-200'
      };
  }
};

// Re-exportando SolutionCategory para manter compatibilidade com o código existente
export { SolutionCategory };
