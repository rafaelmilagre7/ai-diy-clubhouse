
import React, { useState, useEffect } from 'react';
import { StepQuemEVoce } from './steps/StepQuemEVoce';
import { StepComoNosConheceu } from './steps/StepComoNosConheceu';
import { StepObjetivosMetas } from './steps/StepObjetivosMetas';
import { useSimpleOnboardingFlow } from '@/hooks/onboarding/useSimpleOnboardingFlow';
import { QuickOnboardingFlowProps, QuickOnboardingData } from '@/types/quickOnboarding';
import { OnboardingLayout } from '../OnboardingLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'sonner';

const TOTAL_STEPS = 3;

export const SimpleOnboardingFlow: React.FC<QuickOnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>({
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55',
    how_found_us: '',
    primary_goal: '',
    expected_outcome_30days: '',
    content_formats: []
  });

  const {
    saveProgress,
    completeOnboarding,
    isLoading,
    isSubmitting
  } = useSimpleOnboardingFlow();

  // Auto-save a cada mudança
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (data.name || data.email) {
        saveProgress(data);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [data, saveProgress]);

  const handleUpdate = (field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finalizar onboarding
      try {
        const result = await completeOnboarding(data);
        if (result.success) {
          toast.success('Bem-vindo ao VIVER DE IA Club! 🎉');
          onComplete();
        } else {
          toast.error('Erro ao finalizar onboarding: ' + result.error);
        }
      } catch (error) {
        toast.error('Erro inesperado ao finalizar onboarding');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp);
      case 2:
        return !!(data.how_found_us);
      case 3:
        return !!(data.primary_goal && data.expected_outcome_30days && data.content_formats.length > 0);
      default:
        return false;
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando onboarding..." />;
  }

  const getStepTitle = () => {
    const titles = {
      1: 'Bem-vindo ao VIVER DE IA Club!',
      2: 'Como nos conheceu?',
      3: 'Seus objetivos'
    };
    return titles[currentStep as keyof typeof titles] || '';
  };

  const stepProps = {
    data,
    onUpdate: handleUpdate,
    onNext: handleNext,
    onPrevious: currentStep > 1 ? handlePrevious : undefined,
    canProceed: canProceed(),
    currentStep,
    totalSteps: TOTAL_STEPS
  };

  return (
    <OnboardingLayout
      title={getStepTitle()}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      onBackClick={currentStep > 1 ? handlePrevious : undefined}
    >
      {/* Feedback de submissão */}
      {isSubmitting && (
        <div className="mb-6 p-4 bg-viverblue/10 border border-viverblue/20 rounded-lg">
          <div className="flex items-center justify-center gap-3 text-viverblue">
            <div className="w-5 h-5 border-2 border-viverblue border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Finalizando onboarding...</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
        {currentStep === 1 && <StepQuemEVoce {...stepProps} />}
        {currentStep === 2 && <StepComoNosConheceu {...stepProps} />}
        {currentStep === 3 && <StepObjetivosMetas {...stepProps} />}
      </div>
    </OnboardingLayout>
  );
};
