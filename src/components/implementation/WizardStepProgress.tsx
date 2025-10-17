
import React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WizardStepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

export const WizardStepProgress = ({
  currentStep,
  totalSteps,
  stepTitles = [],
}: WizardStepProgressProps) => {
  // Array de etapas
  const steps = Array.from({ length: totalSteps }, (_, i) => i);
  
  // Filtramos o primeiro passo (Landing) na visualização móvel
  const visibleStepsOnMobile = steps.filter(step => step > 0);

  return (
    <TooltipProvider>
      <div className="mb-4 px-4 py-3 rounded-xl shadow-md bg-white/80 border border-aurora-primary/10 transition-all">
        {/* Versão desktop - mostra todos os passos */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              {/* Círculo do passo */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 text-xs font-medium",
                      index < currentStep 
                        ? "bg-operational border-operational text-white shadow-sm"
                        : index === currentStep 
                          ? "bg-gradient-to-br from-aurora-primary to-aurora-primary-light border-aurora-primary text-white ring-2 ring-aurora-primary/20 shadow-lg scale-110 z-10"
                          : "bg-muted border-border text-muted-foreground"
                    )}
                  >
                    {index === 0 ? (
                      <span className="opacity-0">1</span> // Espaço reservado invisível
                    ) : index < currentStep ? (
                      <CheckIcon className="w-3.5 h-3.5" />
                    ) : (
                      <span>{index}</span>
                    )}
                  </div>
                </TooltipTrigger>
                {stepTitles[index] && (
                  <TooltipContent side="bottom" className="bg-aurora-primary text-white text-xs">
                    {stepTitles[index]}
                  </TooltipContent>
                )}
              </Tooltip>
              
              {/* Linha conectora */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-1 transition-colors duration-300 rounded-full",
                    index < currentStep ? "bg-operational" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Versão mobile - mostra apenas os passos principais, sem o primeiro */}
        <div className="flex md:hidden items-center justify-between">
          {visibleStepsOnMobile.map((step, index) => (
            <React.Fragment key={step}>
              {/* Círculo do passo em versão compacta */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300 text-xs",
                  step < currentStep 
                    ? "bg-operational border-operational text-white"
                    : step === currentStep 
                      ? "bg-aurora-primary border-aurora-primary text-white ring-1 ring-aurora-primary/20 scale-105"
                      : "bg-muted border-border text-muted-foreground"
                )}
              >
                {step < currentStep ? (
                  <CheckIcon className="w-3 h-3" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              
              {/* Linha conectora para mobile */}
              {index < visibleStepsOnMobile.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-0.5 transition-colors duration-300 rounded-full",
                    step < currentStep ? "bg-operational" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
