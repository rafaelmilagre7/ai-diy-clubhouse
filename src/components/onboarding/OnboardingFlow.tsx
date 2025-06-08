
import React from 'react';
import { OnboardingLayout } from './OnboardingLayout';
import { ProgressIndicator } from './ProgressIndicator';
import { useOnboardingState } from '@/hooks/onboarding/useOnboardingState';
import { OnboardingType } from '@/types/onboarding';

// Import dos steps
import { WelcomeStep } from './steps/WelcomeStep';
import { BusinessProfileStep } from './steps/BusinessProfileStep';
import { AIMaturityStep } from './steps/AIMaturityStep';
import { ObjectivesStep } from './steps/ObjectivesStep';
import { PersonalizationStep } from './steps/PersonalizationStep';
import { CompletionStep } from './steps/CompletionStep';

interface OnboardingFlowProps {
  type: OnboardingType;
  onComplete?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  type,
  onComplete,
}) => {
  const {
    currentStep,
    data,
    isLoading,
    completed,
    updateData,
    nextStep,
    previousStep,
    setLoading,
    completeOnboarding,
    overallScore,
    forceSave,
  } = useOnboardingState();

  const handleStepNext = async () => {
    // Forçar salvamento antes de avançar
    forceSave();
    
    if (currentStep < 5) {
      setLoading(true);
      
      // Simular processamento da IA
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      nextStep();
      setLoading(false);
    } else {
      // Última etapa - processar conclusão
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Simular processamento final
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      completeOnboarding();
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      data,
      onDataChange: updateData,
      onNext: handleStepNext,
      onPrevious: currentStep > 1 ? previousStep : undefined,
      isLoading,
    };

    switch (currentStep) {
      case 1:
        return <WelcomeStep {...stepProps} />;
      case 2:
        return <BusinessProfileStep {...stepProps} />;
      case 3:
        return <AIMaturityStep {...stepProps} />;
      case 4:
        return <ObjectivesStep {...stepProps} />;
      case 5:
        return <PersonalizationStep {...stepProps} />;
      default:
        return <WelcomeStep {...stepProps} />;
    }
  };

  // Se completado, mostrar tela de sucesso
  if (completed) {
    return (
      <OnboardingLayout currentStep={currentStep} showProgress={false}>
        <CompletionStep
          data={data}
          type={type}
          onFinish={onComplete}
        />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      onBack={currentStep > 1 ? previousStep : undefined}
    >
      <ProgressIndicator currentStep={currentStep} />
      
      {/* Score indicator */}
      {overallScore > 0 && (
        <div className="max-w-2xl mx-auto mb-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">
              Qualidade do perfil: <span className="font-semibold text-primary">{overallScore}%</span>
            </p>
          </div>
        </div>
      )}
      
      {renderCurrentStep()}
    </OnboardingLayout>
  );
};
