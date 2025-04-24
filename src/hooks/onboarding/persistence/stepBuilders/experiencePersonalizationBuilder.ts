
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeExperiencePersonalization } from "../utils/experiencePersonalizationNormalization";

/**
 * Constrói o objeto de atualização para a personalização da experiência
 */
export function buildExperiencePersonalizationUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Log para debug
  console.log("[buildExperiencePersonalizationUpdate] Construindo atualização com dados:", data);
  
  // Verificações iniciais
  if (!data) {
    console.warn("[buildExperiencePersonalizationUpdate] Dados vazios recebidos");
    return updateObj;
  }
  
  // Garantir base consistente para os dados
  const existingExperiencePersonalization = normalizeExperiencePersonalization(
    progress?.experience_personalization || {}
  );
  
  console.log("[buildExperiencePersonalizationUpdate] Dados atuais de progresso:", existingExperiencePersonalization);
  
  // CORREÇÃO: Primeiro, verificar se o payload contém dados específicos para experience_personalization
  if (data.experience_personalization) {
    console.log("[buildExperiencePersonalizationUpdate] Dados encontrados diretamente no payload:", 
      typeof data.experience_personalization, data.experience_personalization);
    
    // Verificar se é uma string e tentar parseá-la
    if (typeof data.experience_personalization === 'string') {
      try {
        const parsedData = JSON.parse(data.experience_personalization);
        updateObj.experience_personalization = normalizeExperiencePersonalization(parsedData);
      } catch (error) {
        console.error("[buildExperiencePersonalizationUpdate] Erro ao parsear string:", error);
        updateObj.experience_personalization = normalizeExperiencePersonalization(data.experience_personalization);
      }
    } else {
      // Já é um objeto, normalizar diretamente
      updateObj.experience_personalization = normalizeExperiencePersonalization(data.experience_personalization);
    }
    
    console.log("[buildExperiencePersonalizationUpdate] Dados normalizados para atualização:", 
      updateObj.experience_personalization);
    return updateObj;
  }
  
  // CORREÇÃO: Verificar se há campos esperados diretamente no objeto raiz
  const experienceFields = [
    'interests', 
    'time_preference', 
    'available_days', 
    'networking_availability', 
    'skills_to_share', 
    'mentorship_topics'
  ];
  
  // Verificar se pelo menos um campo esperado existe no nível raiz
  const hasRootFields = experienceFields.some(field => field in data);
  
  if (hasRootFields) {
    console.log("[buildExperiencePersonalizationUpdate] Campos encontrados no nível raiz");
    
    // Construir objeto com os campos encontrados
    const experienceData: any = {};
    
    experienceFields.forEach(field => {
      if (field in data) {
        experienceData[field] = data[field as keyof typeof data];
      }
    });
    
    console.log("[buildExperiencePersonalizationUpdate] Dados extraídos do nível raiz:", experienceData);
    
    // Normalizar e mesclar com os dados existentes
    const normalizedData = normalizeExperiencePersonalization({
      ...existingExperiencePersonalization,
      ...experienceData
    });
    
    updateObj.experience_personalization = normalizedData;
    console.log("[buildExperiencePersonalizationUpdate] Dados finais para atualização:", updateObj.experience_personalization);
    return updateObj;
  }
  
  // NOVA CORREÇÃO: Se o payload é o próprio objeto de dados
  // Verificar se o próprio data já parece ser o objeto experience_personalization
  const isExperienceData = experienceFields.some(field => field in data);
  if (isExperienceData) {
    console.log("[buildExperiencePersonalizationUpdate] O payload parece ser diretamente o objeto de personalização");
    
    const normalizedData = normalizeExperiencePersonalization({
      ...existingExperiencePersonalization,
      ...data
    });
    
    updateObj.experience_personalization = normalizedData;
    console.log("[buildExperiencePersonalizationUpdate] Dados finais após normalização:", updateObj.experience_personalization);
    return updateObj;
  }
  
  // Se chegamos aqui, não encontramos dados válidos para atualizar
  console.warn("[buildExperiencePersonalizationUpdate] Nenhum dado específico encontrado para atualização");
  return updateObj;
}
