
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Solution } from '@/lib/supabase';
import { TrendingUp, Settings, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardContentSection } from './CardContent';

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution, onClick }) => {
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
        return <Badge variant="outline" className="bg-viverblue/20 text-viverblue border-viverblue/50">Fácil</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50">Médio</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/50">Avançado</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        "h-full cursor-pointer group transition-all duration-300 overflow-hidden transform hover:-translate-y-1 bg-card border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
        getCategoryStyle(solution.category)
      )}
      onClick={onClick}
    >
      <div className="h-36 overflow-hidden relative">
        {solution.thumbnail_url ? (
          <img 
            src={solution.thumbnail_url}
            alt={solution.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-4xl font-bold text-muted-foreground">
              {solution.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-90"></div>
      </div>
      
      <CardContent className="p-4 pb-2">
        <CardContentSection title={solution.title} description={solution.description} />
      </CardContent>
      
      <CardFooter className="px-4 py-3 flex items-center justify-between border-t border-border">
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          {getCategoryIcon(solution.category)}
          <span>{solution.category}</span>
        </div>
        {getDifficultyBadge(solution.difficulty)}
      </CardFooter>
    </Card>
  );
};
