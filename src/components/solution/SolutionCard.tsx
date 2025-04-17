
import React from 'react';
import { Link } from 'react-router-dom';
import { Solution } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, BarChart, TrendingUp, Settings, Zap } from 'lucide-react';

interface SolutionCardProps {
  solution: Solution;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution }) => {
  const getCategoryDetails = (category: string) => {
    switch (category) {
      case 'revenue':
        return {
          name: 'Receita',
          icon: <TrendingUp className="h-4 w-4 text-green-500" />,
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'operational':
        return {
          name: 'Operacional',
          icon: <Settings className="h-4 w-4 text-blue-500" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'strategy':
        return {
          name: 'Estratégia',
          icon: <BarChart className="h-4 w-4 text-purple-500" />,
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      default:
        return {
          name: 'Geral',
          icon: <Zap className="h-4 w-4 text-gray-500" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const getDifficultyDetails = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { name: 'Fácil', color: 'text-green-600' };
      case 'medium':
        return { name: 'Médio', color: 'text-yellow-600' };
      case 'advanced':
        return { name: 'Avançado', color: 'text-red-600' };
      default:
        return { name: 'Não definido', color: 'text-gray-600' };
    }
  };

  const category = getCategoryDetails(solution.category);
  const difficulty = getDifficultyDetails(solution.difficulty);
  
  return (
    <Link to={`/solution/${solution.id}`} className="block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <CardHeader className="p-0">
          <div className="aspect-video bg-muted relative overflow-hidden">
            {solution.thumbnail_url ? (
              <img 
                src={solution.thumbnail_url} 
                alt={solution.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0ABAB5]/20 to-[#0ABAB5]/10">
                <div className="text-[#0ABAB5] font-medium">{solution.title.charAt(0)}</div>
              </div>
            )}
            <Badge 
              variant="outline"
              className={`absolute top-2 left-2 ${category.color}`}
            >
              <span className="flex items-center">
                {category.icon}
                <span className="ml-1">{category.name}</span>
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{solution.title}</h3>
          <ScrollArea className="h-14 w-full">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {solution.description}
            </p>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{solution.estimated_time || 45} min</span>
          </div>
          <div className={`font-medium ${difficulty.color}`}>
            {difficulty.name}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
