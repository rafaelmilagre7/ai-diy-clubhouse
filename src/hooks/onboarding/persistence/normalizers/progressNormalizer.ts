
import { OnboardingProgress } from "@/types/onboarding";
import { 
  normalizeField, 
  normalizeAIExperience,
  normalizeBusinessGoals,
  normalizeExperiencePersonalization
} from "../utils/dataNormalization";

/**
 * Normaliza dados brutos de onboarding para garantir consistência
 * Otimizado para evitar processamentos desnecessários
 */
export function normalizeOnboardingResponse(data: any): OnboardingProgress {
  // Verificação rápida para evitar processamento desnecessário
  if (!data) {
    return {} as OnboardingProgress;
  }

  // Criar cópia profunda para evitar mutação do objeto original
  const normalizedData = JSON.parse(JSON.stringify(data));

  // Normalizar todos os campos em objetos (não strings)
  // Usar normalização condicional para evitar processamento quando não necessário
  if (data.personal_info) normalizedData.personal_info = normalizeField(data.personal_info);
  if (data.professional_info) normalizedData.professional_info = normalizeField(data.professional_info);
  if (data.business_context) normalizedData.business_context = normalizeField(data.business_context);
  if (data.business_data) normalizedData.business_data = normalizeField(data.business_data);
  if (data.ai_experience) normalizedData.ai_experience = normalizeAIExperience(data.ai_experience);
  if (data.business_goals) normalizedData.business_goals = normalizeBusinessGoals(data.business_goals);
  if (data.experience_personalization) normalizedData.experience_personalization = normalizeExperiencePersonalization(data.experience_personalization);
  if (data.complementary_info) normalizedData.complementary_info = normalizeField(data.complementary_info);
  if (data.industry_focus) normalizedData.industry_focus = normalizeField(data.industry_focus);
  if (data.resources_needs) normalizedData.resources_needs = normalizeField(data.resources_needs);
  if (data.team_info) normalizedData.team_info = normalizeField(data.team_info);
  if (data.implementation_preferences) normalizedData.implementation_preferences = normalizeField(data.implementation_preferences);

  // Preservar campos legados para compatibilidade
  normalizedData.company_name = data.company_name;
  normalizedData.company_size = data.company_size;
  normalizedData.company_sector = data.company_sector;
  normalizedData.company_website = data.company_website;
  normalizedData.current_position = data.current_position;
  normalizedData.annual_revenue = data.annual_revenue;

  // Adicionar metadados para debugging
  normalizedData._metadata = {
    normalized_at: new Date().toISOString(),
    normalized_version: '2.0', // Para rastreamento de versão
  };

  return normalizedData as OnboardingProgress;
}
