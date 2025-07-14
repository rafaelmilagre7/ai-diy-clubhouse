import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep3 } from '@/components/onboarding/steps/SimpleOnboardingStep3';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingStep3Page: React.FC = () => {
  const navigate = useNavigate();
  const { data, saveAndNavigate, canAccessStep, isSaving } = useOnboarding();
  const stepRef = useRef<{ getData: () => any; isValid: () => boolean }>(null);

  // Verificar se pode acessar esta etapa
  useEffect(() => {
    if (!canAccessStep(3)) {
      navigate('/onboarding/step/1');
    }
  }, [canAccessStep, navigate]);

  const handleNext = async (stepData?: any) => {
    console.log('➡️ [STEP3] handleNext chamado com:', stepData);
    
    // Coletar dados do componente via ref se não fornecido
    const formData = stepData || stepRef.current?.getData();
    
    if (!formData) {
      console.error('❌ [STEP3] Dados não encontrados');
      return;
    }
    
    // Validar antes de salvar
    if (stepRef.current && !stepRef.current.isValid()) {
      console.warn('⚠️ [STEP3] Validação falhou');
      return;
    }
    
    await saveAndNavigate(formData, 3, 4);
  };

  const handlePrevious = () => {
    navigate('/onboarding/step/2');
  };

  const stepProps = {
    data,
    onNext: handleNext,
    isLoading: isSaving
  };
  
  const canGoNext = stepRef.current ? stepRef.current.isValid() : true;

  return (
    <OnboardingLayout currentStep={3}>
      <SimpleOnboardingStep3 ref={stepRef} {...stepProps} />
      
      {/* Navegação */}
      <div className="mt-8 pt-6 border-t">
        <SimpleStepNavigation
          currentStep={3}
          totalSteps={6}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onComplete={() => {}}
          canGoNext={canGoNext}
          canGoPrevious={true}
          isLoading={isSaving}
        />
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingStep3Page;