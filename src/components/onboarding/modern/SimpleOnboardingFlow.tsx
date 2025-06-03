
import React from 'react';
import { useSimpleOnboarding } from '@/hooks/onboarding/useSimpleOnboarding';
import { OnboardingLayout } from '../OnboardingLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import { StepQuemEVoceNew } from './steps/StepQuemEVoceNew';
import { StepLocalizacaoRedes } from './steps/StepLocalizacaoRedes';
import { StepComoNosConheceu } from './steps/StepComoNosConheceu';
import { StepSeuNegocio } from './steps/StepSeuNegocio';
import { StepContextoNegocio } from './steps/StepContextoNegocio';
import { StepObjetivos } from './steps/StepObjetivos';
import { StepExperienciaIA } from './steps/StepExperienciaIA';
import { StepPersonalizacao } from './steps/StepPersonalizacao';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const SimpleOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    currentStep,
    totalSteps,
    isCompleting,
    isLoading
  } = useSimpleOnboarding();

  if (isLoading) {
    return <LoadingScreen message="Carregando onboarding..." />;
  }

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      // Última etapa - finalizar onboarding
      const success = await completeOnboarding();
      if (success) {
        toast.success('Onboarding finalizado com sucesso!');
        navigate('/onboarding-new/completed');
      } else {
        toast.error('Erro ao finalizar onboarding. Tente novamente.');
      }
    } else {
      // Próxima etapa
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
        return <StepObjetivos {...stepProps} />;
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
      1: 'Quem é você?',
      2: 'Localização e Redes',
      3: 'Como nos conheceu?',
      4: 'Sobre seu negócio',
      5: 'Contexto do negócio',
      6: 'Objetivos e metas',
      7: 'Experiência com IA',
      8: 'Personalização'
    };
    return titles[currentStep as keyof typeof titles] || '';
  };

  return (
    <OnboardingLayout
      title={getStepTitle()}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBackClick={currentStep > 1 ? handlePrevious : undefined}
    >
      {/* Feedback de submissão */}
      {isCompleting && (
        <div className="mb-6 p-4 bg-viverblue/10 border border-viverblue/20 rounded-lg">
          <div className="flex items-center justify-center gap-3 text-viverblue">
            <div className="w-5 h-5 border-2 border-viverblue border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Finalizando onboarding...</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
        {getStepContent()}
      </div>
    </OnboardingLayout>
  );
};
