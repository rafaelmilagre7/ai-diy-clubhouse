
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { OnboardingData, OnboardingProgress } from '@/types/onboarding';

/**
 * Mapeia dados do QuickOnboardingData para OnboardingProgress
 */
export function mapQuickToProgress(quickData: QuickOnboardingData): Partial<OnboardingProgress> {
  return {
    personal_info: {
      name: quickData.name,
      email: quickData.email,
      phone: quickData.whatsapp,
      ddi: quickData.country_code || '+55',
      linkedin: quickData.linkedin_url,
      instagram: quickData.instagram_url,
      country: quickData.country,
      state: quickData.state,
      city: quickData.city,
      timezone: quickData.timezone,
      role: quickData.role,
      company_size: quickData.company_size
    },
    
    professional_info: {
      company_name: quickData.company_name,
      company_size: quickData.company_size,
      company_sector: quickData.company_segment,
      company_website: quickData.company_website,
      current_position: quickData.current_position,
      annual_revenue: quickData.annual_revenue_range
    },
    
    business_context: {
      business_model: quickData.business_model,
      business_challenges: quickData.business_challenges || [],
      short_term_goals: quickData.short_term_goals || [],
      medium_term_goals: quickData.medium_term_goals || [],
      important_kpis: quickData.important_kpis || [],
      additional_context: quickData.additional_context
    },
    
    business_goals: {
      primary_goal: quickData.primary_goal,
      expected_outcomes: quickData.expected_outcomes || [],
      expected_outcome_30days: quickData.expected_outcome_30days,
      timeline: quickData.week_availability,
      priority_solution_type: quickData.priority_solution_type,
      how_implement: quickData.how_implement,
      week_availability: quickData.week_availability,
      live_interest: quickData.live_interest,
      content_formats: quickData.content_formats || []
    },
    
    ai_experience: {
      knowledge_level: quickData.ai_knowledge_level,
      previous_tools: quickData.previous_tools || [],
      has_implemented: quickData.has_implemented,
      desired_ai_areas: quickData.desired_ai_areas || [],
      completed_formation: quickData.completed_formation,
      is_member_for_month: quickData.is_member_for_month,
      nps_score: quickData.nps_score,
      improvement_suggestions: quickData.improvement_suggestions
    },
    
    experience_personalization: {
      interests: quickData.interests || [],
      time_preference: quickData.time_preference || [],
      available_days: quickData.available_days || [],
      networking_availability: quickData.networking_availability,
      skills_to_share: quickData.skills_to_share || [],
      mentorship_topics: quickData.mentorship_topics || []
    },
    
    complementary_info: {
      how_found_us: quickData.how_found_us,
      referred_by: quickData.referred_by,
      authorize_case_usage: quickData.authorize_case_usage,
      interested_in_interview: quickData.interested_in_interview,
      priority_topics: quickData.priority_topics || []
    }
  };
}

/**
 * Mapeia dados do OnboardingProgress para QuickOnboardingData
 */
export function mapProgressToQuick(progressData: OnboardingProgress): Partial<QuickOnboardingData> {
  const personal = progressData.personal_info || {};
  const professional = progressData.professional_info || {};
  const businessContext = progressData.business_context || {};
  const businessGoals = progressData.business_goals || {};
  const aiExp = progressData.ai_experience || {};
  const expPersonalization = progressData.experience_personalization || {};
  const complementary = progressData.complementary_info || {};

  return {
    // Informações pessoais
    name: personal.name || '',
    email: personal.email || '',
    whatsapp: personal.phone || '',
    country_code: personal.ddi || '+55',
    linkedin_url: personal.linkedin,
    instagram_url: personal.instagram,
    country: personal.country || '',
    state: personal.state || '',
    city: personal.city || '',
    timezone: personal.timezone || '',
    role: personal.role || '',
    
    // Informações profissionais
    company_name: professional.company_name || '',
    company_size: professional.company_size || '',
    company_segment: professional.company_sector || '',
    company_website: professional.company_website,
    current_position: professional.current_position || '',
    annual_revenue_range: professional.annual_revenue || '',
    
    // Contexto do negócio
    business_model: businessContext.business_model || '',
    business_challenges: businessContext.business_challenges || [],
    short_term_goals: businessContext.short_term_goals || [],
    medium_term_goals: businessContext.medium_term_goals || [],
    important_kpis: businessContext.important_kpis || [],
    additional_context: businessContext.additional_context,
    
    // Objetivos e metas
    primary_goal: businessGoals.primary_goal || '',
    expected_outcomes: businessGoals.expected_outcomes || [],
    expected_outcome_30days: businessGoals.expected_outcome_30days,
    priority_solution_type: businessGoals.priority_solution_type || '',
    how_implement: businessGoals.how_implement || '',
    week_availability: businessGoals.week_availability || '',
    live_interest: businessGoals.live_interest,
    content_formats: businessGoals.content_formats || [],
    
    // Experiência com IA
    ai_knowledge_level: (aiExp as any).knowledge_level || '',
    previous_tools: (aiExp as any).previous_tools || [],
    has_implemented: (aiExp as any).has_implemented || '',
    desired_ai_areas: (aiExp as any).desired_ai_areas || [],
    completed_formation: (aiExp as any).completed_formation,
    is_member_for_month: (aiExp as any).is_member_for_month,
    nps_score: (aiExp as any).nps_score,
    improvement_suggestions: (aiExp as any).improvement_suggestions,
    
    // Personalização da experiência
    interests: expPersonalization.interests || [],
    time_preference: expPersonalization.time_preference || [],
    available_days: expPersonalization.available_days || [],
    networking_availability: expPersonalization.networking_availability,
    skills_to_share: expPersonalization.skills_to_share || [],
    mentorship_topics: expPersonalization.mentorship_topics || [],
    
    // Informações complementares
    how_found_us: complementary.how_found_us || '',
    referred_by: complementary.referred_by,
    authorize_case_usage: complementary.authorize_case_usage,
    interested_in_interview: complementary.interested_in_interview,
    priority_topics: complementary.priority_topics || []
  };
}

/**
 * Cria um novo registro de progresso padrão
 */
export function createDefaultProgress(userId: string): Partial<OnboardingProgress> {
  return {
    user_id: userId,
    current_step: '1',
    completed_steps: [],
    is_completed: false,
    personal_info: {},
    professional_info: {},
    business_context: {},
    business_goals: {},
    ai_experience: {},
    experience_personalization: {},
    complementary_info: {}
  };
}

/**
 * Valida se os dados obrigatórios estão presentes para um step específico
 */
export function validateStepData(data: QuickOnboardingData, step: number): boolean {
  switch (step) {
    case 1:
      return !!(data.name && data.email && data.whatsapp);
    case 2:
      return !!(data.country && data.state && data.city);
    case 3:
      return !!(data.how_found_us);
    case 4:
      return !!(data.company_name && data.role && data.company_size && data.company_segment);
    case 5:
      return !!(data.business_model);
    case 6:
      return !!(data.primary_goal);
    case 7:
      return !!(data.ai_knowledge_level && data.has_implemented);
    case 8:
      return !!(data.interests && data.interests.length > 0);
    default:
      return true;
  }
}
