
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  if (data.business_context) {
    const contextData = data.business_context;
    const existingContext = progress?.business_context || {};
    
    // Garantir que existingContext seja um objeto
    const baseContext = typeof existingContext === 'string' ? {} : existingContext;
    
    // Garantir que arrays sejam mantidos como arrays
    let formattedData = { ...contextData };
    
    ['business_challenges', 'short_term_goals', 'medium_term_goals', 'important_kpis'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    // Salvar em business_context
    updateObj.business_context = {
      ...baseContext,
      ...formattedData,
    };
  } else if (typeof data === 'object' && data !== null) {
    const existingContext = progress?.business_context || {};
    const baseContext = typeof existingContext === 'string' ? {} : existingContext;
    
    let formattedData = { ...data };
    
    ['business_challenges', 'short_term_goals', 'medium_term_goals', 'important_kpis'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    updateObj.business_context = {
      ...baseContext,
      ...formattedData,
    };
  }
  
  return updateObj;
}
