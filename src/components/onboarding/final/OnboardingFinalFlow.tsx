
import React from 'react';
import { useOnboardingFinalFlow } from '@/hooks/onboarding/useOnboardingFinalFlow';
import { OnboardingLayout } from '../OnboardingLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import { StepPersonalInfo } from './steps/StepPersonalInfo';
import { StepLocationInfo } from './steps/StepLocationInfo';
import { StepDiscoveryInfo } from './steps/StepDiscoveryInfo';
import { StepBusinessInfo } from './steps/StepBusinessInfo';
import { StepBusinessContext } from './steps/StepBusinessContext';
import { StepGoalsInfo } from './steps/StepGoalsInfo';
import { StepAIExperience } from './steps/StepAIExperience';
import { StepPersonalization } from './steps/StepPersonalization';
import { SecurityIndicator } from './security/SecurityIndicator';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
    isLoading,
    validationErrors
  } = useOnboardingFinalFlow();

  if (isLoading) {
    return <LoadingScreen message="Carregando onboarding..." />;
  }

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      // Última etapa - finalizar onboarding
      const result = await completeOnboarding();
      if (result.success) {
        // Se já estava completado, redirecionar para dashboard
        if (result.wasAlreadyCompleted) {
          toast.success('Onboarding já estava completo!');
          navigate('/dashboard');
        } else {
          toast.success('Onboarding finalizado com sucesso!');
          navigate('/onboarding-new/final/completed');
        }
      } else {
        toast.error('Erro ao finalizar onboarding: ' + result.error);
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
      totalSteps,
      validationErrors
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

  return (
    <OnboardingLayout
      title={getStepTitle()}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBackClick={currentStep > 1 ? handlePrevious : undefined}
    >
      {/* Indicador de Segurança */}
      <div className="mb-6">
        <SecurityIndicator showDetails={currentStep === 1} />
      </div>

      {/* Feedback de submissão */}
      {isSubmitting && (
        <div className="mb-6 p-4 bg-viverblue/10 border border-viverblue/20 rounded-lg">
          <div className="flex items-center justify-center gap-3 text-viverblue">
            <div className="w-5 h-5 border-2 border-viverblue border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Finalizando com proteções avançadas...</span>
          </div>
          <div className="mt-2 text-center text-sm text-gray-400">
            🛡️ Verificando integridade • 💾 Criando backup • 🔍 Validando dados
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
