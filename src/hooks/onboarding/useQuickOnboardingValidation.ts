
import { useCallback } from 'react';
import { useOnboardingUnified } from './useOnboardingUnified';

export const useQuickOnboardingValidation = () => {
  const { isOnboardingComplete, progress, data } = useOnboardingUnified();

  const validateOnboardingCompletion = useCallback(async (): Promise<boolean> => {
    console.log('🔍 Validando conclusão do onboarding...');
    
    // Verificar se há dados no quick onboarding
    const hasQuickOnboardingData = !!(
      data.name &&
      data.email &&
      data.company_name &&
      data.main_goal &&
      data.ai_knowledge_level
    );

    if (hasQuickOnboardingData) {
      console.log('✅ Quick onboarding completo encontrado');
      return true;
    }

    // Verificar dados do onboarding completo
    if (isOnboardingComplete) {
      console.log('✅ Onboarding completo encontrado');
      return true;
    }

    console.log('❌ Onboarding não está completo');
    console.log('Dados disponíveis:', { data, progress });
    
    return false;
  }, [isOnboardingComplete, progress, data]);

  return {
    validateOnboardingCompletion,
    isOnboardingComplete,
    hasValidData: isOnboardingComplete
  };
};
