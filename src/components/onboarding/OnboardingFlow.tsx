
import React from 'react';
import { OnboardingLayout } from './OnboardingLayout';
import { ProgressIndicator } from './ProgressIndicator';
import { useOnboardingState } from '@/hooks/onboarding/useOnboardingState';
import { OnboardingType } from '@/types/onboarding';

// Import dos steps (serão criados na próxima etapa)
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
  } = useOnboardingState();

  const handleStepNext = () => {
    if (currentStep < 5) {
      nextStep();
    } else {
      // Última etapa - processar conclusão
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Simular processamento por enquanto
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      <CompletionStep
        data={data}
        type={type}
        onFinish={onComplete}
      />
    );
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      onBack={currentStep > 1 ? previousStep : undefined}
    >
      <ProgressIndicator currentStep={currentStep} />
      {renderCurrentStep()}
    </OnboardingLayout>
  );
};
