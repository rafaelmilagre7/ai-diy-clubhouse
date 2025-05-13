
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Solution } from '@/lib/supabase';
import { Clock } from 'lucide-react';
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
        return "border-l-revenue border-l-4 bg-revenue/5";
      case 'Operacional':
        return "border-l-operational border-l-4 bg-operational/5";
      case 'Estratégia':
        return "border-l-strategy border-l-4 bg-strategy/5";
      default:
        return "border-l-viverblue border-l-4 bg-viverblue/5";
    }
  };
  
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="outline" className="bg-green-950/30 text-green-400 border-green-900/50">Fácil</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-950/30 text-amber-400 border-amber-900/50">Médio</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="bg-red-950/30 text-red-400 border-red-900/50">Avançado</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        "h-full cursor-pointer group transition-all duration-300 overflow-hidden transform hover:-translate-y-1",
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
          <div className="w-full h-full flex items-center justify-center bg-[#151823]">
            <span className="text-4xl font-bold text-neutral-700">
              {solution.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151823] via-transparent to-transparent opacity-90"></div>
      </div>
      
      <CardContent className="p-4 pb-2">
        <CardContentSection title={solution.title} description={solution.description} />
      </CardContent>
      
      <CardFooter className="px-4 py-3 flex items-center justify-between border-t border-neutral-800/50">
        <div className="flex items-center space-x-1 text-xs text-neutral-400">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{solution.estimated_time || 30} min</span>
        </div>
        {getDifficultyBadge(solution.difficulty)}
      </CardFooter>
    </Card>
  );
};
