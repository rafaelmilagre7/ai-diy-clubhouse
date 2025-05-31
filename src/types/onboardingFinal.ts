
export interface OnboardingFinalData {
  // Etapa 1 - Informações Pessoais
  personal_info: {
    name: string;
    email: string;
    whatsapp: string;
    country_code: string;
    birth_date?: string;
  };
  
  // Etapa 2 - Localização
  location_info: {
    country: string;
    state: string;
    city: string;
    instagram_url?: string;
    linkedin_url?: string;
  };
  
  // Etapa 3 - Como nos conheceu
  discovery_info: {
    how_found_us: string;
    referred_by?: string;
  };
  
  // Etapa 4 - Informações do Negócio
  business_info: {
    company_name: string;
    role: string;
    company_size: string;
    company_sector: string;
    company_website?: string;
    annual_revenue: string;
    current_position?: string;
  };
  
  // Etapa 5 - Contexto do Negócio
  business_context: {
    business_model: string;
    business_challenges: string[];
    short_term_goals?: string[];
    medium_term_goals?: string[];
    important_kpis?: string[];
    additional_context?: string;
  };
  
  // Etapa 6 - Objetivos e Metas
  goals_info: {
    primary_goal: string;
    expected_outcomes?: string[];
    expected_outcome_30days: string;
    priority_solution_type?: string;
    how_implement?: string;
    week_availability?: string;
    content_formats?: string[];
  };
  
  // Etapa 7 - Experiência com IA
  ai_experience: {
    ai_knowledge_level: string;
    previous_tools?: string[];
    has_implemented: string;
    desired_ai_areas?: string[];
    completed_formation?: boolean;
    is_member_for_month?: boolean;
    nps_score?: number;
    improvement_suggestions?: string;
  };
  
  // Etapa 8 - Personalização
  personalization: {
    interests?: string[];
    time_preference?: string[];
    available_days?: string[];
    networking_availability?: number;
    skills_to_share?: string[];
    mentorship_topics?: string[];
    live_interest?: number;
    authorize_case_usage?: boolean;
    interested_in_interview?: boolean;
    priority_topics?: string[];
  };
}

export interface OnboardingFinalState extends OnboardingFinalData {
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
}

export interface OnboardingStepComponentProps {
  data: OnboardingFinalData;
  onUpdate: (section: keyof OnboardingFinalData, updates: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}
