
import { OnboardingProgress } from "@/types/onboarding";

/**
 * Normaliza a resposta do progresso de onboarding, garantindo consistência nos dados
 */
export const normalizeOnboardingResponse = (rawData: any): OnboardingProgress => {
  // Garantir que temos um objeto não-nulo
  if (!rawData) {
    console.error("[ERRO] Tentativa de normalizar dados nulos");
    return {} as OnboardingProgress;
  }
  
  // Garantir que campos de objeto JSON estão no formato correto
  const normalizedData = {
    ...rawData,
    personal_info: ensureJsonObject(rawData.personal_info),
    professional_info: ensureJsonObject(rawData.professional_info),
    business_context: ensureJsonObject(rawData.business_context),
    business_goals: ensureJsonObject(rawData.business_goals),
    ai_experience: ensureJsonObject(rawData.ai_experience),
    experience_personalization: ensureJsonObject(rawData.experience_personalization),
    complementary_info: ensureJsonObject(rawData.complementary_info),
    formation_data: ensureJsonObject(rawData.formation_data),
    debug_logs: ensureJsonArray(rawData.debug_logs)
  };
  
  // Garantir que completed_steps é sempre um array
  if (!Array.isArray(normalizedData.completed_steps)) {
    normalizedData.completed_steps = [];
  }
  
  // Sincronizar campos top-level e campos no objeto JSON
  if (normalizedData.professional_info) {
    // Garantir que os campos de company_* estejam tanto no objeto professional_info quanto no nível superior
    normalizedData.company_name = normalizedData.company_name || normalizedData.professional_info.company_name;
    normalizedData.company_size = normalizedData.company_size || normalizedData.professional_info.company_size;
    normalizedData.company_sector = normalizedData.company_sector || normalizedData.professional_info.company_sector;
    normalizedData.company_website = normalizedData.company_website || normalizedData.professional_info.company_website;
    normalizedData.current_position = normalizedData.current_position || normalizedData.professional_info.current_position;
    normalizedData.annual_revenue = normalizedData.annual_revenue || normalizedData.professional_info.annual_revenue;
    
    // Atualizar esses campos também no objeto professional_info
    normalizedData.professional_info = {
      ...normalizedData.professional_info,
      company_name: normalizedData.company_name || normalizedData.professional_info.company_name || "",
      company_size: normalizedData.company_size || normalizedData.professional_info.company_size || "",
      company_sector: normalizedData.company_sector || normalizedData.professional_info.company_sector || "",
      company_website: normalizedData.company_website || normalizedData.professional_info.company_website || "",
      current_position: normalizedData.current_position || normalizedData.professional_info.current_position || "",
      annual_revenue: normalizedData.annual_revenue || normalizedData.professional_info.annual_revenue || ""
    };
  }
  
  // Verificar a consistência de available_days / days_available
  if (normalizedData.experience_personalization) {
    if (normalizedData.experience_personalization.available_days && 
        !normalizedData.experience_personalization.days_available) {
      normalizedData.experience_personalization.days_available = 
        normalizedData.experience_personalization.available_days;
    }
    
    if (normalizedData.experience_personalization.days_available && 
        !normalizedData.experience_personalization.available_days) {
      normalizedData.experience_personalization.available_days = 
        normalizedData.experience_personalization.days_available;
    }
  }
  
  // Verificar se os logs de debug estão em formato de array
  if (!Array.isArray(normalizedData.debug_logs)) {
    normalizedData.debug_logs = [];
  }
  
  return normalizedData as OnboardingProgress;
};

/**
 * Garante que um campo seja um objeto JSON válido
 */
const ensureJsonObject = (value: any): Record<string, any> => {
  if (!value) return {};
  
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error("[ERRO] Falha ao fazer parse de JSON:", e);
      return {};
    }
  }
  
  if (typeof value === 'object') {
    return value;
  }
  
  return {};
};

/**
 * Garante que um campo seja um array JSON válido
 */
const ensureJsonArray = (value: any): any[] => {
  if (!value) return [];
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[ERRO] Falha ao fazer parse de array JSON:", e);
      return [];
    }
  }
  
  if (Array.isArray(value)) {
    return value;
  }
  
  return [];
};
