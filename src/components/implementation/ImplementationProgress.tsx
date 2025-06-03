
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ImplementationProgressProps {
  currentStep: number;
  totalSteps: number;
  completedModules: number[];
}

export const ImplementationProgress = ({ 
  currentStep, 
  totalSteps, 
  completedModules
}: ImplementationProgressProps) => {
  const progressPercentage = totalSteps > 0 ? (completedModules.length / totalSteps) * 100 : 0;

  return (
    <div className="bg-[#151823] border border-neutral-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white">Progresso</h3>
        <span className="text-xs text-neutral-400">
          {completedModules.length} de {totalSteps}
        </span>
      </div>
      
      <div className="w-full bg-neutral-700 rounded-full h-2 mb-3">
        <div 
          className="bg-viverblue h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="text-xs text-neutral-400">
        Módulo atual: {currentStep} de {totalSteps}
      </div>
    </div>
  );
};
