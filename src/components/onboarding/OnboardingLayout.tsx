
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingStep } from '@/types/onboarding';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: OnboardingStep;
  totalSteps?: number;
  onBack?: () => void;
  showProgress?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps = 5,
  onBack,
  showProgress = true,
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header com progresso */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">Viver de IA</h1>
            </div>

            {/* Progress indicator */}
            {showProgress && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Etapa {currentStep} de {totalSteps}
                </span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Back button */}
            {onBack && currentStep > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {children}
        </div>
      </div>
    </div>
  );
};
