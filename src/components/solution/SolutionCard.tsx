
import React from 'react';
import { Solution } from '@/types/solution';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronRightIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  // Função para obter classes de cor com base na categoria
  const getCategoryClasses = (category: string) => {
    switch (category) {
      case 'revenue':
        return 'text-revenue border-revenue/30 bg-revenue/10';
      case 'operational':
        return 'text-operational border-operational/30 bg-operational/10';
      case 'strategy':
        return 'text-strategy border-strategy/30 bg-strategy/10';
      default:
        return 'text-primary border-primary/30 bg-primary/10';
    }
  };

  // Função para obter o nome da categoria em português
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'revenue':
        return 'Receita';
      case 'operational':
        return 'Operacional';
      case 'strategy':
        return 'Estratégia';
      default:
        return category || 'Categoria';
    }
  };

  // Função para obter o nome da dificuldade em português
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return difficulty || 'Intermediário';
    }
  };

  // Formatar data de criação
  const formattedDate = solution.created_at 
    ? formatDistanceToNow(new Date(solution.created_at), { 
        addSuffix: true, 
        locale: ptBR 
      })
    : '';

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        "border border-border"
      )}
      onClick={handleClick}
    >
      {solution.thumbnail_url && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={solution.thumbnail_url} 
            alt={solution.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className={cn(
        "p-5 space-y-4",
        !solution.thumbnail_url && "pt-5"
      )}>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className={cn(getCategoryClasses(solution.category))}>
            {getCategoryLabel(solution.category)}
          </Badge>
          
          <span className="text-xs text-muted-foreground">
            {getDifficultyLabel(solution.difficulty)}
          </span>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {solution.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {solution.description || "Sem descrição disponível"}
          </p>
        </div>
        
        {solution.estimated_time && (
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            <span>{solution.estimated_time} min</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-4 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarIcon className="h-3 w-3 mr-1" />
          <span>{formattedDate}</span>
        </div>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-auto p-0 text-sm hover:bg-transparent hover:text-primary text-muted-foreground"
          onClick={handleClick}
        >
          Ver detalhes
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};
