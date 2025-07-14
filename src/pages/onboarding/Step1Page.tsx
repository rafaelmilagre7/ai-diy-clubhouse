import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep1 } from '@/components/onboarding/steps/SimpleOnboardingStep1';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingStep1Page: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateData, saveAndNavigate, canAccessStep, isSaving } = useOnboarding();

  // Verificar se pode acessar esta etapa
  useEffect(() => {
    if (!canAccessStep(1)) {
      navigate('/onboarding/step/1');
    }
  }, [canAccessStep, navigate]);

  const handleNext = async (stepData?: any) => {
    console.log('➡️ [STEP1] handleNext chamado com:', stepData);
    
    // Se não fornecido stepData, usar dados atuais
    const dataToSave = stepData || {
      personal_info: data.personal_info,
      location_info: data.location_info
    };
    
    await saveAndNavigate(dataToSave, 1, 2);
  };

  const handlePrevious = () => {
    // Etapa 1 não tem anterior - pode redirecionar para onde desejar
    navigate('/dashboard');
  };

  const stepProps = {
    data,
    onNext: handleNext,
    isLoading: isSaving
  };

  return (
    <OnboardingLayout currentStep={1}>
      <SimpleOnboardingStep1 {...stepProps} />
      
      {/* Navegação */}
      <div className="mt-8 pt-6 border-t">
        <SimpleStepNavigation
          currentStep={1}
          totalSteps={6}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onComplete={() => {}}
          canGoNext={true}
          canGoPrevious={false} // Primeira etapa
          isLoading={isSaving}
        />
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingStep1Page;