
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  if (data.business_context) {
    const contextData = data.business_context;
    const existingBusinessData = progress?.business_data || {};
    
    // Garantir que existingBusinessData seja um objeto
    const baseBusinessData = typeof existingBusinessData === 'string' ? {} : existingBusinessData;
    
    // Garantir que arrays sejam mantidos como arrays
    let formattedData = { ...contextData };
    
    // Garantir que arrays permaneçam como arrays
    ['business_challenges', 'short_term_goals', 'medium_term_goals', 'important_kpis'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    // Salvar apenas em business_data (coluna existente na tabela)
    updateObj.business_data = {
      ...baseBusinessData,
      ...formattedData,
    };
  } else if (typeof data === 'object' && data !== null) {
    // Caso os dados venham diretamente sem o campo business_context
    const existingBusinessData = progress?.business_data || {};
    
    // Garantir que existingBusinessData seja um objeto
    const baseBusinessData = typeof existingBusinessData === 'string' ? {} : existingBusinessData;
    
    let formattedData = { ...data };
    
    // Garantir que arrays permaneçam como arrays
    ['business_challenges', 'short_term_goals', 'medium_term_goals', 'important_kpis'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    updateObj.business_data = {
      ...baseBusinessData,
      ...formattedData,
    };
  }
  
  return updateObj;
}
