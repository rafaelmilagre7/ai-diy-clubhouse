
import React from 'react';
import { Link } from 'react-router-dom';
import { Solution } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, TrendingUp, Settings, Zap } from 'lucide-react';
import { SolutionCategory } from '@/lib/types/categoryTypes';
import { cn } from '@/lib/utils';

interface SolutionCardProps {
  solution: Solution;
}

const getDifficultyBadgeVariant = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "success";
    case "medium":
      return "warning";
    case "advanced":
      return "destructive";
    default:
      return "neutral";
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "Fácil";
    case "medium":
      return "Médio";
    case "advanced":
      return "Avançado";
    default:
      return difficulty;
  }
};

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution }) => {
  const getCategoryDetails = (category: SolutionCategory) => {
    switch (category) {
      case 'Receita':
        return {
          name: 'Receita',
          icon: <TrendingUp className="h-4 w-4" />,
          variant: 'success' as const
        };
      case 'Operacional':
        return {
          name: 'Operacional',
          icon: <Settings className="h-4 w-4" />,
          variant: 'info' as const
        };
      case 'Estratégia':
        return {
          name: 'Estratégia',
          icon: <BarChart className="h-4 w-4" />,
          variant: 'secondary' as const
        };
      default:
        return {
          name: 'Geral',
          icon: <Zap className="h-4 w-4" />,
          variant: 'neutral' as const
        };
    }
  };

  const categoryDetails = getCategoryDetails(solution.category);

  return (
    <Link to={`/solution/${solution.id}`} className="block group">
      <Card 
        variant="interactive" 
        className={cn(
          "h-full overflow-hidden transition-all duration-300",
          "hover:shadow-glow-primary hover:-translate-y-1"
        )}
      >
        <CardHeader className="p-0">
          <div className="aspect-video bg-surface-elevated relative overflow-hidden">
            {solution.thumbnail_url ? (
              <img 
                src={solution.thumbnail_url} 
                alt={solution.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-surface">
                <Text variant="section" textColor="primary" className="text-gradient">
                  {solution.title.charAt(0)}
                </Text>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"></div>
            <Badge 
              variant={categoryDetails.variant}
              className="absolute top-3 left-3 backdrop-blur-sm"
            >
              <span className="flex items-center gap-1.5">
                {categoryDetails.icon}
                <span>{categoryDetails.name}</span>
              </span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 flex-1 flex flex-col">
          <Text 
            variant="card" 
            textColor="primary" 
            className="mb-2 line-clamp-1 group-hover:text-primary transition-colors"
          >
            {solution.title}
          </Text>
          
          <ScrollArea className="h-14 w-full flex-1">
            <Text variant="body-small" textColor="secondary" className="line-clamp-2">
              {solution.description}
            </Text>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap justify-between">
          <div className="flex items-center gap-1.5">
            {categoryDetails.icon}
            <Text variant="caption" textColor="tertiary">
              {categoryDetails.name}
            </Text>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge
              variant={getDifficultyBadgeVariant(solution.difficulty)}
              className="text-xs"
            >
              {getDifficultyLabel(solution.difficulty)}
            </Badge>
            
            {typeof solution.success_rate === "number" && solution.success_rate > 0 && (
              <Badge variant="info" className="text-xs">
                {solution.success_rate}% sucesso
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
