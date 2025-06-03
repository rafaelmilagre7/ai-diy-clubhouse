
import React from 'react';
import { useSimpleOnboarding } from '@/hooks/onboarding/useSimpleOnboarding';
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
    return <LoadingScreen message="Carregando onboarding..." />;
  }

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      const success = await completeOnboarding();
      if (success) {
        navigate('/onboarding-new/completed');
      }
    } else {
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
      canProceed: canProceed && !isSaving && !isCompleting,
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
        return <StepQuemEVoceNew {...stepProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      {/* Indicador de salvamento */}
      {(isSaving || isCompleting) && (
        <div className="fixed top-4 right-4 z-50">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">
                {isCompleting ? 'Finalizando...' : 'Salvando...'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {getStepContent()}
    </div>
  );
};
