
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeExperiencePersonalization } from "../utils/experiencePersonalizationNormalization";

/**
 * Constrói o objeto de atualização para a personalização da experiência
 */
export function buildExperiencePersonalizationUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Log para debug
  console.log("[buildExperiencePersonalizationBuilder] Dados recebidos:", data);
  
  // Verificações iniciais
  if (!data) {
    console.warn("[buildExperiencePersonalizationBuilder] Dados vazios recebidos");
    return updateObj;
  }
  
  // Garantir base consistente para os dados
  const existingExperiencePersonalization = normalizeExperiencePersonalization(
    progress?.experience_personalization || {}
  );
  
  console.log("[buildExperiencePersonalizationBuilder] Dados atuais:", existingExperiencePersonalization);
  
  // VERIFICAÇÃO 1: verificar dados no formato esperado (com chave experience_personalization)
  if (data.experience_personalization) {
    console.log("[buildExperiencePersonalizationBuilder] Dados encontrados com chave 'experience_personalization':", 
      typeof data.experience_personalization);
    
    // Se for string, tenta converter para objeto
    let experienceData = data.experience_personalization;
    if (typeof experienceData === 'string') {
      try {
        experienceData = JSON.parse(experienceData);
        console.log("[buildExperiencePersonalizationBuilder] Dados convertidos de string para objeto");
      } catch (e) {
        console.error("[buildExperiencePersonalizationBuilder] Erro ao converter string:", e);
      }
    }
    
    // Normalizar e mesclar com dados existentes
    updateObj.experience_personalization = normalizeExperiencePersonalization({
      ...existingExperiencePersonalization,
      ...experienceData
    });
    
    console.log("[buildExperiencePersonalizationBuilder] Objeto atualizado:", updateObj);
    return updateObj;
  }
  
  // VERIFICAÇÃO 2: verificar se os campos específicos estão no nível raiz
  const experienceFields = [
    'interests', 
    'preferred_times', 
    'days_available', 
    'networking_level', 
    'shareable_skills', 
    'mentorship_topics'
  ];
  
  const hasDirectFields = experienceFields.some(field => field in data);
  
  if (hasDirectFields) {
    console.log("[buildExperiencePersonalizationBuilder] Campos encontrados no nível raiz");
    
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
    
    console.log("[buildExperiencePersonalizationBuilder] Objeto final com campos diretos:", updateObj);
    return updateObj;
  }
  
  // Se chegou aqui, não encontrou dados relevantes
  console.warn("[buildExperiencePersonalizationBuilder] Nenhum dado relevante encontrado para atualização");
  return updateObj;
}
