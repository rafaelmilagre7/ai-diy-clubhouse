
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
    
    // IMPORTANTE: Usar a função de normalização para garantir formato consistente
    const normalizedNewData = normalizeExperiencePersonalization(experienceData);
    
    // Mesclar com dados existentes e normalizar novamente
    updateObj.experience_personalization = {
      ...existingExperiencePersonalization,
      ...normalizedNewData
    };
    
    // Adicionar campos compatíveis nos formatos antigos
    if (normalizedNewData.days_available && normalizedNewData.days_available.length > 0) {
      updateObj.experience_personalization.available_days = normalizedNewData.days_available;
    }
    
    if (normalizedNewData.preferred_times && normalizedNewData.preferred_times.length > 0) {
      updateObj.experience_personalization.time_preference = normalizedNewData.preferred_times;
    }
    
    if (typeof normalizedNewData.networking_level === 'number') {
      updateObj.experience_personalization.networking_availability = normalizedNewData.networking_level;
    }
    
    if (normalizedNewData.shareable_skills && normalizedNewData.shareable_skills.length > 0) {
      updateObj.experience_personalization.skills_to_share = normalizedNewData.shareable_skills;
    }
    
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
    'mentorship_topics',
    // Campos no formato antigo
    'time_preference',
    'available_days',
    'networking_availability',
    'skills_to_share'
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
    
    // Normalizar antes de mesclar para garantir formato correto
    const normalizedDirectData = normalizeExperiencePersonalization(experienceData);
    
    // Mesclar com dados existentes
    updateObj.experience_personalization = {
      ...existingExperiencePersonalization,
      ...normalizedDirectData
    };
    
    // Adicionar versões paralelas para compatibilidade
    if (normalizedDirectData.days_available && normalizedDirectData.days_available.length > 0) {
      updateObj.experience_personalization.available_days = normalizedDirectData.days_available;
    }
    
    if (normalizedDirectData.preferred_times && normalizedDirectData.preferred_times.length > 0) {
      updateObj.experience_personalization.time_preference = normalizedDirectData.preferred_times;
    }
    
    if (typeof normalizedDirectData.networking_level === 'number') {
      updateObj.experience_personalization.networking_availability = normalizedDirectData.networking_level;
    }
    
    if (normalizedDirectData.shareable_skills && normalizedDirectData.shareable_skills.length > 0) {
      updateObj.experience_personalization.skills_to_share = normalizedDirectData.shareable_skills;
    }
    
    console.log("[buildExperiencePersonalizationBuilder] Objeto final com campos diretos:", updateObj);
    return updateObj;
  }
  
  // Se chegou aqui, não encontrou dados relevantes
  console.warn("[buildExperiencePersonalizationBuilder] Nenhum dado relevante encontrado para atualização");
  return updateObj;
}
