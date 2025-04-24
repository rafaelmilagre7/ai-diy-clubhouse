
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
  
  // CORREÇÃO: Verificar a estrutura dos dados recebidos
  // Se o payload já contém um objeto experience_personalization, usar diretamente
  if (data.experience_personalization) {
    console.log("[buildExperiencePersonalizationUpdate] Dados encontrados diretamente no payload:", data.experience_personalization);
    console.log("[buildExperiencePersonalizationUpdate] Tipo dos dados:", typeof data.experience_personalization);
    
    // Garantir normalização dos dados 
    const normalizedData = normalizeExperiencePersonalization(data.experience_personalization);
    updateObj.experience_personalization = normalizedData;
    console.log("[buildExperiencePersonalizationUpdate] Dados normalizados para atualização:", updateObj.experience_personalization);
    return updateObj;
  }
  
  // CORREÇÃO: Se não há dados específicos na estrutura esperada, verificar se os campos estão no nível raiz
  // Verificar se temos os campos esperados diretamente no objeto raiz
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
  
  // Se chegamos aqui, verificar se o objeto data é ele mesmo dados de personalização de experiência
  // (ou seja, o objeto root já é o que esperamos)
  if (experienceFields.some(field => field in data)) {
    console.log("[buildExperiencePersonalizationUpdate] Objeto raiz parece ser dados de personalização");
    
    // Normalizar e mesclar com os dados existentes
    const normalizedData = normalizeExperiencePersonalization({
      ...existingExperiencePersonalization,
      ...data
    });
    
    updateObj.experience_personalization = normalizedData;
    console.log("[buildExperiencePersonalizationUpdate] Dados finais da atualização (de objeto raiz):", updateObj.experience_personalization);
    return updateObj;
  }
  
  // Se chegamos aqui, não encontramos dados válidos para atualizar
  console.warn("[buildExperiencePersonalizationUpdate] Nenhum dado específico encontrado para atualização");
  return updateObj;
}
