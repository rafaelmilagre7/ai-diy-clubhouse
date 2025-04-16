
import React from "react";
import { Progress } from "@/components/ui/progress";
import { BarChart, CheckCircle2 } from "lucide-react";
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
  // Calculate true progress based on completed modules, not just viewed
  const completionPercentage = Math.round((completedModules.length / totalModules) * 100);
  
  // Find the next module type label based on the current module
  const getNextModuleLabel = () => {
    const moduleTypes = [
      "Visão Geral",
      "Preparação Express",
      "Implementação",
      "Verificação",
      "Resultados",
      "Otimização",
      "Celebração"
    ];
    
    const nextIndex = currentModule + 1;
    if (nextIndex >= totalModules) {
      return "Conclusão";
    }
    
    return moduleTypes[Math.min(nextIndex, moduleTypes.length - 1)];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs font-medium text-muted-foreground flex items-center cursor-help">
                <BarChart className="h-3 w-3 mr-1" />
                Seu progresso de implementação
              </span>
            </TooltipTrigger>
            <TooltipContent className="w-80 p-3">
              <p>
                O progresso é calculado com base nos módulos que você confirmou ter completado.
                Avance em cada módulo e confirme sua conclusão para registrar seu progresso real.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs font-medium flex items-center cursor-help">
                {completedModules.length} de {totalModules} concluídos
                <CheckCircle2 className={`h-3 w-3 ml-1 ${completionPercentage === 100 ? 'text-green-500' : 'text-muted-foreground'}`} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Módulos confirmados como concluídos: {completionPercentage}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Progress 
        value={completionPercentage} 
        className={`h-2 ${isCompleting ? 'animate-pulse bg-muted/50' : ''}`} 
      />
      
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>Módulo {currentModule + 1} de {totalModules}</span>
        <span>{currentModule === totalModules - 1 ? "Conclusão" : `Próximo: ${getNextModuleLabel()}`}</span>
      </div>
    </div>
  );
};
