
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ImplementationProgressProps {
  currentStep?: number;
  totalSteps?: number;
  completedModules?: number[];
}

export const ImplementationProgress = ({
  currentStep = 0,
  totalSteps = 1,
  completedModules = []
}: ImplementationProgressProps) => {
  const progressValue = totalSteps > 0 
    ? Math.round((completedModules.length / totalSteps) * 100)
    : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progresso</span>
        <span className="font-medium">{progressValue}%</span>
      </div>
      <Progress 
        value={progressValue} 
        className="h-2" 
        indicatorClassName="bg-[#0ABAB5]" 
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Etapa {currentStep + 1} de {totalSteps}</span>
        <span>{completedModules.length} módulo(s) concluído(s)</span>
      </div>
    </div>
  );
};
