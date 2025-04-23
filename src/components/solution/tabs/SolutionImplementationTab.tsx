
import React from 'react';
import { Button } from '@/components/ui/button';
import { Solution, Progress } from '@/types/solution';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SolutionImplementationTabProps {
  solution: Solution;
  progress: Progress | null;
}

export const SolutionImplementationTab: React.FC<SolutionImplementationTabProps> = ({
  solution,
  progress
}) => {
  const navigate = useNavigate();
  
  const completionPercentage = progress?.completion_percentage || 0;
  const isStarted = completionPercentage > 0;
  const isCompleted = progress?.is_completed || false;
  const currentModuleIndex = progress?.current_module || 0;
  
  const handleStartImplementation = () => {
    navigate(`/implement/${solution.id}/0`);
  };
  
  const handleContinueImplementation = () => {
    navigate(`/implement/${solution.id}/${currentModuleIndex}`);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">
          Implementação passo a passo
        </h3>
        <p className="text-muted-foreground mt-2">
          Esta solução foi projetada para ser implementada através de módulos sequenciais, 
          guiando você em cada etapa do processo.
        </p>
      </div>
      
      {/* Status de implementação */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Status da implementação</h4>
            <p className="text-muted-foreground text-sm">
              {isCompleted 
                ? 'Implementação concluída!' 
                : isStarted 
                  ? `Progresso: ${completionPercentage}% completo` 
                  : 'Implementação não iniciada'}
            </p>
          </div>
          <div>
            {isCompleted ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <Clock className="h-8 w-8 text-blue-500" />
            )}
          </div>
        </div>
      </div>
      
      {/* Botão de ação */}
      <div className="flex justify-center mt-6">
        <Button 
          onClick={isStarted ? handleContinueImplementation : handleStartImplementation}
          className="px-6"
        >
          {isStarted ? 'Continuar implementação' : 'Iniciar implementação'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      {/* Módulos */}
      {solution.modules && solution.modules.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Módulos de implementação</h3>
          <div className="space-y-3">
            {solution.modules.map((module, index) => (
              <div 
                key={module.id} 
                className="p-3 border rounded-md flex items-center gap-3"
              >
                <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center font-medium text-slate-700">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium">{module.title}</h4>
                  {module.estimated_time_minutes && (
                    <p className="text-xs text-muted-foreground">
                      Tempo estimado: {module.estimated_time_minutes} min
                    </p>
                  )}
                </div>
                {progress?.completed_modules?.includes(index) && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionImplementationTab;
