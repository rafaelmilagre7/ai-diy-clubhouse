
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { OnboardingProgress } from '@/types/onboarding';

// Mapeia dados do QuickOnboarding para OnboardingProgress
export const mapQuickToProgress = (quickData: QuickOnboardingData): Partial<OnboardingProgress> => {
  return {
    personal_info: {
      name: quickData.name,
      email: quickData.email,
      whatsapp: quickData.whatsapp,
      country_code: quickData.country_code,
      birth_date: quickData.birth_date
    },
    professional_info: {
      company_name: quickData.company_name,
      role: quickData.role,
      company_size: quickData.company_size,
      company_segment: quickData.company_segment,
      company_website: quickData.company_website,
      annual_revenue_range: quickData.annual_revenue_range,
      current_position: quickData.current_position
    },
    business_context: {
      business_model: quickData.business_model,
      business_challenges: quickData.business_challenges,
      short_term_goals: quickData.short_term_goals,
      medium_term_goals: quickData.medium_term_goals,
      important_kpis: quickData.important_kpis,
      additional_context: quickData.additional_context
    },
    business_goals: {
      primary_goal: quickData.primary_goal,
      expected_outcomes: quickData.expected_outcomes,
      expected_outcome_30days: quickData.expected_outcome_30days,
      priority_solution_type: quickData.priority_solution_type,
      how_implement: quickData.how_implement,
      week_availability: quickData.week_availability,
      content_formats: quickData.content_formats,
      live_interest: quickData.live_interest
    },
    ai_experience: {
      ai_knowledge_level: quickData.ai_knowledge_level,
      previous_tools: quickData.previous_tools,
      has_implemented: quickData.has_implemented,
      desired_ai_areas: quickData.desired_ai_areas,
      completed_formation: quickData.completed_formation,
      is_member_for_month: quickData.is_member_for_month,
      nps_score: quickData.nps_score,
      improvement_suggestions: quickData.improvement_suggestions
    },
    experience_personalization: {
      interests: quickData.interests,
      time_preference: quickData.time_preference,
      available_days: quickData.available_days,
      networking_availability: quickData.networking_availability,
      skills_to_share: quickData.skills_to_share,
      mentorship_topics: quickData.mentorship_topics,
      authorize_case_usage: quickData.authorize_case_usage,
      interested_in_interview: quickData.interested_in_interview,
      priority_topics: quickData.priority_topics
    },
    complementary_info: {
      how_found_us: quickData.how_found_us,
      referred_by: quickData.referred_by,
      country: quickData.country,
      state: quickData.state,
      city: quickData.city,
      timezone: quickData.timezone,
      instagram_url: quickData.instagram_url,
      linkedin_url: quickData.linkedin_url
    },
    // Campos top-level para compatibilidade
    company_name: quickData.company_name,
    company_size: quickData.company_size,
    company_sector: quickData.company_segment,
    company_website: quickData.company_website,
    current_position: quickData.current_position,
    annual_revenue: quickData.annual_revenue_range
  };
};

// Valida dados de um step específico
export const validateStepData = (stepNumber: number, data: QuickOnboardingData): boolean => {
  switch (stepNumber) {
    case 1: // Informações pessoais
      return !!(data.name && data.name.length >= 2);
    case 2: // Localização
      return !!(data.country && data.state && data.city);
    case 3: // Como conheceu
      return !!(data.how_found_us && (data.how_found_us !== 'indicacao' || data.referred_by));
    case 4: // Negócio
      return !!(data.company_name && data.role && data.company_size && data.company_segment);
    case 5: // Contexto do negócio
      return !!data.business_model;
    case 6: // Objetivos
      return !!(data.primary_goal && data.expected_outcome_30days);
    case 7: // Experiência com IA
      return !!(data.ai_knowledge_level && data.ai_knowledge_level !== '0' && data.has_implemented);
    case 8: // Personalização
      return !!(data.content_formats && data.content_formats.length > 0 && data.available_days && data.available_days.length > 0);
    default:
      return false;
  }
};
