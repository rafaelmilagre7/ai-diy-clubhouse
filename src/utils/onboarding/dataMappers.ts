import { QuickOnboardingData } from '@/types/quickOnboarding';
import { OnboardingData } from '@/types/onboarding';

export const mapQuickToProgress = (quickData: QuickOnboardingData): OnboardingData => {
  console.log('📊 Mapeando dados do Quick Onboarding:', quickData);
  
  const mapped: OnboardingData = {
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
    professional_info: {
      company_name: quickData.company_name || '',
      current_position: quickData.role || '',
      company_size: quickData.company_size || '',
      company_sector: quickData.company_segment || '',
      company_website: quickData.company_website || '',
      annual_revenue: quickData.annual_revenue_range || ''
    },
    business_context: {
      business_model: quickData.business_model || '',
      business_challenges: quickData.business_challenges || [],
      additional_context: quickData.additional_context || ''
    },
    business_goals: {
      primary_goal: quickData.primary_goal || '',
      expected_outcomes: quickData.expected_outcomes || [],
      expected_outcome_30days: quickData.expected_outcome_30days || '',
      priority_solution_type: quickData.priority_solution_type || '',
      how_implement: quickData.how_implement || '',
      week_availability: quickData.week_availability || '',
      content_formats: quickData.content_formats || []
    },
    ai_experience: {
      knowledge_level: quickData.ai_knowledge_level || '',
      previous_tools: quickData.previous_tools || [],
      has_implemented: quickData.has_implemented || '',
      desired_ai_areas: quickData.desired_ai_areas || [],
      completed_formation: quickData.completed_formation || false,
      is_member_for_month: quickData.is_member_for_month || false,
      nps_score: quickData.nps_score,
      improvement_suggestions: quickData.improvement_suggestions || ''
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
      how_found_us: quickData.how_found_us || '',
      referred_by: quickData.referred_by || '',
      authorize_case_usage: quickData.authorize_case_usage || false,
      interested_in_interview: quickData.interested_in_interview || false,
      priority_topics: quickData.priority_topics || []
    }
  };

  console.log('✅ Dados mapeados com sucesso:', mapped);
  return mapped;
};

export const mapProgressToQuick = (progressData: any): QuickOnboardingData => {
  console.log('📊 Convertendo Progress para Quick:', progressData);
  
  const quickData: QuickOnboardingData = {
    // Etapa 1 - Dados pessoais
    name: progressData.personal_info?.name || '',
    email: progressData.personal_info?.email || '',
    whatsapp: progressData.personal_info?.phone || '',
    country_code: progressData.personal_info?.ddi || '+55',
    birth_date: progressData.personal_info?.birth_date || '',
    
    // Etapa 2 - Localização
    country: progressData.personal_info?.country || '',
    state: progressData.personal_info?.state || '',
    city: progressData.personal_info?.city || '',
    timezone: progressData.personal_info?.timezone || '',
    instagram_url: progressData.personal_info?.instagram || '',
    linkedin_url: progressData.personal_info?.linkedin || '',
    
    // Etapa 3 - Como nos conheceu
    how_found_us: progressData.complementary_info?.how_found_us || '',
    referred_by: progressData.complementary_info?.referred_by || '',
    
    // Etapa 4 - Negócio
    company_name: progressData.professional_info?.company_name || '',
    role: progressData.professional_info?.current_position || '',
    company_size: progressData.professional_info?.company_size || '',
    company_segment: progressData.professional_info?.company_sector || '',
    company_website: progressData.professional_info?.company_website || '',
    annual_revenue_range: progressData.professional_info?.annual_revenue || '',
    current_position: progressData.professional_info?.current_position || '',
    
    // Etapa 5 - Contexto
    business_model: progressData.business_context?.business_model || '',
    business_challenges: progressData.business_context?.business_challenges || [],
    additional_context: progressData.business_context?.additional_context || '',
    
    // Dados da IA experience
    ai_knowledge_level: progressData.ai_experience?.knowledge_level || '',
    previous_tools: progressData.ai_experience?.previous_tools || [],
    has_implemented: progressData.ai_experience?.has_implemented || '',
    desired_ai_areas: progressData.ai_experience?.desired_ai_areas || [],
    completed_formation: progressData.ai_experience?.completed_formation || false,
    is_member_for_month: progressData.ai_experience?.is_member_for_month || false,
    nps_score: progressData.ai_experience?.nps_score || 0,
    improvement_suggestions: progressData.ai_experience?.improvement_suggestions || '',
    
    // Campos de controle
    live_interest: 0,
    authorize_case_usage: progressData.complementary_info?.authorize_case_usage || false,
    interested_in_interview: progressData.complementary_info?.interested_in_interview || false,
    priority_topics: progressData.complementary_info?.priority_topics || [],
    
    // Campos obrigatórios do Quick
    short_term_goals: [],
    medium_term_goals: [],
    important_kpis: [],
    primary_goal: progressData.business_goals?.primary_goal || '',
    expected_outcomes: progressData.business_goals?.expected_outcomes || [],
    expected_outcome_30days: progressData.business_goals?.expected_outcome_30days || '',
    priority_solution_type: progressData.business_goals?.priority_solution_type || '',
    how_implement: progressData.business_goals?.how_implement || '',
    week_availability: progressData.business_goals?.week_availability || '',
    content_formats: progressData.business_goals?.content_formats || [],
    interests: progressData.experience_personalization?.interests || [],
    time_preference: progressData.experience_personalization?.time_preference || [],
    available_days: progressData.experience_personalization?.available_days || [],
    networking_availability: progressData.experience_personalization?.networking_availability || 0,
    skills_to_share: progressData.experience_personalization?.skills_to_share || [],
    mentorship_topics: progressData.experience_personalization?.mentorship_topics || []
  };

  console.log('✅ Conversão Progress->Quick concluída:', quickData);
  return quickData;
};

export const validateStepData = (data: QuickOnboardingData, step: number): boolean => {
  console.log(`🔍 Validando dados para step ${step}:`, data);
  
  switch (step) {
    case 1: // Quem é você
      const hasBasicInfo = data.name && data.name.trim().length > 2 && 
                          data.email && data.email.includes('@') &&
                          data.whatsapp && data.whatsapp.trim().length > 8 &&
                          data.country_code;
      console.log('📝 Step 1 válido:', hasBasicInfo);
      return hasBasicInfo;
      
    case 2: // Localização
      const hasLocation = data.country && data.state && data.city && data.timezone;
      console.log('🌍 Step 2 válido:', hasLocation);
      return hasLocation;
      
    case 3: // Como nos conheceu
      const hasDiscovery = data.how_found_us && data.how_found_us.trim().length > 0;
      console.log('🤝 Step 3 válido:', hasDiscovery);
      return hasDiscovery;
      
    case 4: // Seu negócio
      const hasBusiness = data.company_name && data.role && data.company_size && 
                         data.company_segment && data.annual_revenue_range;
      console.log('🏢 Step 4 válido:', hasBusiness);
      return hasBusiness;
      
    case 5: // Contexto do negócio
      const hasContext = data.business_model && 
                         data.business_challenges && 
                         data.business_challenges.length > 0;
      console.log('💼 Step 5 válido:', hasContext);
      return hasContext;
      
    default:
      console.log('⚠️ Step não reconhecido:', step);
      return false;
  }
};

export const extractValidData = (data: QuickOnboardingData): Partial<QuickOnboardingData> => {
  const validData: Partial<QuickOnboardingData> = {};
  
  // Só incluir campos que têm valores válidos
  if (data.name && data.name.trim()) validData.name = data.name.trim();
  if (data.email && data.email.includes('@')) validData.email = data.email.trim();
  if (data.whatsapp && data.whatsapp.trim()) validData.whatsapp = data.whatsapp.trim();
  if (data.country_code) validData.country_code = data.country_code;
  if (data.birth_date) validData.birth_date = data.birth_date;
  
  // Localização
  if (data.country && data.country.trim()) validData.country = data.country.trim();
  if (data.state) validData.state = data.state;
  if (data.city && data.city.trim()) validData.city = data.city.trim();
  if (data.timezone) validData.timezone = data.timezone;
  
  // Redes sociais (opcionais)
  if (data.instagram_url && data.instagram_url.trim()) validData.instagram_url = data.instagram_url.trim();
  if (data.linkedin_url && data.linkedin_url.trim()) validData.linkedin_url = data.linkedin_url.trim();
  
  // Como nos conheceu
  if (data.how_found_us) validData.how_found_us = data.how_found_us;
  if (data.referred_by && data.referred_by.trim()) validData.referred_by = data.referred_by.trim();
  
  // Negócio
  if (data.company_name && data.company_name.trim()) validData.company_name = data.company_name.trim();
  if (data.role && data.role.trim()) validData.role = data.role.trim();
  if (data.company_size) validData.company_size = data.company_size;
  if (data.company_segment) validData.company_segment = data.company_segment;
  if (data.annual_revenue_range) validData.annual_revenue_range = data.annual_revenue_range;
  if (data.company_website && data.company_website.trim()) validData.company_website = data.company_website.trim();
  
  // Contexto
  if (data.business_model) validData.business_model = data.business_model;
  if (data.business_challenges && data.business_challenges.length > 0) validData.business_challenges = data.business_challenges;
  if (data.additional_context && data.additional_context.trim()) validData.additional_context = data.additional_context.trim();
  
  console.log('🧹 Dados válidos extraídos:', validData);
  return validData;
};
