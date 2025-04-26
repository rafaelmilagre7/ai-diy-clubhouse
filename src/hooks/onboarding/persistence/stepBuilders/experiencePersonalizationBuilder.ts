
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
  
  // VERIFICAÇÃO 1: verificar dados no formato esperado (com chave experience_personalization)
  if (data.experience_personalization) {
    console.log("[buildExperiencePersonalizationUpdate] Dados específicos encontrados no payload:", 
      typeof data.experience_personalization, data.experience_personalization);
    
    // Se for string, tenta converter para objeto
    let experienceData = data.experience_personalization;
    if (typeof experienceData === 'string') {
      try {
        experienceData = JSON.parse(experienceData);
        console.log("[buildExperiencePersonalizationUpdate] Dados convertidos de string para objeto:", experienceData);
      } catch (e) {
        console.error("[buildExperiencePersonalizationUpdate] Erro ao converter dados de string para objeto:", e);
      }
    }
    
    // Normalizar e mesclar com dados existentes
    updateObj.experience_personalization = normalizeExperiencePersonalization({
      ...existingExperiencePersonalization,
      ...experienceData
    });
    
    console.log("[buildExperiencePersonalizationUpdate] Objeto final de atualização:", updateObj);
    return updateObj;
  }
  
  // VERIFICAÇÃO 2: verificar se os campos específicos estão no nível raiz
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
