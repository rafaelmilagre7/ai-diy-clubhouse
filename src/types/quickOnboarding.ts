
export interface QuickOnboardingData {
  // Etapa 1 - Informações Pessoais
  name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  birth_date?: string;
  
  // Etapa 2 - Localização e Redes
  country: string;
  state: string;
  city: string;
  timezone: string;
  instagram_url?: string;
  linkedin_url?: string;
  
  // Etapa 3 - Como nos conheceu
  how_found_us: string;
  referred_by?: string;
  
  // Etapa 4 - Seu negócio
  company_name: string;
  role: string;
  company_size: string;
  company_segment: string;
  company_website?: string;
  annual_revenue_range: string;
  current_position?: string;
  
  // Etapa 5 - Contexto do negócio
  business_model: string;
  business_challenges: string[];
  short_term_goals?: string[];
  medium_term_goals?: string[];
  important_kpis?: string[];
  additional_context?: string;
  
  // Etapa 6 - Objetivos e metas
  primary_goal: string;
  expected_outcomes?: string[];
  expected_outcome_30days: string;
  priority_solution_type?: string;
  how_implement?: string;
  week_availability?: string;
  content_formats?: string[];
  
  // Etapa 7 - Experiência com IA
  ai_knowledge_level: string;
  previous_tools?: string[];
  has_implemented: string;
  desired_ai_areas?: string[];
  completed_formation?: boolean;
  is_member_for_month?: boolean;
  nps_score?: number;
  improvement_suggestions?: string;
  
  // Etapa 8 - Personalização
  interests?: string[];
  time_preference?: string[];
  available_days?: string[];
  networking_availability?: number;
  skills_to_share?: string[];
  mentorship_topics?: string[];
  
  // Campos de controle
  live_interest?: number;
  authorize_case_usage?: boolean;
  interested_in_interview?: boolean;
  priority_topics?: string[];
  
  // Campos internos para controle
  currentStep?: string | number;
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
