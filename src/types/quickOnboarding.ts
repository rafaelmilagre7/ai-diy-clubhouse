
export interface QuickOnboardingData {
  // Etapa 1: Informações Pessoais Básicas
  name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  birth_date?: string;
  
  // Etapa 2: Localização e Redes Sociais
  country: string;
  state: string;
  city: string;
  timezone: string;
  instagram_url?: string;
  linkedin_url?: string;
  
  // Etapa 3: Como nos conheceu
  how_found_us: string;
  referred_by?: string;
  
  // Etapa 4: Informações Profissionais
  company_name: string;
  role: string;
  company_size: string;
  company_segment: string;
  company_website?: string;
  annual_revenue_range: string;
  current_position: string;
  
  // Etapa 5: Contexto do Negócio
  business_model: string;
  main_challenge: string;
  business_challenges: string[];
  short_term_goals: string[];
  medium_term_goals: string[];
  important_kpis: string[];
  additional_context?: string;
  
  // Etapa 6: Objetivos e Metas
  main_goal: string;
  primary_goal: string;
  expected_outcomes: string[];
  expected_outcome_30days: string;
  priority_solution_type: string;
  how_implement: string;
  week_availability: string;
  content_formats: string[];
  
  // Etapa 7: Experiência com IA
  ai_knowledge_level: string;
  uses_ai: string;
  previous_tools: string[];
  has_implemented: string;
  desired_ai_areas: string[];
  completed_formation?: boolean;
  is_member_for_month?: boolean;
  nps_score?: number;
  improvement_suggestions?: string;
  
  // Etapa 8: Personalização da Experiência
  interests: string[];
  time_preference: string[];
  available_days: string[];
  networking_availability?: number;
  skills_to_share: string[];
  mentorship_topics: string[];
  
  // Campos de controle
  live_interest?: number;
  authorize_case_usage?: boolean;
  interested_in_interview?: boolean;
  priority_topics: string[];
}

export interface OnboardingStepProps {
  data: QuickOnboardingData;
  onUpdate: (field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => void;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}
