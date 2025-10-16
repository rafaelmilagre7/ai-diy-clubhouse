
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
  
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="outline" className="bg-aurora-primary/20 text-aurora-primary border-aurora-primary/50">Fácil</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50">Médio</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/50">Avançado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="group relative">
      {/* Efeito de glow no hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <Card 
        className={cn(
          "relative h-full cursor-pointer transition-all duration-500 overflow-hidden",
          "bg-card/95 backdrop-blur-sm border border-border/50",
          "hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10",
          "hover:scale-[1.02] hover:-translate-y-2",
          "transform-gpu will-change-transform",
          getCategoryStyle(solution.category)
        )}
        onClick={onClick}
      >
        {/* Thumbnail com overlay gradiente */}
        <div className="h-40 overflow-hidden relative">
          {solution.thumbnail_url ? (
            <img 
              src={solution.thumbnail_url}
              alt={solution.title}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <span className="relative text-5xl font-bold text-primary/70">
                  {solution.title.charAt(0)}
                </span>
              </div>
            </div>
          )}
          {/* Overlay com gradiente mais sofisticado */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent"></div>
          
          {/* Badge de categoria flutuante */}
          <div className="absolute top-3 left-3 flex items-center space-x-1 px-2.5 py-1 bg-background/90 backdrop-blur-sm rounded-full border border-border/50 shadow-lg">
            {getCategoryIcon(solution.category)}
            <span className="text-xs font-medium text-foreground">{solution.category}</span>
          </div>
        </div>
        
        {/* Conteúdo do card */}
        <CardContent className="p-5 pb-3 space-y-3">
          <div className="space-y-2">
            <h3 className="font-heading font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {solution.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {solution.description}
            </p>
          </div>
        </CardContent>
        
        {/* Footer com badge de dificuldade */}
        <CardFooter className="px-5 py-4 flex items-center justify-between border-t border-border/30 bg-muted/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs text-muted-foreground font-medium">Disponível</span>
          </div>
          {getDifficultyBadge(solution.difficulty)}
        </CardFooter>

        {/* Indicador de hover */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </Card>
    </div>
  );
};
