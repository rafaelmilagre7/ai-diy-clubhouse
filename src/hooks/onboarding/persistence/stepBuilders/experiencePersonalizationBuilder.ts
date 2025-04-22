
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildExperiencePersonalizationUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingExperiencePersonalization: any = {};
  
  // Verificar se temos dados válidos de progresso
  if (progress) {
    if (typeof progress.experience_personalization === 'string') {
      try {
        // Verificar se é uma string válida antes de tentar trim
        const stringValue = String(progress.experience_personalization);
        const trimmedValue = stringValue && typeof stringValue.trim === 'function' ? 
          stringValue.trim() : 
          stringValue;
          
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
      if (field in sourceData && sourceData[field as keyof typeof sourceData]) {
        const fieldValue = Array.isArray(sourceData[field as keyof typeof sourceData]) ? 
          sourceData[field as keyof typeof sourceData] : 
          [sourceData[field as keyof typeof sourceData]].filter(Boolean);
          
        if (fieldValue.length > 0) {
          updateObj.experience_personalization[field] = fieldValue;
        }
      }
    });
    
    // Processar campo numérico
    if ('networking_availability' in sourceData && sourceData.networking_availability !== undefined) {
      updateObj.experience_personalization.networking_availability = typeof sourceData.networking_availability === 'string' ? 
        parseInt(sourceData.networking_availability, 10) : 
        sourceData.networking_availability;
    }
  }
  
  console.log("Objeto de atualização para experience_personalization:", updateObj);
  
  return updateObj;
}
