
import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  className
}) => {
  const percentage = 
    steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
  
  const isCompleted = completedSteps.length === steps.length;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">
          {isCompleted 
            ? "Implementação completa!" 
            : `Etapa ${currentStep + 1} de ${steps.length}`
        }
        </p>
        <p className={cn(
          "text-sm font-medium",
          isCompleted ? "text-green-500" : "text-viverblue"
        )}>
          {`${Math.round(percentage)}%`}
        </p>
      </div>
      
      <Progress 
        value={percentage}
        className="h-2"
        indicatorClassName={isCompleted ? "bg-green-500" : "bg-viverblue"}
      />
      
      <div className="flex mt-1 gap-1 overflow-x-auto pb-2 scrollbar-hide">
        <TooltipProvider>
          {steps.map((step, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "w-8 h-2 rounded-full flex-shrink-0 transition-all duration-300",
                    currentStep === index && "scale-y-150",
                    completedSteps.includes(index) 
                      ? "bg-green-500" 
                      : currentStep >= index 
                        ? "bg-viverblue" 
                        : "bg-gray-200"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {step}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};
