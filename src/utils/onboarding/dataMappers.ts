
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { OnboardingProgress } from '@/types/onboarding';

/**
 * Converte dados do formato Quick para o formato Progress (banco de dados)
 */
export const mapQuickToProgress = (quickData: QuickOnboardingData): Partial<OnboardingProgress> => {
  console.log('🔄 Mapeando Quick para Progress:', quickData);
  
  const progressData: Partial<OnboardingProgress> = {
    // Dados pessoais estruturados corretamente
    personal_info: {
      name: quickData.name || '',
      email: quickData.email || '',
      phone: quickData.whatsapp || '',
      ddi: quickData.country_code || '+55',
      birth_date: quickData.birth_date || '',
      country: quickData.country || '',
      state: quickData.state || '',
      city: quickData.city || '',
      timezone: quickData.timezone || '',
      linkedin: quickData.linkedin_url || '',
      instagram: quickData.instagram_url || ''
    },
    
    // Dados profissionais
    professional_info: {
      company_name: quickData.company_name || '',
      company_size: quickData.company_size || '',
      company_sector: quickData.company_segment || '',
      company_website: quickData.company_website || '',
      current_position: quickData.role || quickData.current_position || '',
      annual_revenue: quickData.annual_revenue_range || ''
    },
    
    // Contexto do negócio
    business_context: {
      business_model: quickData.business_model || '',
      business_challenges: quickData.business_challenges || [],
      short_term_goals: quickData.short_term_goals || [],
      medium_term_goals: quickData.medium_term_goals || [],
      important_kpis: quickData.important_kpis || [],
      additional_context: quickData.additional_context || ''
    },
    
    // Objetivos e metas
    business_goals: {
      primary_goal: quickData.primary_goal || '',
      expected_outcomes: quickData.expected_outcomes || [],
      expected_outcome_30days: quickData.expected_outcome_30days || '',
      priority_solution_type: quickData.priority_solution_type || '',
      how_implement: quickData.how_implement || '',
      week_availability: quickData.week_availability || '',
      live_interest: quickData.live_interest || 0,
      content_formats: quickData.content_formats || []
    },
    
    // Experiência com IA
    ai_experience: {
      knowledge_level: quickData.ai_knowledge_level || '',
      previous_tools: quickData.previous_tools || [],
      has_implemented: quickData.has_implemented || '',
      desired_ai_areas: quickData.desired_ai_areas || [],
      completed_formation: quickData.completed_formation || false,
      is_member_for_month: quickData.is_member_for_month || false,
      nps_score: quickData.nps_score || 0,
      improvement_suggestions: quickData.improvement_suggestions || ''
    },
    
    // Personalização da experiência
    experience_personalization: {
      interests: quickData.interests || [],
      time_preference: quickData.time_preference || [],
      available_days: quickData.available_days || [],
      networking_availability: quickData.networking_availability || 0,
      skills_to_share: quickData.skills_to_share || [],
      mentorship_topics: quickData.mentorship_topics || []
    },
    
    // Informações complementares
    complementary_info: {
      how_found_us: quickData.how_found_us || '',
      referred_by: quickData.referred_by || '',
      authorize_case_usage: quickData.authorize_case_usage || false,
      interested_in_interview: quickData.interested_in_interview || false,
      priority_topics: quickData.priority_topics || []
    },
    
    // Arrays de controle
    completed_steps: [],
    
    // Metadados
    updated_at: new Date().toISOString()
  };
  
  console.log('✅ Dados mapeados para Progress:', progressData);
  return progressData;
};

/**
 * Converte dados do formato Progress para o formato Quick (para carregar dados salvos)
 */
export const mapProgressToQuick = (progressData: OnboardingProgress): QuickOnboardingData => {
  console.log('🔄 Mapeando Progress para Quick:', progressData);
  
  const quickData: QuickOnboardingData = {
    // Dados pessoais
    name: progressData.personal_info?.name || '',
    email: progressData.personal_info?.email || '',
    whatsapp: progressData.personal_info?.phone || '',
    country_code: progressData.personal_info?.ddi || '+55',
    birth_date: progressData.personal_info?.birth_date || '',
    country: progressData.personal_info?.country || '',
    state: progressData.personal_info?.state || '',
    city: progressData.personal_info?.city || '',
    timezone: progressData.personal_info?.timezone || '',
    linkedin_url: progressData.personal_info?.linkedin || '',
    instagram_url: progressData.personal_info?.instagram || '',
    
    // Dados profissionais
    company_name: progressData.professional_info?.company_name || '',
    role: progressData.professional_info?.current_position || '',
    company_size: progressData.professional_info?.company_size || '',
    company_segment: progressData.professional_info?.company_sector || '',
    company_website: progressData.professional_info?.company_website || '',
    annual_revenue_range: progressData.professional_info?.annual_revenue || '',
    current_position: progressData.professional_info?.current_position || '',
    
    // Como nos conheceu
    how_found_us: progressData.complementary_info?.how_found_us || '',
    referred_by: progressData.complementary_info?.referred_by || '',
    
    // Contexto do negócio
    business_model: progressData.business_context?.business_model || '',
    business_challenges: progressData.business_context?.business_challenges || [],
    short_term_goals: progressData.business_context?.short_term_goals || [],
    medium_term_goals: progressData.business_context?.medium_term_goals || [],
    important_kpis: progressData.business_context?.important_kpis || [],
    additional_context: progressData.business_context?.additional_context || '',
    
    // Objetivos
    primary_goal: progressData.business_goals?.primary_goal || '',
    expected_outcomes: progressData.business_goals?.expected_outcomes || [],
    expected_outcome_30days: progressData.business_goals?.expected_outcome_30days || '',
    priority_solution_type: progressData.business_goals?.priority_solution_type || '',
    how_implement: progressData.business_goals?.how_implement || '',
    week_availability: progressData.business_goals?.week_availability || '',
    live_interest: progressData.business_goals?.live_interest || 0,
    content_formats: progressData.business_goals?.content_formats || [],
    
    // Experiência IA
    ai_knowledge_level: progressData.ai_experience?.knowledge_level || '',
    previous_tools: progressData.ai_experience?.previous_tools || [],
    has_implemented: progressData.ai_experience?.has_implemented || '',
    desired_ai_areas: progressData.ai_experience?.desired_ai_areas || [],
    completed_formation: progressData.ai_experience?.completed_formation || false,
    is_member_for_month: progressData.ai_experience?.is_member_for_month || false,
    nps_score: progressData.ai_experience?.nps_score || 0,
    improvement_suggestions: progressData.ai_experience?.improvement_suggestions || '',
    
    // Personalização
    interests: progressData.experience_personalization?.interests || [],
    time_preference: progressData.experience_personalization?.time_preference || [],
    available_days: progressData.experience_personalization?.available_days || [],
    networking_availability: progressData.experience_personalization?.networking_availability || 0,
    skills_to_share: progressData.experience_personalization?.skills_to_share || [],
    mentorship_topics: progressData.experience_personalization?.mentorship_topics || [],
    
    // Controle
    authorize_case_usage: progressData.complementary_info?.authorize_case_usage || false,
    interested_in_interview: progressData.complementary_info?.interested_in_interview || false,
    priority_topics: progressData.complementary_info?.priority_topics || []
  };
  
  console.log('✅ Dados mapeados para Quick:', quickData);
  return quickData;
};

/**
 * Valida se os dados do step estão completos para prosseguir
 */
export const validateStepData = (data: QuickOnboardingData, step: number): boolean => {
  console.log(`🔍 Validando step ${step}:`, data);
  
  try {
    switch (step) {
      case 1: // Dados pessoais
        return !!(data.name && data.email && data.whatsapp && data.country_code);
      
      case 2: // Localização
        return !!(data.country && data.state && data.city && data.timezone);
      
      case 3: // Como nos conheceu
        return !!(data.how_found_us);
      
      case 4: // Negócio
        return !!(data.company_name && data.role && data.company_size && 
                  data.company_segment && data.annual_revenue_range);
      
      case 5: // Contexto negócio
        return !!(data.business_model && data.business_challenges?.length);
      
      case 6: // Objetivos
        return !!(data.primary_goal && data.expected_outcome_30days);
      
      case 7: // Experiência IA
        return !!(data.ai_knowledge_level && data.has_implemented);
      
      case 8: // Personalização
        return true; // Step opcional
      
      default:
        return false;
    }
  } catch (error) {
    console.error(`❌ Erro na validação do step ${step}:`, error);
    return false;
  }
};
