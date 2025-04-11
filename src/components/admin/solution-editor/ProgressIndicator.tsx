
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
}) => {
  const progressPercentage = Math.round((currentStep / (totalSteps - 1)) * 100);
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Etapa {currentStep + 1} de {totalSteps}:
          <span className="ml-2 font-semibold text-primary">{stepTitle}</span>
        </span>
        <span className="text-sm text-muted-foreground">
          {progressPercentage}% concluído
        </span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-2 bg-[#0ABAB5]/20"
      />
    </div>
  );
};

export default ProgressIndicator;
