
import React from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { StepQuemEVoceNew } from '@/components/onboarding/modern/steps/StepQuemEVoceNew';
import { useSimpleOnboarding } from '@/hooks/onboarding/useSimpleOnboarding';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';

const NovoOnboardingNew = () => {
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
        navigate('/dashboard');
      }
    } else {
      await nextStep();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      previousStep();
    }
  };

  return (
    <OnboardingLayout
      title="Configure sua experiência"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="max-w-4xl mx-auto">
        <StepQuemEVoceNew
          data={data}
          onUpdate={updateField}
          onNext={handleNext}
          onPrevious={currentStep > 1 ? handlePrevious : undefined}
          canProceed={canProceed && !isSaving && !isCompleting}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
        
        {(isSaving || isCompleting) && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">
                {isCompleting ? 'Finalizando...' : 'Salvando...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default NovoOnboardingNew;
