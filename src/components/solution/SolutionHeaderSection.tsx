
import { Solution } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { getDifficultyColor } from '@/utils/solution-helpers';

interface SolutionHeaderSectionProps {
  solution: Solution;
  implementationMetrics?: any;
}

export const SolutionHeaderSection = ({ solution, implementationMetrics }: SolutionHeaderSectionProps) => {
  // Determinar cor da badge de dificuldade
  const difficultyColor = getDifficultyColor(solution.difficulty);
  
  // Mapear categoria para texto legível
  const categoryText = {
    'revenue': 'Aumento de Receita',
    'operational': 'Otimização Operacional',
    'strategy': 'Gestão Estratégica'
  }[solution.category] || solution.category;

  // Traduzir nível de dificuldade
  const difficultyText = {
    'easy': 'Fácil',
    'medium': 'Intermediário',
    'advanced': 'Avançado'
  }[solution.difficulty] || solution.difficulty;
  
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs">
          {categoryText}
        </Badge>
        <Badge className={`text-xs ${difficultyColor}`}>
          {difficultyText}
        </Badge>
        {implementationMetrics?.completed_at && (
          <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
            Implementada
          </Badge>
        )}
      </div>
      
      <h1 className="text-3xl font-bold">{solution.title}</h1>
      
      <p className="text-muted-foreground mt-3 text-lg">{solution.description}</p>
      
      {solution.overview && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <p>{solution.overview}</p>
        </div>
      )}
      
      {implementationMetrics && implementationMetrics.completion_status === "in_progress" && (
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span>Implementação em andamento</span>
        </div>
      )}
    </div>
  );
};
