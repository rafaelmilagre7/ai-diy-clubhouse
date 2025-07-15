import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep6 } from '@/components/onboarding/steps/SimpleOnboardingStep6';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { DataRestoreNotification } from '@/components/onboarding/DataRestoreNotification';
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingStep6Page: React.FC = () => {
  const navigate = useNavigate();
  const { data, saveAndNavigate, canAccessStep, isSaving, dataRestored } = useOnboarding();

  // Verificar se pode acessar esta etapa
  useEffect(() => {
    // CORREÇÃO DO LOOP: Verificar apenas uma vez, sem dependência de canAccessStep
    const checkAccess = () => {
      if (data.is_completed) {
        console.log('[STEP6] Onboarding completo, redirecionando para dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }
      
      if (!canAccessStep(6)) {
        console.log('[STEP6] Sem acesso ao step 6, redirecionando para step 1');
        navigate('/onboarding/step/1', { replace: true });
      }
    };
    
    // Executar apenas se houver dados carregados
    if (data.user_id) {
      checkAccess();
    }
  }, [data.is_completed, data.user_id, navigate]); // Dependências estáveis, sem canAccessStep

  const handleNext = async (stepData?: any) => {
    console.log('➡️ [STEP6] handleNext chamado - Finalizando onboarding');
    
    const dataToSave = stepData || {
      personalization: data.personalization
    };
    
    // Step 6 finaliza o onboarding (targetStep = 7 vai completar)
    await saveAndNavigate(dataToSave, 6, 7);
  };

  const handlePrevious = () => {
    navigate('/onboarding/step/5');
  };

  const stepProps = {
    data,
    onNext: handleNext,
    isLoading: isSaving
  };

  return (
    <OnboardingLayout currentStep={6}>
      <DataRestoreNotification dataRestored={dataRestored} />
      <SimpleOnboardingStep6 {...stepProps} />
      
      {/* Navegação */}
      <div className="mt-8 pt-6 border-t">
        <SimpleStepNavigation
          currentStep={6}
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

export default OnboardingStep6Page;