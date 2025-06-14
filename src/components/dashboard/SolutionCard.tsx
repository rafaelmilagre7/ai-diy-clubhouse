
import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Solution } from '@/lib/supabase';
import { TrendingUp, Settings, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardContentSection } from './CardContent';
import { useStableCallback } from '@/hooks/performance/useStableCallback';

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

// Funções estáticas fora do componente para evitar re-criação
const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'Receita':
      return "border-l-revenue border-l-4 bg-revenue-darker/20";
    case 'Operacional':
      return "border-l-operational border-l-4 bg-operational-darker/20";
    case 'Estratégia':
      return "border-l-strategy border-l-4 bg-strategy-darker/20";
    default:
      return "border-l-viverblue border-l-4 bg-viverblue/10";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Receita':
      return <TrendingUp className="h-3.5 w-3.5 mr-1" />;
    case 'Operacional':
      return <Settings className="h-3.5 w-3.5 mr-1" />;
    case 'Estratégia':
      return <BarChart className="h-3.5 w-3.5 mr-1" />;
    default:
      return <TrendingUp className="h-3.5 w-3.5 mr-1" />;
  }
};

const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return <Badge variant="outline" className="bg-green-900/40 text-green-300 border-green-700">Fácil</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-amber-900/40 text-amber-300 border-amber-700">Médio</Badge>;
    case 'advanced':
      return <Badge variant="outline" className="bg-red-900/40 text-red-300 border-red-700">Avançado</Badge>;
    default:
      return null;
  }
};

// Componente 100% otimizado com memoização completa
export const SolutionCard: React.FC<SolutionCardProps> = memo(({ solution, onClick }) => {
  // Usar callback estável para evitar re-renders
  const stableOnClick = useStableCallback(onClick);

  // Memoizar todos os estilos e ícones
  const cardConfig = useMemo(() => ({
    categoryStyle: getCategoryStyle(solution.category),
    categoryIcon: getCategoryIcon(solution.category),
    difficultyBadge: getDifficultyBadge(solution.difficulty)
  }), [solution.category, solution.difficulty]);

  return (
    <Card 
      className={cn(
        "h-full cursor-pointer group transition-all duration-300 overflow-hidden transform hover:-translate-y-1 bg-[#151823] border-neutral-700",
        cardConfig.categoryStyle
      )}
      onClick={stableOnClick}
    >
      <div className="h-36 overflow-hidden relative">
        {solution.thumbnail_url ? (
          <img 
            src={solution.thumbnail_url}
            alt={solution.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1A1E2E]">
            <span className="text-4xl font-bold text-neutral-400">
              {solution.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-transparent to-transparent opacity-90"></div>
      </div>
      
      <CardContent className="p-4 pb-2">
        <CardContentSection title={solution.title} description={solution.description} />
      </CardContent>
      
      <CardFooter className="px-4 py-3 flex items-center justify-between border-t border-neutral-800">
        <div className="flex items-center space-x-1 text-xs text-neutral-300">
          {cardConfig.categoryIcon}
          <span>{solution.category}</span>
        </div>
        {cardConfig.difficultyBadge}
      </CardFooter>
    </Card>
  );
});

SolutionCard.displayName = 'SolutionCard';
