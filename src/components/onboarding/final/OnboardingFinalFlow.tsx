
import React from 'react';
import { useCompleteOnboarding } from '@/hooks/onboarding/useCompleteOnboarding';
import { OnboardingFinalLayout } from './OnboardingFinalLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import { StepPersonalInfo } from './steps/StepPersonalInfo';
import { StepLocationInfo } from './steps/StepLocationInfo';
import { StepDiscoveryInfo } from './steps/StepDiscoveryInfo';
import { StepBusinessInfo } from './steps/StepBusinessInfo';
import { StepBusinessContext } from './steps/StepBusinessContext';
import { StepGoalsInfo } from './steps/StepGoalsInfo';
import { StepAIExperience } from './steps/StepAIExperience';
import { StepPersonalization } from './steps/StepPersonalization';
import { useNavigate } from 'react-router-dom';

export const OnboardingFinalFlow: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    currentStep,
    totalSteps,
    isSubmitting,
    isLoading
  } = useCompleteOnboarding();

  if (isLoading) {
    return <LoadingScreen message="Carregando onboarding..." />;
  }

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      // Última etapa - finalizar onboarding
      const success = await completeOnboarding();
      if (success) {
        navigate('/onboarding-final/completed');
      }
    } else {
      // Próxima etapa
      nextStep();
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const getStepContent = () => {
    const stepProps = {
      data,
      onUpdate: updateSection,
      onNext: handleNext,
      onPrevious: currentStep > 1 ? handlePrevious : undefined,
      canProceed,
      currentStep,
      totalSteps
    };

    switch (currentStep) {
      case 1:
        return <StepPersonalInfo {...stepProps} />;
      case 2:
        return <StepLocationInfo {...stepProps} />;
      case 3:
        return <StepDiscoveryInfo {...stepProps} />;
      case 4:
        return <StepBusinessInfo {...stepProps} />;
      case 5:
        return <StepBusinessContext {...stepProps} />;
      case 6:
        return <StepGoalsInfo {...stepProps} />;
      case 7:
        return <StepAIExperience {...stepProps} />;
      case 8:
        return <StepPersonalization {...stepProps} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const titles = {
      1: 'Informações Pessoais',
      2: 'Localização e Contato',
      3: 'Como nos conheceu?',
      4: 'Dados Profissionais',
      5: 'Contexto do Negócio',
      6: 'Objetivos de Negócio',
      7: 'Experiência com IA',
      8: 'Personalização da Experiência'
    };
    return titles[currentStep as keyof typeof titles] || '';
  };

  const getStepDescription = () => {
    const descriptions = {
      1: 'Vamos começar com suas informações básicas',
      2: 'Nos ajude a entender onde você está localizado',
      3: 'Como você descobriu a Viver de IA?',
      4: 'Conte-nos sobre sua empresa e posição',
      5: 'Ajude-nos a entender seu contexto de negócio',
      6: 'Quais são seus principais objetivos?',
      7: 'Qual é sua experiência atual com IA?',
      8: 'Vamos personalizar sua experiência'
    };
    return descriptions[currentStep as keyof typeof descriptions] || '';
  };

  return (
    <OnboardingFinalLayout
      title={getStepTitle()}
      description={getStepDescription()}
      currentStep={currentStep}
      totalSteps={totalSteps}
      isSubmitting={isSubmitting}
    >
      {getStepContent()}
    </OnboardingFinalLayout>
  );
};
