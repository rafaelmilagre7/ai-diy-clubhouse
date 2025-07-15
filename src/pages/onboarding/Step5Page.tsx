import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep5 } from '@/components/onboarding/steps/SimpleOnboardingStep5';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { DataRestoreNotification } from '@/components/onboarding/DataRestoreNotification';
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingStep5Page: React.FC = () => {
  const navigate = useNavigate();
  const { data, saveAndNavigate, canAccessStep, isSaving, updateData, dataRestored } = useOnboarding();
  const stepRef = useRef<{ getData: () => any; isValid: () => boolean }>(null);

  // Verificar se pode acessar esta etapa
  useEffect(() => {
    if (!canAccessStep(5)) {
      navigate('/onboarding/step/1');
    }
  }, [canAccessStep, navigate]);

  const handleNext = async (stepData?: any) => {
    console.log('➡️ [STEP5] handleNext chamado com:', stepData);
    
    // Coletar dados do componente via ref se não fornecido
    const formData = stepData || stepRef.current?.getData();
    
    if (!formData) {
      console.error('❌ [STEP5] Dados não encontrados');
      return;
    }
    
    // Validar antes de salvar
    if (stepRef.current && !stepRef.current.isValid()) {
      console.warn('⚠️ [STEP5] Validação falhou');
      return;
    }
    
    await saveAndNavigate(formData, 5, 6);
  };

  const handlePrevious = () => {
    navigate('/onboarding/step/4');
  };

  const stepProps = {
    data,
    onNext: handleNext,
    isLoading: isSaving,
    onDataChange: (stepData: any) => {
      // Auto-save contínuo quando dados mudarem
      updateData({ personalization: stepData });
    }
  };
  
  const canGoNext = stepRef.current ? stepRef.current.isValid() : true;

  return (
    <OnboardingLayout currentStep={5}>
      <DataRestoreNotification dataRestored={dataRestored} />
      <SimpleOnboardingStep5 ref={stepRef} {...stepProps} />
      
      {/* Navegação */}
      <div className="mt-8 pt-6 border-t">
        <SimpleStepNavigation
          currentStep={5}
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

export default OnboardingStep5Page;