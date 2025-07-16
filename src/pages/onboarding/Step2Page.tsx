import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep2ValidationFixed } from '@/components/onboarding/steps/SimpleOnboardingStep2ValidationFixed';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { DataRestoreNotification } from '@/components/onboarding/DataRestoreNotification';
import { useCleanOnboarding as useOnboarding } from '@/hooks/useCleanOnboarding';

const OnboardingStep2Page: React.FC = () => {
  const navigate = useNavigate();
  const { data, saveAndNavigate, canAccessStep, isSaving, updateData, dataRestored } = useOnboarding();
  const stepRef = useRef<{ getData: () => any; isValid: () => boolean }>(null);

  // 🎯 CORREÇÃO PREVENTIVA: Verificar se pode acessar esta etapa com proteção contra reset
  useEffect(() => {
    // Prevenir execução durante operações de save
    if (isSaving) {
      console.log('⏸️ [STEP2] Pulando verificação de acesso durante save');
      return;
    }
    
    const checkAccess = () => {
      if (data.is_completed) {
        console.log('✅ [STEP2] Onboarding completo, redirecionando para dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }
      
      if (!canAccessStep(2)) {
        console.log('🔄 [STEP2] Sem acesso ao step 2, redirecionando para step 1');
        navigate('/onboarding/step/1', { replace: true });
      }
    };
    
    // Executar apenas se houver dados carregados e não estiver salvando
    if (data.user_id && !isSaving) {
      checkAccess();
    }
  }, [data.is_completed, data.user_id, navigate, isSaving]); // Incluir isSaving

  const handleNext = async (stepData?: any) => {
    console.log('➡️ [STEP2] handleNext chamado com:', stepData);
    
    // Coletar dados do componente via ref se não fornecido
    const formData = stepData || stepRef.current?.getData();
    
    if (!formData) {
      console.error('❌ [STEP2] Dados não encontrados');
      return;
    }
    
    // Validar antes de salvar
    if (stepRef.current && !stepRef.current.isValid()) {
      console.warn('⚠️ [STEP2] Validação falhou');
      return;
    }
    
    console.log('💾 [STEP2] Iniciando save operation...');
    const success = await saveAndNavigate(formData, 2, 3);
    
    // FASE 3 CORREÇÃO: Navegação baseada apenas em sucesso real
    if (!success) {
      console.error('❌ [STEP2] Falha no save, não navegando');
      return;
    }
    
    console.log('✅ [STEP2] Save bem-sucedido, navegação será feita pelo hook');
  };

  const handlePrevious = () => {
    navigate('/onboarding/step/1');
  };

  // Debounce onDataChange para evitar múltiplas atualizações
  const debouncedUpdateData = useCallback(
    debounce((stepData: any) => {
      updateData({ business_info: stepData });
    }, 300),
    [updateData]
  );

  const stepProps = useMemo(() => ({
    data,
    onNext: handleNext,
    isLoading: isSaving,
    onDataChange: debouncedUpdateData
  }), [data, handleNext, isSaving, debouncedUpdateData]);
  
  // Step 2 é opcional, sempre permite avançar
  const canGoNext = useMemo(() => {
    // Step 2 sempre válido (informações opcionais da empresa)
    console.log('🔍 [STEP2] Verificando canGoNext - Step 2 é sempre válido');
    return true;
  }, []); // Sem dependências - sempre true

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
    <OnboardingLayout currentStep={2}>
      <DataRestoreNotification dataRestored={dataRestored} />
      <SimpleOnboardingStep2ValidationFixed ref={stepRef} {...stepProps} />
      
      {/* Navegação */}
      <div className="mt-8 pt-6 border-t">
        <SimpleStepNavigation
          currentStep={2}
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

export default OnboardingStep2Page;