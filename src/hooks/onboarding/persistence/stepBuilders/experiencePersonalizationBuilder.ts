
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildExperiencePersonalizationUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingExperiencePersonalization: any = {};
  
  // Verificar se temos dados válidos de progresso
  if (progress) {
    if (typeof progress.experience_personalization === 'string') {
      try {
        const trimmedValue = typeof progress.experience_personalization === 'string' && progress.experience_personalization.trim ? 
          progress.experience_personalization.trim() : 
          progress.experience_personalization;
          
        if (trimmedValue !== '') {
          existingExperiencePersonalization = JSON.parse(trimmedValue);
        }
      } catch (e) {
        console.error("Erro ao converter experience_personalization de string para objeto:", e);
      }
    } else if (progress.experience_personalization && typeof progress.experience_personalization === 'object') {
      existingExperiencePersonalization = progress.experience_personalization;
    }
  }
  
  // Inicializar o objeto de atualização com os dados existentes
  updateObj.experience_personalization = {...existingExperiencePersonalization};
  
  // Verificar se estamos recebendo dados diretos ou em um objeto aninhado
  const sourceData = data.experience_personalization || data;
  
  if (typeof sourceData === 'object' && sourceData !== null) {
    // Processar campos de array
    ['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'].forEach(field => {
      if (sourceData[field]) {
        const fieldValue = Array.isArray(sourceData[field]) ? 
          sourceData[field] : 
          [sourceData[field]].filter(Boolean);
          
        if (fieldValue.length > 0) {
          updateObj.experience_personalization[field] = fieldValue;
        }
      }
    });
    
    // Processar campo numérico
    if (sourceData.networking_availability !== undefined) {
      updateObj.experience_personalization.networking_availability = typeof sourceData.networking_availability === 'string' ? 
        parseInt(sourceData.networking_availability, 10) : 
        sourceData.networking_availability;
    }
  }
  
  console.log("Objeto de atualização para experience_personalization:", updateObj);
  
  return updateObj;
}
