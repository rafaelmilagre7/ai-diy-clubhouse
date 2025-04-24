
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
  let existingExperiencePersonalization = normalizeExperiencePersonalization(
    progress?.experience_personalization || {}
  );
  
  console.log("Dados atuais de progresso:", existingExperiencePersonalization);
  
  // Verificar se estamos recebendo dados específicos de experience_personalization ou são dados aninhados
  const experiencePersonalizationData = data.experience_personalization || {};
  
  // Se não tivermos dados específicos, não fazer atualização
  if (Object.keys(experiencePersonalizationData).length === 0) {
    console.warn("Nenhum dado específico de experience_personalization encontrado para atualização");
    return updateObj;
  }
  
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
