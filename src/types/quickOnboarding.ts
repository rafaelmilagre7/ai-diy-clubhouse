
// Tipo para dados do Quick Onboarding
export interface QuickOnboardingData {
  // Dados pessoais
  name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  birth_date?: string;
  instagram_url?: string;
  linkedin_url?: string;
  how_found_us: string;
  referred_by?: string;

  // Dados do negócio
  company_name: string;
  role: string;
  company_size: string;
  company_segment: string;
  company_website?: string;
  annual_revenue_range: string;
  main_challenge: string;

  // Experiência com IA
  ai_knowledge_level: string;
  uses_ai: string;
  main_goal: string;

  // Campos adicionais para compatibilidade
  desired_ai_areas: string[];
  has_implemented: string;
  previous_tools: string[];
  
  // Campos de completude (compatibilidade com Supabase)
  is_completed?: boolean | string;
  isCompleted?: boolean | string;
}

// Adapter para converter OnboardingState para QuickOnboardingData
export const adaptOnboardingStateToQuickData = (state: any): QuickOnboardingData => {
  return {
    name: state.name || '',
    email: state.email || '',
    whatsapp: state.whatsapp || '',
    country_code: state.country_code || '',
    birth_date: state.birth_date || '',
    instagram_url: state.instagram_url || '',
    linkedin_url: state.linkedin_url || '',
    how_found_us: state.how_found_us || '',
    referred_by: state.referred_by || '',
    company_name: state.company_name || '',
    role: state.role || '',
    company_size: state.company_size || '',
    company_segment: state.company_segment || '',
    company_website: state.company_website || '',
    annual_revenue_range: state.annual_revenue_range || '',
    main_challenge: state.main_challenge || '',
    ai_knowledge_level: state.ai_knowledge_level || '',
    uses_ai: state.uses_ai || '',
    main_goal: state.main_goal || '',
    desired_ai_areas: state.desired_ai_areas || [],
    has_implemented: state.has_implemented || '',
    previous_tools: state.previous_tools || []
  };
};
