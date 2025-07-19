
import React from "react";
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
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-900">
              Progresso da Implementação
            </span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {Math.round(progress)}% concluído
          </span>
        </div>
        
        <Progress value={progress} className="mb-3" />
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Etapa {currentStep} de {totalSteps}</span>
          <span>{completedModules.length} módulos completados</span>
        </div>
      </CardContent>
    </Card>
  );
};
