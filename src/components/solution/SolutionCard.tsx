
import React from 'react';
import { Link } from 'react-router-dom';
import { Solution } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, BarChart, TrendingUp, Settings, Zap, Layers } from 'lucide-react';
import { SolutionCategory } from '@/lib/types/categoryTypes';

interface SolutionCardProps {
  solution: Solution;
}

const getDifficultyBadgeStyle = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-900/40 text-green-300 border-green-700";
    case "medium":
      return "bg-yellow-900/40 text-yellow-300 border-yellow-700";
    case "advanced":
      return "bg-red-900/40 text-red-300 border-red-700";
    default:
      return "bg-gray-800/60 text-gray-300 border-gray-700";
  }
};

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution }) => {
  const getCategoryDetails = (category: SolutionCategory) => {
    switch (category) {
      case 'Receita':
        return {
          name: 'Receita',
          icon: <TrendingUp className="h-4 w-4 text-green-400" />,
          color: 'bg-green-900/40 text-green-300 border-green-700'
        };
      case 'Operacional':
        return {
          name: 'Operacional',
          icon: <Settings className="h-4 w-4 text-blue-400" />,
          color: 'bg-blue-900/40 text-blue-300 border-blue-700'
        };
      case 'Estratégia':
        return {
          name: 'Estratégia',
          icon: <BarChart className="h-4 w-4 text-purple-400" />,
          color: 'bg-purple-900/40 text-purple-300 border-purple-700'
        };
      default:
        return {
          name: 'Geral',
          icon: <Zap className="h-4 w-4 text-gray-400" />,
          color: 'bg-gray-800/60 text-gray-300 border-gray-700'
        };
    }
  };

  // Função para renderizar informações de tempo ou categoria
  const renderTimeInfo = () => {
    // Se há tempo estimado válido, mostra o tempo
    if (solution.estimated_time && solution.estimated_time > 0) {
      return (
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{solution.estimated_time} min</span>
        </div>
      );
    }

    // Se não há tempo, mostra ícone de módulos
    return (
      <div className="flex items-center">
        <Layers className="h-3 w-3 mr-1" />
        <span>Módulos</span>
      </div>
    );
  };

  return (
    <Link to={`/solution/${solution.id}`} className="block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md bg-[#151823] border-neutral-700">
        <CardHeader className="p-0">
          <div className="aspect-video bg-[#0F111A] relative overflow-hidden">
            {solution.thumbnail_url ? (
              <img 
                src={solution.thumbnail_url} 
                alt={solution.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1E2E] to-[#0F111A]">
                <div className="text-viverblue text-2xl font-medium">{solution.title.charAt(0)}</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-transparent to-transparent opacity-70"></div>
            <Badge 
              variant="outline"
              className={`absolute top-2 left-2 ${getCategoryDetails(solution.category).color}`}
            >
              <span className="flex items-center">
                {getCategoryDetails(solution.category).icon}
                <span className="ml-1">{getCategoryDetails(solution.category).name}</span>
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-white">{solution.title}</h3>
          <ScrollArea className="h-14 w-full">
            <p className="text-sm text-neutral-300 line-clamp-2">
              {solution.description}
            </p>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap justify-between text-xs text-neutral-400">
          {renderTimeInfo()}
          <Badge
            variant="outline"
            className={`font-medium ${getDifficultyBadgeStyle(solution.difficulty)}`}
          >
            {solution.difficulty === "easy"
              ? "Fácil"
              : solution.difficulty === "medium"
              ? "Médio"
              : solution.difficulty === "advanced"
              ? "Avançado"
              : solution.difficulty}
          </Badge>
          {typeof solution.success_rate === "number" && solution.success_rate > 0 && (
            <Badge variant="outline" className="bg-blue-900/40 text-blue-300 border-blue-700">
              {solution.success_rate}% sucesso
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};
