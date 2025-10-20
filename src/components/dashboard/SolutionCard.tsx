
import React, { useMemo, memo } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Solution } from '@/lib/supabase';
import { TrendingUp, Settings, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

// Funções auxiliares memoizadas fora do componente para melhor performance
const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'Receita':
      return "border-l-revenue border-l-4 bg-revenue-darker/20";
    case 'Operacional':
      return "border-l-operational border-l-4 bg-operational-darker/20";
    case 'Estratégia':
      return "border-l-strategy border-l-4 bg-strategy-darker/20";
    default:
      return "border-l-aurora-primary border-l-4 bg-aurora-primary/10";
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

export const SolutionCard = memo<SolutionCardProps>(({ solution, onClick }) => {
  const categoryStyle = useMemo(() => getCategoryStyle(solution.category), [solution.category]);
  const categoryIcon = useMemo(() => getCategoryIcon(solution.category), [solution.category]);
  
  return (
    <Card 
      className={cn(
        "group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden",
        categoryStyle
      )}
      onClick={onClick}
    >
      <CardContent className="p-md space-y-md">
        <div className="flex items-start justify-between gap-sm">
          <div className="flex items-center gap-sm">
            {categoryIcon}
            <Badge 
              variant="secondary" 
              className="text-xs font-medium"
            >
              {solution.category}
            </Badge>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-base mb-1.5 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {solution.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {solution.description}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="px-md py-md bg-muted/30 border-t border-border/50">
        <div className="flex items-center space-x-sm w-full">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">Disponível</span>
        </div>
      </CardFooter>
    </Card>
  );
});

SolutionCard.displayName = 'SolutionCard';
