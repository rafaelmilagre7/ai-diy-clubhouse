
import { OnboardingProgress } from "@/types/onboarding";
import { 
  normalizeField, 
  normalizeWebsite, 
  normalizeDDI, 
  normalizeArrayField,
  normalizeAIExperience,
  normalizeBusinessGoals
} from "../utils/dataNormalization";

export const normalizeOnboardingResponse = (data: OnboardingProgress): OnboardingProgress => {
  if (!data) return data;

  const normalizedData = { ...data };

  // Lista de campos que devem ser objetos
  const objectFields = [
    'business_context', 'personal_info', 'industry_focus', 
    'resources_needs', 'team_info', 'implementation_preferences',
    'professional_info', 'complementary_info', 'experience_personalization'
  ];

  // Normalizar campos de objeto
  objectFields.forEach(field => {
    const value = normalizedData[field as keyof typeof normalizedData];
    (normalizedData as any)[field] = normalizeField(value, field);
  });
  
  // Normalizar campos especiais que precisam de tratamento personalizado
  normalizedData.ai_experience = normalizeAIExperience(normalizedData.ai_experience);
  normalizedData.business_goals = normalizeBusinessGoals(normalizedData.business_goals);

  // Normalizar completed_steps
  if (normalizedData.completed_steps) {
    if (typeof normalizedData.completed_steps === 'string') {
      try {
        normalizedData.completed_steps = JSON.parse(normalizedData.completed_steps as unknown as string);
      } catch {
        normalizedData.completed_steps = [];
      }
    }
    if (!Array.isArray(normalizedData.completed_steps)) {
      normalizedData.completed_steps = [];
    }
  }

  // Normalizar campos específicos
  if (normalizedData.professional_info?.company_website) {
    normalizedData.professional_info.company_website = 
      normalizeWebsite(normalizedData.professional_info.company_website);
  }

  if (normalizedData.company_website) {
    normalizedData.company_website = normalizeWebsite(normalizedData.company_website);
  }

  if (normalizedData.personal_info?.ddi) {
    normalizedData.personal_info.ddi = normalizeDDI(normalizedData.personal_info.ddi);
  }

  return normalizedData;
};
