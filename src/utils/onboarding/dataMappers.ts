
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { OnboardingProgress } from '@/types/onboarding';

// Mapeia dados do QuickOnboarding para OnboardingProgress com estrutura correta
export const mapQuickToProgress = (quickData: QuickOnboardingData): Partial<OnboardingProgress> => {
  console.log('🔄 Mapeando dados Quick para Progress:', quickData);

  // Garantir que complementary_info nunca seja vazio (campo obrigatório)
  const complementaryInfo = {
    how_found_us: quickData.how_found_us || '',
    referred_by: quickData.referred_by || '',
    country: quickData.country || '',
    state: quickData.state || '',
    city: quickData.city || '',
    instagram_url: quickData.instagram_url || '',
    linkedin_url: quickData.linkedin_url || '',
    _created_at: new Date().toISOString()
  };

  // Garantir que personal_info tenha estrutura válida
  const personalInfo = {
    name: quickData.name || '',
    email: quickData.email || '',
    whatsapp: quickData.whatsapp || '',
    country_code: quickData.country_code || '+55',
    birth_date: quickData.birth_date || '',
    _updated_at: new Date().toISOString()
  };

  // Mapear company_segment para company_sector (correção crítica)
  const professionalInfo = {
    company_name: quickData.company_name || '',
    role: quickData.role || '',
    company_size: quickData.company_size || '',
    company_segment: quickData.company_segment || '', // Manter original
    company_website: quickData.company_website || '',
    annual_revenue_range: quickData.annual_revenue_range || '',
    current_position: quickData.current_position || '',
    _updated_at: new Date().toISOString()
  };

  const businessContext = {
    business_model: quickData.business_model || '',
    business_challenges: Array.isArray(quickData.business_challenges) ? quickData.business_challenges : [],
    short_term_goals: Array.isArray(quickData.short_term_goals) ? quickData.short_term_goals : [],
    medium_term_goals: Array.isArray(quickData.medium_term_goals) ? quickData.medium_term_goals : [],
    important_kpis: Array.isArray(quickData.important_kpis) ? quickData.important_kpis : [],
    additional_context: quickData.additional_context || '',
    _updated_at: new Date().toISOString()
  };

  const businessGoals = {
    primary_goal: quickData.primary_goal || '',
    expected_outcomes: Array.isArray(quickData.expected_outcomes) ? quickData.expected_outcomes : [],
    expected_outcome_30days: quickData.expected_outcome_30days || '',
    priority_solution_type: quickData.priority_solution_type || '',
    how_implement: quickData.how_implement || '',
    week_availability: quickData.week_availability || '',
    content_formats: Array.isArray(quickData.content_formats) ? quickData.content_formats : [],
    live_interest: typeof quickData.live_interest === 'number' ? quickData.live_interest : 0,
    _updated_at: new Date().toISOString()
  };

  const aiExperience = {
    ai_knowledge_level: quickData.ai_knowledge_level || 'iniciante',
    previous_tools: Array.isArray(quickData.previous_tools) ? quickData.previous_tools : [],
    has_implemented: quickData.has_implemented || '',
    desired_ai_areas: Array.isArray(quickData.desired_ai_areas) ? quickData.desired_ai_areas : [],
    completed_formation: Boolean(quickData.completed_formation),
    is_member_for_month: Boolean(quickData.is_member_for_month),
    nps_score: typeof quickData.nps_score === 'number' ? quickData.nps_score : 0,
    improvement_suggestions: quickData.improvement_suggestions || '',
    _updated_at: new Date().toISOString()
  };

  const experiencePersonalization = {
    interests: Array.isArray(quickData.interests) ? quickData.interests : [],
    time_preference: Array.isArray(quickData.time_preference) ? quickData.time_preference : [],
    available_days: Array.isArray(quickData.available_days) ? quickData.available_days : [],
    networking_availability: typeof quickData.networking_availability === 'number' ? quickData.networking_availability : 5,
    skills_to_share: Array.isArray(quickData.skills_to_share) ? quickData.skills_to_share : [],
    mentorship_topics: Array.isArray(quickData.mentorship_topics) ? quickData.mentorship_topics : [],
    authorize_case_usage: Boolean(quickData.authorize_case_usage),
    interested_in_interview: Boolean(quickData.interested_in_interview),
    priority_topics: Array.isArray(quickData.priority_topics) ? quickData.priority_topics : [],
    _updated_at: new Date().toISOString()
  };

  const mappedData = {
    personal_info: personalInfo,
    professional_info: professionalInfo,
    business_context: businessContext,
    business_goals: businessGoals,
    ai_experience: aiExperience,
    experience_personalization: experiencePersonalization,
    complementary_info: complementaryInfo,
    // Campos top-level para compatibilidade (usando mapeamento correto)
    company_name: quickData.company_name || '',
    company_size: quickData.company_size || '',
    company_sector: quickData.company_segment || '', // CORREÇÃO: company_segment → company_sector
    company_website: quickData.company_website || '',
    current_position: quickData.current_position || '',
    annual_revenue: quickData.annual_revenue_range || '', // CORREÇÃO: annual_revenue_range → annual_revenue
    // Campos de controle
    current_step: quickData.currentStep?.toString() || '1',
    completed_steps: [`step_${quickData.currentStep || 1}`],
    is_completed: false,
    sync_status: 'pendente',
    metadata: {
      mapped_at: new Date().toISOString(),
      source: 'quick_onboarding',
      version: '2.0'
    }
  };

  console.log('✅ Dados mapeados com sucesso:', mappedData);
  return mappedData;
};

// Valida dados de um step específico com validação mais rigorosa
export const validateStepData = (stepNumber: number, data: QuickOnboardingData): boolean => {
  console.log('🔍 Validando step:', stepNumber, 'dados:', data);

  switch (stepNumber) {
    case 1: // Informações pessoais - validação rigorosa
      const isStep1Valid = !!(
        data.name && data.name.trim().length >= 2 &&
        data.email && data.email.includes('@') &&
        data.whatsapp && data.whatsapp.length >= 10 &&
        data.country_code
      );
      console.log('📋 Step 1 válido:', isStep1Valid);
      return isStep1Valid;

    case 2: // Localização
      const isStep2Valid = !!(
        data.country && data.country.trim().length > 0 &&
        data.state && data.state.trim().length > 0 &&
        data.city && data.city.trim().length > 0
      );
      console.log('📋 Step 2 válido:', isStep2Valid);
      return isStep2Valid;

    case 3: // Como conheceu
      const isStep3Valid = !!(
        data.how_found_us && 
        (data.how_found_us !== 'indicacao' || (data.referred_by && data.referred_by.trim().length > 0))
      );
      console.log('📋 Step 3 válido:', isStep3Valid);
      return isStep3Valid;

    case 4: // Negócio
      const isStep4Valid = !!(
        data.company_name && data.company_name.trim().length > 0 &&
        data.role && data.role.trim().length > 0 &&
        data.company_size && data.company_size.trim().length > 0 &&
        data.company_segment && data.company_segment.trim().length > 0 &&
        data.annual_revenue_range && data.annual_revenue_range.trim().length > 0
      );
      console.log('📋 Step 4 válido:', isStep4Valid);
      return isStep4Valid;

    case 5: // Contexto do negócio
      const isStep5Valid = !!(
        data.business_model && data.business_model.trim().length > 0 &&
        Array.isArray(data.business_challenges) && data.business_challenges.length > 0
      );
      console.log('📋 Step 5 válido:', isStep5Valid);
      return isStep5Valid;

    case 6: // Objetivos
      const isStep6Valid = !!(
        data.primary_goal && data.primary_goal.trim().length > 0 &&
        data.expected_outcome_30days && data.expected_outcome_30days.trim().length > 0
      );
      console.log('📋 Step 6 válido:', isStep6Valid);
      return isStep6Valid;

    case 7: // Experiência com IA
      const isStep7Valid = !!(
        data.ai_knowledge_level && data.ai_knowledge_level !== '0' &&
        data.has_implemented && data.has_implemented.trim().length > 0
      );
      console.log('📋 Step 7 válido:', isStep7Valid);
      return isStep7Valid;

    case 8: // Personalização
      const isStep8Valid = !!(
        Array.isArray(data.content_formats) && data.content_formats.length > 0 &&
        Array.isArray(data.available_days) && data.available_days.length > 0
      );
      console.log('📋 Step 8 válido:', isStep8Valid);
      return isStep8Valid;

    default:
      console.log('📋 Step desconhecido:', stepNumber);
      return false;
  }
};
