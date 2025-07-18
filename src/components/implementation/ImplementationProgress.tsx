
import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ImplementationProgressProps {
  progress: number;
  currentStep: number;
  totalSteps: number;
  completedModules: number[];
}

export const ImplementationProgress: React.FC<ImplementationProgressProps> = ({
  progress,
  currentStep,
  totalSteps,
  completedModules
}) => {
  // FASE 3: Memoizar cálculos e strings formatadas
  const progressData = useMemo(() => ({
    roundedProgress: Math.round(progress),
    completedCount: completedModules.length,
    progressText: `${Math.round(progress)}% concluído`,
    stepsText: `Etapa ${currentStep} de ${totalSteps}`,
    modulesText: `${completedModules.length} módulos completados`
  }), [progress, currentStep, totalSteps, completedModules.length]);

  return (
    <Card className="bg-gradient-to-r from-backgroundLight to-backgroundLighter border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="font-medium text-textPrimary">
              Progresso da Implementação
            </span>
          </div>
          <span className="text-sm font-medium text-textSecondary">
            {progressData.progressText}
          </span>
        </div>
        
        <Progress value={progressData.roundedProgress} className="mb-3" />
        
        <div className="flex justify-between text-sm text-textSecondary">
          <span>{progressData.stepsText}</span>
          <span>{progressData.modulesText}</span>
        </div>
      </CardContent>
    </Card>
  );
};
