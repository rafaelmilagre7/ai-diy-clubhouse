
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ImplementationProgressProps {
  currentModule: number;
  totalModules: number;
  completedModules: number[];
  progressPercentage: number;
}

export const ImplementationProgress = ({
  currentModule,
  totalModules,
  completedModules,
  progressPercentage
}: ImplementationProgressProps) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          Módulo {currentModule + 1} de {totalModules}
        </p>
        <p className="text-xs text-neutral-400">
          {completedModules.length} concluídos
        </p>
      </div>
      
      <div className="w-32">
        <Progress 
          value={progressPercentage} 
          className="h-2"
        />
        <p className="text-xs text-neutral-400 mt-1 text-center">
          {Math.round(progressPercentage)}%
        </p>
      </div>
    </div>
  );
};
