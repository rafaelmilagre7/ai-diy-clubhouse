
import React from 'react';
import { useSimpleOnboarding } from '@/hooks/onboarding/useSimpleOnboarding';
import { QuickFormStep } from './QuickFormStep';
import LoadingScreen from '@/components/common/LoadingScreen';
import { StepQuemEVoceNew } from './steps/StepQuemEVoceNew';
import { StepLocalizacaoRedes } from './steps/StepLocalizacaoRedes';
import { StepComoNosConheceu } from './steps/StepComoNosConheceu';
import { StepSeuNegocio } from './steps/StepSeuNegocio';
import { StepContextoNegocio } from './steps/StepContextoNegocio';
import { StepObjetivosMetas } from './steps/StepObjetivosMetas';
import { StepExperienciaIA } from './steps/StepExperienciaIA';
import { StepPersonalizacao } from './steps/StepPersonalizacao';
import { useNavigate } from 'react-router-dom';

export const SimpleOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    currentStep,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    totalSteps,
    isSaving,
    isCompleting,
    isLoading
  } = useSimpleOnboarding();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      // Última etapa - completar onboarding
      const success = await completeOnboarding();
      if (success) {
        navigate('/onboarding-new/completed');
      }
    } else {
      // Próxima etapa - salvar e avançar
      await nextStep();
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const getStepContent = () => {
    const stepProps = {
      data,
      onUpdate: updateField,
      onNext: handleNext,
      onPrevious: currentStep > 1 ? handlePrevious : undefined,
      canProceed,
      currentStep,
      totalSteps
    };

    switch (currentStep) {
      case 1:
        return <StepQuemEVoceNew {...stepProps} />;
      case 2:
        return <StepLocalizacaoRedes {...stepProps} />;
      case 3:
        return <StepComoNosConheceu {...stepProps} />;
      case 4:
        return <StepSeuNegocio {...stepProps} />;
      case 5:
        return <StepContextoNegocio {...stepProps} />;
      case 6:
        return <StepObjetivosMetas {...stepProps} />;
      case 7:
        return <StepExperienciaIA {...stepProps} />;
      case 8:
        return <StepPersonalizacao {...stepProps} />;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <QuickFormStep
        title={getStepTitle()}
        description={getStepDescription()}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onPrevious={currentStep > 1 ? handlePrevious : undefined}
        canProceed={canProceed && !isSaving && !isCompleting}
        showBack={currentStep > 1}
      >
        {/* Mostrar indicador de salvamento */}
        {(isSaving || isCompleting) && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>{isCompleting ? 'Finalizando onboarding...' : 'Salvando progresso...'}</span>
            </div>
          </div>
        )}
        
        {getStepContent()}
      </QuickFormStep>
    </div>
  );
};
