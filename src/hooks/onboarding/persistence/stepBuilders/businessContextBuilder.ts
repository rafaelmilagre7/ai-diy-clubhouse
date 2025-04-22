
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  if (data.business_context) {
    const contextData = data.business_context;
    const existingBusinessData = progress?.business_data || {};
    
    // Salvar apenas em business_data, que é o campo que existe na tabela
    updateObj.business_data = {
      ...existingBusinessData,
      ...contextData,
    };
  } else if (typeof data === 'object' && data !== null) {
    const existingBusinessData = progress?.business_data || {};
    updateObj.business_data = {
      ...existingBusinessData,
      ...data,
    };
  }
  return updateObj;
}
