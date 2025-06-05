
import React from "react";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ModernOnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  title: string;
  subtitle: string;
  showProgress?: boolean;
  canAccessStep?: Record<number, boolean>;
  onStepClick?: (step: number) => void;
}

const stepTitles = [
  "Dados pessoais",
  "Informações profissionais", 
  "Experiência com IA",
  "Revisão e finalização"
];

export const ModernOnboardingLayout: React.FC<ModernOnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  title,
  subtitle,
  showProgress = true,
  canAccessStep,
  onStepClick
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleStepClick = (stepNumber: number) => {
    if (onStepClick && canAccessStep?.[stepNumber]) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          {onBack && (
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="mb-6 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}

          {/* Progress Steps */}
          {showProgress && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">
                  Etapa {currentStep} de {totalSteps}
                </span>
                <span className="text-sm text-gray-400">
                  {Math.round(progressPercentage)}% concluído
                </span>
              </div>
              
              <Progress value={progressPercentage} className="h-2 mb-6 bg-gray-700" />
              
              {/* Step indicators */}
              <div className="flex justify-between">
                {stepTitles.slice(0, totalSteps).map((stepTitle, index) => {
                  const stepNumber = index + 1;
                  const isCompleted = stepNumber < currentStep;
                  const isCurrent = stepNumber === currentStep;
                  const isAccessible = canAccessStep?.[stepNumber] ?? true;
                  
                  return (
                    <div 
                      key={stepNumber} 
                      className="flex flex-col items-center cursor-pointer group"
                      onClick={() => handleStepClick(stepNumber)}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2 transition-all duration-200
                        ${isCompleted 
                          ? 'bg-viverblue text-white shadow-lg' 
                          : isCurrent
                            ? 'bg-viverblue/20 border-2 border-viverblue text-viverblue shadow-md'
                            : isAccessible
                              ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 border border-gray-600'
                              : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                        }
                        ${isAccessible && !isCurrent ? 'group-hover:scale-105' : ''}
                      `}>
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          stepNumber
                        )}
                      </div>
                      <span className={`text-xs text-center max-w-20 transition-colors ${
                        isCurrent 
                          ? 'text-viverblue font-medium' 
                          : isCompleted
                            ? 'text-white'
                            : isAccessible
                              ? 'text-gray-400 group-hover:text-gray-300'
                              : 'text-gray-500'
                      }`}>
                        {stepTitle}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
