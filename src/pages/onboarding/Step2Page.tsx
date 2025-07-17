import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep2ValidationFixed } from '@/components/onboarding/steps/SimpleOnboardingStep2ValidationFixed';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { DataRestoreNotification } from '@/components/onboarding/DataRestoreNotification';
import { useSimpleOnboarding as useOnboarding } from '@/hooks/useSimpleOnboarding';

const OnboardingStep2Page: React.FC = () => {
  const navigate = useNavigate();
  const { data, saveAndNavigate, isSaving, updateData, dataRestored } = useOnboarding();
  const stepRef = useRef<{ getData: () => any; isValid: () => boolean }>(null);

  // Simplificado - apenas verificar se onboarding já foi completado
  useEffect(() => {
    if (isSaving) return;
    
    if (data.is_completed) {
      console.log('✅ [STEP2] Onboarding completo, redirecionando para dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [data.is_completed, navigate, isSaving]);

  const handleNext = async (stepData?: any) => {
    // 🎯 PROTEÇÃO: Evitar múltiplos cliques durante save
    if (isSaving) {
      console.log('⏸️ [STEP2] Save em andamento, ignorando clique');
      return;
    }
    
    console.log('➡️ [STEP2] handleNext chamado com:', stepData);
    
    // Coletar dados do componente via ref se não fornecido
    const formData = stepData || stepRef.current?.getData();
    
    if (!formData) {
      console.error('❌ [STEP2] Dados não encontrados');
      return;
    }
    
    // Validar antes de salvar (Skip validação para step 2 opcional)
    if (stepRef.current && !stepRef.current.isValid()) {
      console.warn('⚠️ [STEP2] Validação falhou - mas permitindo prosseguir (step opcional)');
      // Não retornar - permitir continuar mesmo com validação falha
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