
import React from 'react';
import { Solution } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, Zap, TrendingUp, Settings, BarChart } from 'lucide-react';
import { mapLegacyCategory, getCategoryDisplayName } from '@/lib/types/categoryTypes';

interface SolutionSidebarProps {
  solution: Solution;
}

export const SolutionSidebar: React.FC<SolutionSidebarProps> = ({ solution }) => {
  // Safely convert solution category to SolutionCategory type
  const normalizedCategory = mapLegacyCategory(solution.category);
  const categoryDisplayName = getCategoryDisplayName(normalizedCategory);

  const getCategoryIcon = () => {
    switch (normalizedCategory) {
      case 'Receita':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'Operacional':
        return <Settings className="h-4 w-4 text-blue-400" />;
      case 'Estratégia':
        return <BarChart className="h-4 w-4 text-purple-400" />;
      default:
        return <Zap className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'advanced':
        return 'Avançado';
      default:
        return difficulty;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detalhes da Solução
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Categoria:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              {getCategoryIcon()}
              {categoryDisplayName}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dificuldade:</span>
            <Badge 
              variant="outline" 
              className={getDifficultyColor(solution.difficulty)}
            >
              {getDifficultyLabel(solution.difficulty)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tempo estimado:</span>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              {solution.estimated_time_hours}h
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags section if available */}
      {solution.tags && solution.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {solution.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
