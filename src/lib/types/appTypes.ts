
import { cn } from "@/lib/utils";

/**
 * Tipos relacionados às categorias de soluções
 */
export type SolutionCategory = 'revenue' | 'operational' | 'strategy';

/**
 * Verifica se uma string é uma categoria válida
 */
export const isSolutionCategory = (value: any): value is SolutionCategory => {
  return ['revenue', 'operational', 'strategy'].includes(value);
};

/**
 * Converte uma string para uma categoria válida ou retorna uma categoria padrão
 */
export const toSolutionCategory = (value: any): SolutionCategory => {
  if (isSolutionCategory(value)) {
    return value;
  }
  return 'revenue'; // valor padrão
};

/**
 * Obtém o nome de exibição de uma categoria
 */
export const getCategoryDisplayName = (category: SolutionCategory | string): string => {
  const safeCategory = toSolutionCategory(category);
  
  switch (safeCategory) {
    case 'revenue':
      return 'Aumento de Receita';
    case 'operational':
      return 'Otimização Operacional';
    case 'strategy':
      return 'Gestão Estratégica';
    default:
      return 'Categoria Desconhecida';
  }
};

/**
 * Obtém os estilos CSS para uma categoria
 */
export const getCategoryStyles = (category: SolutionCategory | string): { 
  badge: string;
  card: string;
  icon: string;
  border: string;
} => {
  const safeCategory = toSolutionCategory(category);
  
  switch (safeCategory) {
    case 'revenue':
      return {
        badge: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        card: 'border-blue-100 bg-blue-50',
        icon: 'text-blue-500',
        border: 'border-blue-200'
      };
    case 'operational':
      return {
        badge: 'bg-violet-100 text-violet-800 hover:bg-violet-200',
        card: 'border-violet-100 bg-violet-50',
        icon: 'text-violet-500',
        border: 'border-violet-200'
      };
    case 'strategy':
      return {
        badge: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
        card: 'border-emerald-100 bg-emerald-50',
        icon: 'text-emerald-500',
        border: 'border-emerald-200'
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        card: 'border-gray-100 bg-gray-50',
        icon: 'text-gray-500',
        border: 'border-gray-200'
      };
  }
};
