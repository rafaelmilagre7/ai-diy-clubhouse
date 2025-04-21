
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

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
  // Criar array com o número de etapas
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <div className="mb-6 px-4 py-6 glassmorphism rounded-2xl">
      <div className="w-full flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            {/* Círculo do passo */}
            <div
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                index < currentStep 
                  ? "bg-gradient-to-r from-green-500 to-green-400 text-white" 
                  : index === currentStep 
                    ? "bg-gradient-to-r from-viverblue to-viverblue-light text-white shadow-lg ring-2 ring-viverblue/30" 
                    : "bg-neutral-100 text-neutral-400 border border-neutral-200"
              )}
            >
              {index < currentStep ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
              
              {/* Dica do título */}
              {stepTitles[index] && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span 
                    className={cn(
                      "text-xs font-medium",
                      index === currentStep ? "text-viverblue font-semibold" : "text-neutral-500"
                    )}
                  >
                    {stepTitles[index]}
                  </span>
                </div>
              )}
            </div>
            
            {/* Linha conectora */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-1 mx-1",
                  index < currentStep ? "bg-gradient-to-r from-green-500 to-green-400" : "bg-neutral-200"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
