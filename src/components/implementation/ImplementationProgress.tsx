
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ImplementationProgressProps {
  currentModule: number;
  totalModules: number;
  completedModules: number[];
  isCompleting: boolean;
}

export const ImplementationProgress = ({ 
  currentModule, 
  totalModules, 
  completedModules,
  isCompleting 
}: ImplementationProgressProps) => {
  // Find the next module type label based on the current module
  const getNextModuleLabel = () => {
    const moduleTypes = [
      "Visão Geral",
      "Ferramentas",
      "Materiais",
      "Vídeos",
      "Checklist",
      "Conclusão"
    ];
    
    const nextIndex = currentModule + 1;
    if (nextIndex >= 6) {
      return "Conclusão";
    }
    
    return moduleTypes[Math.min(nextIndex, moduleTypes.length - 1)];
  };

  return (
    <div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>{currentModule === 5 ? "Conclusão" : `${getNextModuleLabel()}`}</span>
      </div>
    </div>
  );
};
