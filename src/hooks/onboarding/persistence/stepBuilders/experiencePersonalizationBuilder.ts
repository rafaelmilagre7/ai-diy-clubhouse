
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Constrói o objeto de atualização para a personalização da experiência
 */
export function buildExperiencePersonalizationUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Log para debug
  console.log("Construindo atualização para experience_personalization com dados:", data);
  
  // Verificações iniciais
  if (!data) {
    console.warn("Dados vazios recebidos em buildExperiencePersonalizationUpdate");
    return updateObj;
  }
  
  // Garantir base consistente para os dados
  let existingExperiencePersonalization: Record<string, any> = {
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: 5,
    skills_to_share: [],
    mentorship_topics: []
  };
  
  // Verificar se temos dados de progresso válidos e extrair dados existentes
  if (progress && progress.experience_personalization) {
    if (typeof progress.experience_personalization === 'string') {
      try {
        existingExperiencePersonalization = {
          ...existingExperiencePersonalization,
          ...JSON.parse(progress.experience_personalization as string)
        };
      } catch (e) {
        console.error("Erro ao converter experience_personalization de string para objeto:", e);
      }
    } else if (typeof progress.experience_personalization === 'object') {
      existingExperiencePersonalization = {
        ...existingExperiencePersonalization,
        ...progress.experience_personalization
      };
    }
  }
  
  console.log("Dados atuais de progresso:", existingExperiencePersonalization);
  
  // Verificar se estamos recebendo dados específicos de experience_personalization ou são dados aninhados
  const experiencePersonalizationData = data.experience_personalization || {};
  
  // Se não tivermos dados específicos, não fazer atualização
  if (Object.keys(experiencePersonalizationData).length === 0) {
    console.warn("Nenhum dado específico de experience_personalization encontrado para atualização");
    return updateObj;
  }
  
  // Construir objeto de atualização
  updateObj.experience_personalization = {
    ...existingExperiencePersonalization,
    ...experiencePersonalizationData
  };
  
  // Garantir que campos de array sejam arrays
  const arrayFields = ['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'];
  
  arrayFields.forEach(field => {
    if (updateObj.experience_personalization[field] && !Array.isArray(updateObj.experience_personalization[field])) {
      updateObj.experience_personalization[field] = 
        [updateObj.experience_personalization[field]].filter(Boolean);
    }
    if (!updateObj.experience_personalization[field]) {
      updateObj.experience_personalization[field] = [];
    }
  });
  
  // Converter networking_availability para número
  if (updateObj.experience_personalization.networking_availability !== undefined) {
    updateObj.experience_personalization.networking_availability = 
      Number(updateObj.experience_personalization.networking_availability);
  }
  
  console.log("Objeto final de atualização para experience_personalization:", updateObj);
  
  return updateObj;
}
