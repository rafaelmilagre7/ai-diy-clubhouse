
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
  
  // CORREÇÃO: Melhor detecção do formato de dados enviados
  // Se o payload já contém um objeto experience_personalization, usar diretamente
  if (data.experience_personalization) {
    console.log("Dados de experience_personalization encontrados diretamente no payload:", data.experience_personalization);
    console.log("Tipo dos dados:", typeof data.experience_personalization);
    
    // CORREÇÃO: Garantir normalização dos dados 
    updateObj.experience_personalization = normalizeExperiencePersonalization(data.experience_personalization);
    console.log("Dados normalizados para atualização:", updateObj.experience_personalization);
    return updateObj;
  }
  
  // Se não há dados específicos na estrutura esperada, verificar se os campos estão no nível raiz
  const experienceFields = ['interests', 'time_preference', 'available_days', 
                           'networking_availability', 'skills_to_share', 'mentorship_topics'];
  
  // Verificar se pelo menos um campo existe no nível raiz
  const hasRootFields = experienceFields.some(field => field in data);
  
  if (hasRootFields) {
    console.log("Campos de experience_personalization encontrados no nível raiz");
    // Construir objeto com os campos encontrados no nível raiz
    const experienceData: any = {};
    
    experienceFields.forEach(field => {
      if (field in data) {
        experienceData[field] = data[field as keyof typeof data];
      }
    });
    
    // Normalizar e mesclar com os dados existentes
    updateObj.experience_personalization = {
      ...existingExperiencePersonalization,
      ...normalizeExperiencePersonalization(experienceData)
    };
    
    return updateObj;
  }
  
  // Se chegamos aqui, não encontramos dados válidos para atualizar
  console.warn("Nenhum dado específico de experience_personalization encontrado para atualização");
  return updateObj;
}
