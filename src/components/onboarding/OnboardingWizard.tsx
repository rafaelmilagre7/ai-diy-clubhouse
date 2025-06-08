
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OnboardingStepData, OnboardingStepType } from '@/types/onboardingTypes';
import { useOnboardingData } from '@/hooks/onboarding/useOnboardingData';
import { StepNavigation } from './components/StepNavigation';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileStep } from './steps/ProfileStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { GoalsStep } from './steps/GoalsStep';
import { CompletionStep } from './steps/CompletionStep';
import { toast } from 'sonner';

interface OnboardingWizardProps {
  onComplete: (data: OnboardingStepData) => Promise<void>;
  onSkip?: () => void;
}

const STEPS: { id: OnboardingStepType; title: string; component: React.ComponentType<any> }[] = [
  { id: 'welcome', title: 'Boas-vindas', component: WelcomeStep },
  { id: 'profile', title: 'Perfil', component: ProfileStep },
  { id: 'preferences', title: 'Preferências', component: PreferencesStep },
  { id: 'goals', title: 'Objetivos', component: GoalsStep },
  { id: 'completion', title: 'Finalização', component: CompletionStep }
];

/**
 * Wizard principal do onboarding - FASE 5
 * Sistema completo de personalização da experiência
 */
export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingStepData>({});
  const { saveOnboardingData, skipOnboardingData, isSaving } = useOnboardingData();

  const currentStepData = STEPS[currentStep];
  const CurrentStepComponent = currentStepData.component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateStepData = useCallback((stepId: OnboardingStepType, stepData: any) => {
    setData(prev => ({
      ...prev,
      [stepId]: stepData
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleComplete = async () => {
    try {
      console.log('🎉 Concluindo onboarding com dados:', data);
      
      const success = await saveOnboardingData(data);
      if (success) {
        await onComplete(data);
      }
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast.error('Erro ao salvar seus dados. Tente novamente.');
    }
  };

  const handleSkip = async () => {
    if (onSkip) {
      try {
        await skipOnboardingData();
        onSkip();
      } catch (error) {
        console.error('Erro ao pular onboarding:', error);
        toast.error('Erro ao processar. Tente novamente.');
      }
    }
  };

  const canGoNext = currentStep < STEPS.length - 1;
  const canGoPrevious = currentStep > 0;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-viverblue/5 via-purple-50 to-white py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header com progresso */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-viverblue mb-2">
            Personalizar Experiência
          </h1>
          <p className="text-gray-600 mb-6">
            Etapa {currentStep + 1} de {STEPS.length}: {currentStepData.title}
          </p>
          
          <div className="max-w-md mx-auto">
            <Progress value={progress} className="h-2 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-viverblue to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </Progress>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              {STEPS.map((step, index) => (
                <span 
                  key={step.id}
                  className={index <= currentStep ? 'text-viverblue font-medium' : ''}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Conteúdo do step atual */}
        <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CurrentStepComponent
            data={data[currentStepData.id] || {}}
            onUpdate={(stepData: any) => updateStepData(currentStepData.id, stepData)}
            allData={data}
          />

          <StepNavigation
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            isLastStep={isLastStep}
            isLoading={isSaving}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSkip={onSkip ? handleSkip : undefined}
            onComplete={handleComplete}
          />
        </Card>
      </div>
    </div>
  );
};
