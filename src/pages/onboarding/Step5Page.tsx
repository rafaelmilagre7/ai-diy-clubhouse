import React, { useEffect, useRef, useMemo, useCallback } from 'react';
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

  // 🎯 CORREÇÃO PREVENTIVA: Verificar se pode acessar esta etapa com proteção contra reset
  useEffect(() => {
    // Prevenir execução durante operações de save
    if (isSaving) {
      console.log('⏸️ [STEP5] Pulando verificação de acesso durante save');
      return;
    }
    
    const checkAccess = () => {
      if (data.is_completed) {
        console.log('✅ [STEP5] Onboarding completo, redirecionando para dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }
      
      if (!canAccessStep(5)) {
        console.log('🔄 [STEP5] Sem acesso ao step 5, redirecionando para step 1');
        navigate('/onboarding/step/1', { replace: true });
      }
    };
    
    // Executar apenas se houver dados carregados e não estiver salvando
    if (data.user_id && !isSaving) {
      checkAccess();
    }
  }, [data.is_completed, data.user_id, navigate, isSaving]); // Incluir isSaving

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
    
    console.log('💾 [STEP5] Iniciando save operation...');
    const success = await saveAndNavigate(formData, 5, 6);
    
    // 🎯 CORREÇÃO PREVENTIVA: Garantir navegação robusta
    if (success) {
      console.log('✅ [STEP5] Save bem-sucedido, aplicando navegação com timeout');
      setTimeout(() => {
        navigate('/onboarding/step/6', { replace: true });
      }, 100);
    } else {
      console.error('❌ [STEP5] Falha no save, não navegando');
    }
  };

  const handlePrevious = () => {
    navigate('/onboarding/step/4');
  };

  // Debounce onDataChange para evitar múltiplas atualizações
  const debouncedUpdateData = useCallback(
    debounce((stepData: any) => {
      updateData({ personalization: stepData });
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
      console.warn('⚠️ [STEP5] Erro na validação:', error);
      return false;
    }
  }, [data?.personalization]); // Recalcular apenas quando personalization mudar

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