
import { Button } from "@/components/ui/button";
import {
  Clock,
  BarChart2,
  Users,
  Calendar,
  CheckCircle2,
  Play,
  Repeat
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Solution } from "@/lib/supabase";
import { formatEstimatedTime, formatDate } from "@/utils/solution-helpers";

interface SolutionSidebarProps {
  solution: Solution;
  progress: any;
  startImplementation: () => Promise<void>;
  continueImplementation: () => Promise<void>;
  initializing: boolean;
  implementationMetrics?: any;
}

export const SolutionSidebar = ({
  solution,
  progress,
  startImplementation,
  continueImplementation,
  initializing,
  implementationMetrics
}: SolutionSidebarProps) => {
  const hasStarted = !!progress;
  const completionPercentage = progress?.completion_percentage || 0;
  const isCompleted = progress?.is_completed || false;
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <h3 className="font-semibold text-lg">Informações da Solução</h3>
        
        <div className="flex items-center gap-2">
          <Clock className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">
            {formatEstimatedTime(solution.estimated_time)}
          </span>
        </div>
        
        {solution.success_rate > 0 && (
          <div className="flex items-center gap-2">
            <BarChart2 className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">
              {solution.success_rate}% taxa de sucesso na implementação
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">
            {solution.estimated_time ? 'Ideal para empresas de todos os tamanhos' : 'Complexidade variável'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">
            Atualizado em {formatDate(solution.updated_at)}
          </span>
        </div>
        
        {hasStarted && !isCompleted && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Seu progresso</span>
              <span className="text-xs">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        {isCompleted ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Solução Implementada!</span>
            </div>
            
            <Button
              className="w-full"
              variant="outline"
              onClick={async () => await continueImplementation()}
            >
              <Repeat className="mr-2 h-4 w-4" />
              Revisar Implementação
            </Button>
          </div>
        ) : hasStarted ? (
          <Button
            className="w-full"
            onClick={async () => await continueImplementation()}
            disabled={initializing}
          >
            {initializing ? (
              "Carregando..."
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Continuar Implementação
                {completionPercentage > 0 && ` (${completionPercentage}%)`}
              </>
            )}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={async () => await startImplementation()}
            disabled={initializing}
          >
            {initializing ? (
              "Inicializando..."
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Começar Implementação
              </>
            )}
          </Button>
        )}
      </div>
      
      {solution.prerequisites && Array.isArray(solution.prerequisites) && solution.prerequisites.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-lg mb-3">Pré-requisitos</h3>
          <ul className="list-disc list-inside space-y-1">
            {solution.prerequisites.map((prerequisite: any, index: number) => (
              <li key={index} className="text-sm">
                {prerequisite.text || prerequisite}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
