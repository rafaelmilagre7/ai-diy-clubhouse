import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep2 } from '@/components/onboarding/steps/SimpleOnboardingStep2';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingStep2Page: React.FC = () => {
  const navigate = useNavigate();
  const { data, saveAndNavigate, canAccessStep, isSaving } = useOnboarding();

  // Verificar se pode acessar esta etapa
  useEffect(() => {
    if (!canAccessStep(2)) {
      navigate('/onboarding/step/1');
    }
  }, [canAccessStep, navigate]);

  const handleNext = async (stepData?: any) => {
    console.log('➡️ [STEP2] handleNext chamado com:', stepData);
    
    const dataToSave = stepData || {
      business_info: data.business_info
    };
    
    await saveAndNavigate(dataToSave, 2, 3);
  };

  const handlePrevious = () => {
    navigate('/onboarding/step/1');
  };

  const stepProps = {
    data,
    onNext: handleNext,
    isLoading: isSaving
  };

  return (
    <OnboardingLayout currentStep={2}>
      <SimpleOnboardingStep2 {...stepProps} />
      
      {/* Navegação */}
      <div className="mt-8 pt-6 border-t">
        <SimpleStepNavigation
          currentStep={2}
          totalSteps={6}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onComplete={() => {}}
          canGoNext={true}
          canGoPrevious={true}
          isLoading={isSaving}
        />
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingStep2Page;