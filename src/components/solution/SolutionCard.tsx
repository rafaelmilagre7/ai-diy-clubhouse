
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, BarChart2, CheckCircle } from "lucide-react";
import { getDifficultyColor, formatEstimatedTime } from "@/utils/solution-helpers";

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionCard = ({ solution, onClick }: SolutionCardProps) => {
  // Determinar cor da dificuldade
  const difficultyColor = getDifficultyColor(solution.difficulty);
  
  // Traduzir categoria para texto legível
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

  // Verificar se há progresso
  const hasProgress = solution.progress && solution.progress[0];
  const progress = hasProgress ? solution.progress[0] : null;
  const isCompleted = progress?.is_completed || false;
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      {solution.thumbnail_url ? (
        <div className="h-40 overflow-hidden">
          <img
            src={solution.thumbnail_url}
            alt={solution.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-r from-[#0ABAB5] to-[#037c76] flex items-center justify-center text-white">
          <span className="text-xl font-medium">{solution.title}</span>
        </div>
      )}
      
      <CardContent className="pt-6 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {categoryText}
          </Badge>
          <Badge className={`text-xs ${difficultyColor}`}>
            {difficultyText}
          </Badge>
        </div>
        
        <h3 className="font-bold text-lg mb-2">{solution.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-3">
          {solution.description}
        </p>
        
        {isCompleted && (
          <div className="flex items-center gap-1 mt-3 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">Implementada</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-6">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatEstimatedTime(solution.estimated_time)}</span>
          </div>
          
          {solution.success_rate > 0 && (
            <div className="flex items-center gap-1">
              <BarChart2 className="h-3 w-3" />
              <span>{solution.success_rate}% sucesso</span>
            </div>
          )}
          
          {hasProgress && !isCompleted && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span>Em progresso</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
