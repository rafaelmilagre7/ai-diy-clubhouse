import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep1 } from '@/components/onboarding/steps/SimpleOnboardingStep1';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { DataRestoreNotification } from '@/components/onboarding/DataRestoreNotification';
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingStep1Page: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateData, saveAndNavigate, canAccessStep, isSaving, dataRestored } = useOnboarding();

  // Verificar se pode acessar esta etapa ou se deve redirecionar
  useEffect(() => {
    // Se o usuário já completou o onboarding, redirecionar para dashboard
    if (data.is_completed) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Se tem current_step válido e não é 1, redirecionar para o step correto
    if (data.current_step && data.current_step !== 1 && data.current_step <= 6) {
      navigate(`/onboarding/step/${data.current_step}`, { replace: true });
      return;
    }

    // Se não pode acessar step 1 e não está completo, algo está errado - redirecionar para início
    if (!canAccessStep(1) && !data.is_completed) {
      console.warn('[STEP1] Não pode acessar step 1, redirecionando para onboarding');
      navigate('/onboarding', { replace: true });
    }
  }, [data.is_completed, data.current_step, canAccessStep, navigate]);

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
    isLoading: isSaving,
    onDataChange: (stepData: any) => {
      // Auto-save contínuo quando dados mudarem
      updateData(stepData);
    }
  };

  return (
    <OnboardingLayout currentStep={1}>
      <DataRestoreNotification dataRestored={dataRestored} />
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