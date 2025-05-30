
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
 * Helper para extrair valor seguro de um objeto aninhado
 */
function safeGet(obj: any, key: string, defaultValue: any = undefined) {
  try {
    return obj && typeof obj === 'object' ? (obj[key] ?? defaultValue) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Helper para garantir que arrays sejam sempre arrays
 */
function ensureArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  return [];
}

/**
 * Mapeia dados do OnboardingProgress para QuickOnboardingData
 */
export function mapProgressToQuick(progressData: OnboardingProgress): Partial<QuickOnboardingData> {
  console.log('🔄 Mapeando dados do progresso para Quick format:', progressData);
  
  const personal = progressData.personal_info || {};
  const professional = progressData.professional_info || {};
  const businessContext = progressData.business_context || {};
  const businessGoals = progressData.business_goals || {};
  const aiExp = progressData.ai_experience || {};
  const expPersonalization = progressData.experience_personalization || {};
  const complementary = progressData.complementary_info || {};

  const mappedData = {
    // Informações pessoais
    name: safeGet(personal, 'name', ''),
    email: safeGet(personal, 'email', ''),
    whatsapp: safeGet(personal, 'phone', ''),
    country_code: safeGet(personal, 'ddi', '+55'),
    linkedin_url: safeGet(personal, 'linkedin', ''),
    instagram_url: safeGet(personal, 'instagram', ''),
    country: safeGet(personal, 'country', ''),
    state: safeGet(personal, 'state', ''),
    city: safeGet(personal, 'city', ''),
    timezone: safeGet(personal, 'timezone', ''),
    role: safeGet(personal, 'role', ''),
    
    // Informações profissionais
    company_name: safeGet(professional, 'company_name', ''),
    company_size: safeGet(professional, 'company_size', ''),
    company_segment: safeGet(professional, 'company_sector', ''),
    company_website: safeGet(professional, 'company_website', ''),
    current_position: safeGet(professional, 'current_position', ''),
    annual_revenue_range: safeGet(professional, 'annual_revenue', ''),
    
    // Contexto do negócio
    business_model: safeGet(businessContext, 'business_model', ''),
    business_challenges: ensureArray(safeGet(businessContext, 'business_challenges', [])),
    short_term_goals: ensureArray(safeGet(businessContext, 'short_term_goals', [])),
    medium_term_goals: ensureArray(safeGet(businessContext, 'medium_term_goals', [])),
    important_kpis: ensureArray(safeGet(businessContext, 'important_kpis', [])),
    additional_context: safeGet(businessContext, 'additional_context', ''),
    
    // Objetivos e metas
    primary_goal: safeGet(businessGoals, 'primary_goal', ''),
    expected_outcomes: ensureArray(safeGet(businessGoals, 'expected_outcomes', [])),
    expected_outcome_30days: safeGet(businessGoals, 'expected_outcome_30days', ''),
    priority_solution_type: safeGet(businessGoals, 'priority_solution_type', ''),
    how_implement: safeGet(businessGoals, 'how_implement', ''),
    week_availability: safeGet(businessGoals, 'week_availability', ''),
    live_interest: safeGet(businessGoals, 'live_interest', 0),
    content_formats: ensureArray(safeGet(businessGoals, 'content_formats', [])),
    
    // Experiência com IA
    ai_knowledge_level: safeGet(aiExp, 'knowledge_level', ''),
    previous_tools: ensureArray(safeGet(aiExp, 'previous_tools', [])),
    has_implemented: safeGet(aiExp, 'has_implemented', ''),
    desired_ai_areas: ensureArray(safeGet(aiExp, 'desired_ai_areas', [])),
    completed_formation: safeGet(aiExp, 'completed_formation', false),
    is_member_for_month: safeGet(aiExp, 'is_member_for_month', false),
    nps_score: safeGet(aiExp, 'nps_score', 0),
    improvement_suggestions: safeGet(aiExp, 'improvement_suggestions', ''),
    
    // Personalização da experiência
    interests: ensureArray(safeGet(expPersonalization, 'interests', [])),
    time_preference: ensureArray(safeGet(expPersonalization, 'time_preference', [])),
    available_days: ensureArray(safeGet(expPersonalization, 'available_days', [])),
    networking_availability: safeGet(expPersonalization, 'networking_availability', 0),
    skills_to_share: ensureArray(safeGet(expPersonalization, 'skills_to_share', [])),
    mentorship_topics: ensureArray(safeGet(expPersonalization, 'mentorship_topics', [])),
    
    // Informações complementares
    how_found_us: safeGet(complementary, 'how_found_us', ''),
    referred_by: safeGet(complementary, 'referred_by', ''),
    authorize_case_usage: safeGet(complementary, 'authorize_case_usage', false),
    interested_in_interview: safeGet(complementary, 'interested_in_interview', false),
    priority_topics: ensureArray(safeGet(complementary, 'priority_topics', []))
  };
  
  console.log('✅ Dados mapeados com sucesso:', mappedData);
  return mappedData;
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
