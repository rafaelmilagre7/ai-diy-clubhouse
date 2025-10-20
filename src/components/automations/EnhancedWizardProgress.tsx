import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
  icon?: React.ElementType;
  isCompleted: boolean;
  isActive: boolean;
  canNavigate: boolean;
}

interface EnhancedWizardProgressProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: number) => void;
}

export const EnhancedWizardProgress = ({ 
  currentStep, 
  steps, 
  onStepClick 
}: EnhancedWizardProgressProps) => {
  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ 
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
              }}
            />
          </div>

          {/* Steps */}
          <div className="flex items-center justify-between w-full relative z-10">
            {steps.map((step, index) => {
              const StepIcon = step.icon || Circle;
              const stepNumber = index + 1;
              const isCompleted = step.isCompleted || stepNumber < currentStep;
              const isActive = stepNumber === currentStep;
              const canClick = onStepClick && step.canNavigate;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center group"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!canClick}
                    onClick={() => canClick && onStepClick(stepNumber)}
                    className={cn(
                      "w-12 h-12 rounded-full p-0 transition-all duration-300",
                      "border-2 bg-background hover:bg-background",
                      isCompleted && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                      isActive && !isCompleted && "border-primary bg-background text-primary shadow-lg ring-4 ring-primary/20",
                      !isCompleted && !isActive && "border-muted-foreground/30 text-muted-foreground",
                      canClick && "cursor-pointer hover:scale-105"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{stepNumber}</span>
                    )}
                  </Button>

                  {/* Step Info */}
                  <div className="mt-3 text-center max-w-step-label">
                    <div className={cn(
                      "text-sm font-medium transition-colors",
                      isActive && "text-primary",
                      isCompleted && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="space-y-4">
          {/* Current Step Indicator */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Passo {currentStep} de {steps.length}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(currentStep / steps.length) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = step.isCompleted || stepNumber < currentStep;
              const isActive = stepNumber === currentStep;
              const canClick = onStepClick && step.canNavigate;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    isActive && "border-primary bg-primary/5",
                    isCompleted && "border-operational/30 bg-operational/10",
                    !isActive && !isCompleted && "border-muted bg-muted/30",
                    canClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => canClick && onStepClick(stepNumber)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    isCompleted && "border-operational bg-operational text-primary-foreground",
                    isActive && !isCompleted && "border-primary bg-primary text-primary-foreground",
                    !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-semibold">{stepNumber}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium text-sm transition-colors",
                      isActive && "text-primary",
                      isCompleted && "text-operational",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  </div>

                  {isActive && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};