
import { OnboardingProgress } from "@/types/onboarding";
import { 
  normalizeField, 
  normalizeWebsite, 
  normalizeDDI, 
  normalizeArrayField,
  normalizeAIExperience
} from "../utils/dataNormalization";

export const normalizeOnboardingResponse = (data: OnboardingProgress): OnboardingProgress => {
  if (!data) return data;

  const normalizedData = { ...data };

  // Lista de campos que devem ser objetos
  const objectFields = [
    'ai_experience', 'business_goals', 'experience_personalization', 
    'complementary_info', 'professional_info', 'business_data', 
    'business_context', 'personal_info', 'industry_focus', 
    'resources_needs', 'team_info', 'implementation_preferences'
  ];

  // Normalizar campos de objeto
  objectFields.forEach(field => {
    const value = normalizedData[field as keyof typeof normalizedData];
    (normalizedData as any)[field] = normalizeField(value, field);
  });

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

  // Normalizar AI Experience
  if (normalizedData.ai_experience) {
    normalizedData.ai_experience = normalizeAIExperience(normalizedData.ai_experience);
  }

  return normalizedData;
};
