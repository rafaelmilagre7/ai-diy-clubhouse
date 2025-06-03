
import React from "react";
import { cn } from "@/lib/utils";

interface StepProgressBarProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  steps,
  currentStep,
  completedSteps,
  className = ""
}) => {
  // Componente vazio para remover os indicadores visuais confusos
  // Mantendo a interface para não quebrar componentes que o utilizam
  return null;
};
