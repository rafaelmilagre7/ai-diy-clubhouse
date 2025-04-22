
import { OnboardingProgress } from "@/types/onboarding";
import { 
  normalizeField, 
  normalizeAIExperience,
  normalizeBusinessGoals,
  normalizeWebsite
} from "../utils/dataNormalization";

/**
 * Normaliza os dados de progresso do onboarding para garantir consistência
 * Converte strings JSON para objetos, garante que campos obrigatórios existam, etc.
 */
export function normalizeOnboardingResponse(data: any): OnboardingProgress {
  // Criar uma cópia do objeto para não modificar o original
  const normalizedData = { ...data };
  
  // Garantir que campos críticos sejam objetos, não strings
  normalizedData.personal_info = normalizeField(data.personal_info, 'personal_info');
  normalizedData.professional_info = normalizeField(data.professional_info, 'professional_info');
  normalizedData.business_context = normalizeField(data.business_context, 'business_context');
  normalizedData.business_data = normalizeField(data.business_data, 'business_data');
  normalizedData.ai_experience = normalizeAIExperience(data.ai_experience);
  normalizedData.business_goals = normalizeBusinessGoals(data.business_goals);
  normalizedData.experience_personalization = normalizeField(data.experience_personalization, 'experience_personalization');
  normalizedData.complementary_info = normalizeField(data.complementary_info, 'complementary_info');
  
  // Garantir que campos opcionais mais recentes existam
  normalizedData.industry_focus = normalizeField(data.industry_focus, 'industry_focus');
  normalizedData.resources_needs = normalizeField(data.resources_needs, 'resources_needs');
  normalizedData.team_info = normalizeField(data.team_info, 'team_info');
  normalizedData.implementation_preferences = normalizeField(data.implementation_preferences, 'implementation_preferences');
  
  // Correções para professional_info
  if (normalizedData.professional_info) {
    if (normalizedData.professional_info.company_website) {
      normalizedData.professional_info.company_website = normalizeWebsite(normalizedData.professional_info.company_website);
    }
    
    // Sincronização entre professional_info e campos na raiz
    normalizedData.company_name = normalizedData.professional_info.company_name || normalizedData.company_name;
    normalizedData.company_size = normalizedData.professional_info.company_size || normalizedData.company_size;
    normalizedData.company_sector = normalizedData.professional_info.company_sector || normalizedData.company_sector;
    normalizedData.company_website = normalizedData.professional_info.company_website || normalizedData.company_website;
    normalizedData.current_position = normalizedData.professional_info.current_position || normalizedData.current_position;
    normalizedData.annual_revenue = normalizedData.professional_info.annual_revenue || normalizedData.annual_revenue;
  }
  
  // Verificando e garantindo consistência para experience_personalization
  if (normalizedData.experience_personalization) {
    const ep = normalizedData.experience_personalization;
    
    // Garantir que campos que devem ser arrays sejam arrays
    ['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'].forEach(field => {
      if (ep[field] !== undefined) {
        if (!Array.isArray(ep[field])) {
          ep[field] = ep[field] ? [ep[field]] : [];
        }
      } else {
        ep[field] = [];
      }
    });
    
    // Garantir que networking_availability seja um número
    if (ep.networking_availability !== undefined) {
      if (typeof ep.networking_availability === 'string') {
        ep.networking_availability = parseInt(ep.networking_availability, 10) || 0;
      }
    } else {
      ep.networking_availability = 0;
    }
  }
  
  // Verificando e garantindo consistência para complementary_info
  if (normalizedData.complementary_info) {
    const ci = normalizedData.complementary_info;
    
    // Garantir que campos booleanos sejam booleanos
    ['authorize_case_usage', 'interested_in_interview'].forEach(field => {
      if (ci[field] !== undefined) {
        ci[field] = !!ci[field];
      }
    });
    
    // Garantir que priority_topics seja um array
    if (ci.priority_topics !== undefined) {
      if (!Array.isArray(ci.priority_topics)) {
        ci.priority_topics = ci.priority_topics ? [ci.priority_topics] : [];
      }
    } else {
      ci.priority_topics = [];
    }
  }
  
  // Adicionar metadados para debugging
  normalizedData._metadata = {
    normalized_at: new Date().toISOString(),
  };
  
  return normalizedData as OnboardingProgress;
}
