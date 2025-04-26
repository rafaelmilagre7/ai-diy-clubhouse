
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
  
  // CORREÇÃO 1: Primeiro, verificar se experience_personalization existe no payload
  if (data.experience_personalization) {
    console.log("[buildExperiencePersonalizationUpdate] Dados específicos encontrados no payload:", data.experience_personalization);
    updateObj.experience_personalization = normalizeExperiencePersonalization({
      ...existingExperiencePersonalization,
      ...data.experience_personalization
    });
    return updateObj;
  }
  
  // CORREÇÃO 2: Verificar se os campos estão no nível raiz do objeto data
  const experienceFields = [
    'interests', 
    'time_preference', 
    'available_days', 
    'networking_availability', 
    'skills_to_share', 
    'mentorship_topics'
  ];
  
  const hasDirectFields = experienceFields.some(field => field in data);
  
  if (hasDirectFields) {
    console.log("[buildExperiencePersonalizationUpdate] Campos encontrados diretamente no payload");
    
    // Extrair os campos diretos para montar o objeto de experiência
    const experienceData: any = {};
    
    experienceFields.forEach(field => {
      if (field in data) {
        experienceData[field] = data[field as keyof typeof data];
      }
    });
    
    // Mesclar com dados existentes e normalizar
    updateObj.experience_personalization = normalizeExperiencePersonalization({
      ...existingExperiencePersonalization,
      ...experienceData
    });
    
    console.log("[buildExperiencePersonalizationUpdate] Objeto de atualização final:", updateObj);
    return updateObj;
  }
  
  // Se chegou aqui, não encontrou dados relevantes
  console.warn("[buildExperiencePersonalizationUpdate] Nenhum dado relevante encontrado para atualização");
  return updateObj;
}
