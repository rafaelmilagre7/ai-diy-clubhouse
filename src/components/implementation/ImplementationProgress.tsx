
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
  // Componente vazio pois a barra de progresso foi removida conforme solicitado
  return null;
};
