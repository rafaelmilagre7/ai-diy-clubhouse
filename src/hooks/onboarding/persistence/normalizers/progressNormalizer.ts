import { OnboardingProgress } from "@/types/onboarding";
import { 
  normalizeField, 
  normalizeAIExperience,
  normalizeBusinessGoals,
  normalizeExperiencePersonalization,
  normalizeWebsite
} from "../utils/dataNormalization";

export function normalizeOnboardingResponse(data: any): OnboardingProgress {
  // Criar cópia
  const normalizedData = { ...data };

  // Normalizar todos os campos em objetos (não strings)
  normalizedData.personal_info = normalizeField(data.personal_info, 'personal_info');
  normalizedData.professional_info = normalizeField(data.professional_info, 'professional_info');
  normalizedData.business_context = normalizeField(data.business_context, 'business_context');
  normalizedData.business_data = normalizeField(data.business_data, 'business_data');
  normalizedData.ai_experience = normalizeAIExperience(data.ai_experience);
  normalizedData.business_goals = normalizeBusinessGoals(data.business_goals);
  normalizedData.experience_personalization = normalizeExperiencePersonalization(data.experience_personalization);
  normalizedData.complementary_info = normalizeField(data.complementary_info, 'complementary_info');
  normalizedData.industry_focus = normalizeField(data.industry_focus, 'industry_focus');
  normalizedData.resources_needs = normalizeField(data.resources_needs, 'resources_needs');
  normalizedData.team_info = normalizeField(data.team_info, 'team_info');
  normalizedData.implementation_preferences = normalizeField(data.implementation_preferences, 'implementation_preferences');

  // ~Remover cópias antigas~ dos campos top-level. Não copiar para a raiz.
  // Exemplo: não mapear normalizedData.company_name = ...
  // (essa linha foi removida para evitar despadronização de dados!)

  // Adicionar metadados para debugging
  normalizedData._metadata = {
    normalized_at: new Date().toISOString(),
  };

  return normalizedData as OnboardingProgress;
}
