
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildExperiencePersonalizationUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  const existingExperiencePersonalization = progress?.experience_personalization || {};
  
  if ((data as any).experience_personalization) {
    // Caso em que recebemos um objeto com a chave experience_personalization
    updateObj.experience_personalization = {
      ...existingExperiencePersonalization,
      ...(data as any).experience_personalization
    };
    
    // Garantir que arrays sejam tratados corretamente
    const epData = (data as any).experience_personalization;
    ['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'].forEach(field => {
      if (epData[field] && !Array.isArray(epData[field])) {
        updateObj.experience_personalization[field] = [epData[field]];
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    // Caso em que recebemos dados diretos
    updateObj.experience_personalization = {
      ...existingExperiencePersonalization
    };
    
    // Copiar campos relevantes para experience_personalization
    ['interests', 'time_preference', 'available_days', 'networking_availability', 
     'skills_to_share', 'mentorship_topics'].forEach(field => {
      if ((data as any)[field] !== undefined) {
        const value = (data as any)[field];
        
        // Garantir que campos que devem ser arrays sejam tratados corretamente
        if (['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'].includes(field) 
            && !Array.isArray(value) && value !== null) {
          updateObj.experience_personalization[field] = [value];
        } else {
          updateObj.experience_personalization[field] = value;
        }
      }
    });
  }
  
  // Aplicar validações adicionais
  const ep = updateObj.experience_personalization;
  if (ep && ep.networking_availability !== undefined && typeof ep.networking_availability === 'string') {
    ep.networking_availability = parseInt(ep.networking_availability, 10) || 0;
  }
  
  return updateObj;
}
