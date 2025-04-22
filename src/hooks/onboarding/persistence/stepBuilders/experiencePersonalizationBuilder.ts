import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildExperiencePersonalizationUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingExperiencePersonalization: any = progress?.experience_personalization || {};
  
  // Verificar se existingExperiencePersonalization é uma string
  if (typeof existingExperiencePersonalization === 'string') {
    try {
      // Garantir que seja uma string de fato antes de chamar trim
      const trimmedValue = typeof existingExperiencePersonalization === 'string' && existingExperiencePersonalization.trim 
        ? existingExperiencePersonalization.trim() 
        : existingExperiencePersonalization;
      
      if (trimmedValue !== '') {
        updateObj.experience_personalization = JSON.parse(trimmedValue);
      } else {
        updateObj.experience_personalization = {};
      }
    } catch (e) {
      console.error("Erro ao converter experience_personalization de string para objeto:", e);
      updateObj.experience_personalization = {};
    }
  } else {
    updateObj.experience_personalization = {...existingExperiencePersonalization};
  }
  
  if ((data as any).experience_personalization) {
    // Caso em que recebemos um objeto com a chave experience_personalization
    const epData = (data as any).experience_personalization;
    
    // Mesclar com os dados existentes
    updateObj.experience_personalization = {
      ...updateObj.experience_personalization,
      ...epData
    };
    
    // Garantir que arrays sejam tratados corretamente
    ['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'].forEach(field => {
      if (epData[field]) {
        if (!Array.isArray(epData[field]) && epData[field] !== null) {
          updateObj.experience_personalization[field] = [epData[field]];
        } else {
          updateObj.experience_personalization[field] = epData[field];
        }
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    // Caso em que recebemos dados diretos
    
    // Copiar campos relevantes para experience_personalization
    ['interests', 'time_preference', 'available_days', 'networking_availability', 
     'skills_to_share', 'mentorship_topics'].forEach(field => {
      if ((data as any)[field] !== undefined) {
        const value = (data as any)[field];
        
        // Garantir que campos que devem ser arrays sejam tratados corretamente
        if (['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'].includes(field) 
            && !Array.isArray(value) && value !== null && value !== undefined) {
          updateObj.experience_personalization[field] = [value];
        } else {
          updateObj.experience_personalization[field] = value;
        }
      }
    });
  }
  
  // Aplicar validações adicionais
  const ep = updateObj.experience_personalization;
  if (ep && ep.networking_availability !== undefined) {
    if (typeof ep.networking_availability === 'string') {
      ep.networking_availability = parseInt(ep.networking_availability, 10) || 0;
    }
    // Garantir que seja um número entre 0 e 10
    ep.networking_availability = Math.max(0, Math.min(10, ep.networking_availability || 0));
  }
  
  console.log("Objeto de atualização para experience_personalization:", updateObj);
  
  return updateObj;
}
