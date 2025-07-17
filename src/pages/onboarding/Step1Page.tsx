import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OnboardingLayout } from '@/components/layout/OnboardingLayout';
import { SimpleOnboardingStep1, Step1Ref } from '@/components/onboarding/steps/SimpleOnboardingStep1';
import { SimpleStepNavigation } from '@/components/onboarding/SimpleStepNavigation';
import { DataRestoreNotification } from '@/components/onboarding/DataRestoreNotification';
import { OnboardingDebugPanel } from '@/components/debug/OnboardingDebugPanel';
import { OnboardingSyncDebug } from '@/components/debug/OnboardingSyncDebug';
import { useSimpleOnboarding as useOnboarding } from '@/hooks/useSimpleOnboarding';

const OnboardingStep1Page: React.FC = () => {
  const navigate = useNavigate();
  const step1Ref = useRef<Step1Ref>(null);
  const { data, updateData, saveAndNavigate, isSaving, dataRestored } = useOnboarding();

  // Verificar se pode acessar esta etapa ou se deve redirecionar
  useEffect(() => {
    // Se o usuário já completou o onboarding, redirecionar para dashboard
    if (data.is_completed) {
      console.log('[STEP1] Onboarding já completo, redirecionando para dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }

    // CORREÇÃO DO LOOP: Não redirecionar automaticamente baseado em current_step
    // Deixar usuário navegar livremente entre steps já acessíveis
    console.log('[STEP1] Acesso permitido ao step 1', {
      current_step: data.current_step,
      is_completed: data.is_completed
    });
  }, [data.is_completed, navigate]); // Remover canAccessStep e current_step das dependências

  const handleNext = async () => {
    // 🎯 PROTEÇÃO: Evitar múltiplos cliques durante save
    if (isSaving) {
      console.log('⏸️ [STEP1-PAGE] Save em andamento, ignorando clique');
      return;
    }
    
    console.log('🔄 [STEP1-PAGE] Iniciando handleNext...');
    
    // Validar usando ref
    if (!step1Ref.current?.validate()) {
      console.log('❌ [STEP1-PAGE] Validação falhou');
      return;
    }
    
    const stepData = step1Ref.current?.getData();
    console.log('📋 [STEP1-PAGE] Dados do step 1:', stepData);
    
    try {
      const result = await saveAndNavigate(stepData, 1, 2);
      console.log('✅ [STEP1-PAGE] saveAndNavigate resultado:', result);
      
      if (result === false) {
        console.error('❌ [STEP1-PAGE] Falha ao salvar dados - não navegando');
        return;
      }
    } catch (error) {
      console.error('❌ [STEP1-PAGE] Erro em handleNext:', error);
      return;
    }
  };

  const handlePrevious = () => {
    // Etapa 1 não tem anterior - pode redirecionar para onde desejar
    navigate('/dashboard');
  };

  // Debounce onDataChange para evitar múltiplas atualizações
  const debouncedUpdateData = useCallback(
    debounce((stepData: any) => {
      updateData(stepData);
    }, 300),
    [updateData]
  );

  const stepProps = useMemo(() => ({
    data,
    onNext: handleNext,
    isLoading: isSaving,
    onDataChange: debouncedUpdateData
  }), [data, handleNext, isSaving, debouncedUpdateData]);

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
    <OnboardingLayout currentStep={1}>
      <DataRestoreNotification dataRestored={dataRestored} />
      <SimpleOnboardingStep1 ref={step1Ref} {...stepProps} />
      
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
      
      {/* Debug Panel */}
      <OnboardingDebugPanel 
        data={data} 
        isSaving={isSaving} 
        isLoading={false}
      />
      
      {/* Sincronização Debug */}
      <OnboardingSyncDebug />
    </OnboardingLayout>
  );
};

export default OnboardingStep1Page;