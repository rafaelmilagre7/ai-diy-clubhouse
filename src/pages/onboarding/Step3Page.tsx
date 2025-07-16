import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep3 } from '@/components/onboarding/steps/SimpleOnboardingStep3';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { DataRestoreNotification } from '@/components/onboarding/DataRestoreNotification';
import { useCleanOnboarding as useOnboarding } from '@/hooks/useCleanOnboarding';

const OnboardingStep3Page: React.FC = () => {
  const navigate = useNavigate();
  const { data, saveAndNavigate, canAccessStep, isSaving, updateData, dataRestored } = useOnboarding();
  const stepRef = useRef<{ getData: () => any; isValid: () => boolean }>(null);

  // 🎯 CORREÇÃO PREVENTIVA: Verificar se pode acessar esta etapa com proteção contra reset
  useEffect(() => {
    // Prevenir execução durante operações de save
    if (isSaving) {
      console.log('⏸️ [STEP3] Pulando verificação de acesso durante save');
      return;
    }
    
    const checkAccess = () => {
      if (data.is_completed) {
        console.log('✅ [STEP3] Onboarding completo, redirecionando para dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }
      
      if (!canAccessStep(3)) {
        console.log('🔄 [STEP3] Sem acesso ao step 3, redirecionando para step 1');
        navigate('/onboarding/step/1', { replace: true });
      }
    };
    
    // Executar apenas se houver dados carregados e não estiver salvando
    if (data.user_id && !isSaving) {
      checkAccess();
    }
  }, [data.is_completed, data.user_id, navigate, isSaving]); // Incluir isSaving

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
    
    console.log('💾 [STEP3] Iniciando save operation...');
    const success = await saveAndNavigate(formData, 3, 4);
    
    // FASE 3 CORREÇÃO: Navegação baseada apenas em sucesso real
    if (!success) {
      console.error('❌ [STEP3] Falha no save, não navegando');
      return;
    }
    
    console.log('✅ [STEP3] Save bem-sucedido, navegação será feita pelo hook');
  };

  const handlePrevious = () => {
    navigate('/onboarding/step/2');
  };

  // Debounce onDataChange para evitar múltiplas atualizações
  const debouncedUpdateData = useCallback(
    debounce((stepData: any) => {
      updateData({ ai_experience: stepData });
    }, 300),
    [updateData]
  );

  const stepProps = useMemo(() => ({
    data,
    onNext: handleNext,
    isLoading: isSaving,
    onDataChange: debouncedUpdateData
  }), [data, handleNext, isSaving, debouncedUpdateData]);
  
  // Memoizar canGoNext para evitar recálculos constantes
  const canGoNext = useMemo(() => {
    if (!stepRef.current) return false;
    try {
      return stepRef.current.isValid();
    } catch (error) {
      console.warn('⚠️ [STEP3] Erro na validação:', error);
      return false;
    }
  }, [data?.ai_experience]); // Recalcular apenas quando ai_experience mudar

// Função de debounce simples
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

  return (
    <OnboardingLayout currentStep={3}>
      <DataRestoreNotification dataRestored={dataRestored} />
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