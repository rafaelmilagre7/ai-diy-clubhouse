
// Enum para categorias de soluções - compatível com banco de dados
export enum SolutionCategory {
  RECEITA = 'Receita',
  OPERACIONAL = 'Operacional',
  ESTRATEGIA = 'Estratégia'
}

// Type union para compatibilidade
export type SolutionCategoryType = 'Receita' | 'Operacional' | 'Estratégia';

// Mapeamento de categorias para compatibilidade com componentes antigos
export const categoryMapping = {
  'Receita': SolutionCategory.RECEITA,
  'Operacional': SolutionCategory.OPERACIONAL,
  'Estratégia': SolutionCategory.ESTRATEGIA
} as const;

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
        color: 'text-revenue',
        bgColor: 'bg-revenue/10',
        icon: '💰',
        description: 'Estratégias para aumentar receita'
      };
    case 'Operacional':
    case SolutionCategory.OPERACIONAL:
      return {
        name: 'Operacional',
        color: 'text-operational',
        bgColor: 'bg-operational/10',
        icon: '⚙️',
        description: 'Otimização de processos operacionais'
      };
    case 'Estratégia':
    case SolutionCategory.ESTRATEGIA:
      return {
        name: 'Estratégia',
        color: 'text-strategy',
        bgColor: 'bg-strategy/10',
        icon: '🎯',
        description: 'Planejamento e estratégias de negócio'
      };
    default:
      return {
        name: 'Geral',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        icon: '📋',
        description: 'Categoria geral'
      };
  }
}

// Função para obter nome amigável da categoria
export function getCategoryDisplayName(category: string | SolutionCategory): string {
  const details = getCategoryDetails(category);
  return details.name;
}

// Função para obter ícone da categoria
export function getCategoryIcon(category: string | SolutionCategory): string {
  const details = getCategoryDetails(category);
  return details.icon;
}

// Lista de todas as categorias disponíveis
export const ALL_CATEGORIES = [
  { id: "all", name: "Todas" },
  { id: "Receita", name: "Receita" },
  { id: "Operacional", name: "Otimização Operacional" },
  { id: "Estratégia", name: "Gestão Estratégica" }
];
