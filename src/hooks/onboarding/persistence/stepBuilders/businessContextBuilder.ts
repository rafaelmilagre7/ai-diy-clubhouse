
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  if (data.business_context) {
    const contextData = data.business_context;
    const existingBusinessData = progress?.business_data || {};
    
    // Salvar tanto em business_data (coluna existente na tabela) quanto em business_context (para compatibilidade)
    updateObj.business_data = {
      ...existingBusinessData,
      ...contextData,
    };
    
    // Para compatibilidade futura também mantemos em business_context, se este campo existir no banco
    if (progress?.hasOwnProperty('business_context')) {
      const existingContextData = progress?.business_context || {};
      updateObj.business_context = {
        ...existingContextData,
        ...contextData,
      };
    }
  } else if (typeof data === 'object' && data !== null) {
    // Caso os dados venham diretamente sem o campo business_context
    const existingBusinessData = progress?.business_data || {};
    updateObj.business_data = {
      ...existingBusinessData,
      ...data,
    };
    
    // Para compatibilidade futura
    if (progress?.hasOwnProperty('business_context')) {
      const existingContextData = progress?.business_context || {};
      updateObj.business_context = {
        ...existingContextData,
        ...data,
      };
    }
  }
  
  return updateObj;
}
