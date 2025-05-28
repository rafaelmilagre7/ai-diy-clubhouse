
import { useCallback } from 'react';
import { useOnboardingUnified } from './useOnboardingUnified';

export const useQuickOnboardingValidation = () => {
  const { data, hasExistingData } = useOnboardingUnified();

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

    // Verificar dados existentes
    if (hasExistingData) {
      console.log('✅ Dados existentes encontrados');
      return true;
    }

    console.log('❌ Onboarding não está completo');
    console.log('Dados disponíveis:', { data, hasExistingData });
    
    return false;
  }, [data, hasExistingData]);

  return {
    validateOnboardingCompletion,
    isOnboardingComplete: hasExistingData,
    hasValidData: hasExistingData
  };
};
