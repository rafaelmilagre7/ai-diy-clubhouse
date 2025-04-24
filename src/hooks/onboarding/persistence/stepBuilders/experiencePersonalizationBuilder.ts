
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeExperiencePersonalization } from "../utils/experiencePersonalizationNormalization";

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
  const existingExperiencePersonalization = normalizeExperiencePersonalization(
    progress?.experience_personalization || {}
  );
  
  console.log("Dados atuais de progresso:", existingExperiencePersonalization);
  
  // Verificar se estamos recebendo dados específicos de experience_personalization
  if (!data.experience_personalization && typeof data !== 'object') {
    console.warn("Nenhum dado específico de experience_personalization encontrado para atualização");
    return updateObj;
  }
  
  // Extrair dados de experience_personalization seja de data.experience_personalization ou do próprio data
  const experiencePersonalizationData = data.experience_personalization || data;
  
  // Normalizar os dados recebidos
  const normalizedData = normalizeExperiencePersonalization(experiencePersonalizationData);
  
  // Construir objeto de atualização mesclando os dados existentes com os novos
  updateObj.experience_personalization = {
    ...existingExperiencePersonalization,
    ...normalizedData
  };
  
  console.log("Objeto final de atualização para experience_personalization:", updateObj);
  
  return updateObj;
}
