import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep4 } from '@/components/onboarding/steps/SimpleOnboardingStep4';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingStep4Page: React.FC = () => {
  const navigate = useNavigate();
  const { data, saveAndNavigate, canAccessStep, isSaving } = useOnboarding();
  const stepRef = useRef<{ getData: () => any; isValid: () => boolean }>(null);

  // Verificar se pode acessar esta etapa
  useEffect(() => {
    if (!canAccessStep(4)) {
      navigate('/onboarding/step/1');
    }
  }, [canAccessStep, navigate]);

  const handleNext = async (stepData?: any) => {
    console.log('➡️ [STEP4] handleNext chamado com:', stepData);
    
    // Coletar dados do componente via ref se não fornecido
    const formData = stepData || stepRef.current?.getData();
    
    if (!formData) {
      console.error('❌ [STEP4] Dados não encontrados');
      return;
    }
    
    // Validar antes de salvar
    if (stepRef.current && !stepRef.current.isValid()) {
      console.warn('⚠️ [STEP4] Validação falhou');
      return;
    }
    
    await saveAndNavigate(formData, 4, 5);
  };

  const handlePrevious = () => {
    navigate('/onboarding/step/3');
  };

  const stepProps = {
    data,
    onNext: handleNext,
    isLoading: isSaving
  };
  
  const canGoNext = stepRef.current ? stepRef.current.isValid() : true;

  return (
    <OnboardingLayout currentStep={4}>
      <SimpleOnboardingStep4 ref={stepRef} {...stepProps} />
      
      {/* Navegação */}
      <div className="mt-8 pt-6 border-t">
        <SimpleStepNavigation
          currentStep={4}
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

export default OnboardingStep4Page;