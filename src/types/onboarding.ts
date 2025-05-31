
// Tipos base para o sistema de onboarding moderno
export interface OnboardingData {
  // Informações pessoais
  personal_info?: {
    name?: string;
    email?: string;
    whatsapp?: string;
    country_code?: string;
    birth_date?: string;
    phone?: string;
    ddi?: string;
    city?: string;
    state?: string;
    country?: string;
    linkedin?: string;
    instagram?: string;
    timezone?: string;
  };
  
  // Informações profissionais
  professional_info?: {
    company_name?: string;
    role?: string;
    company_size?: string;
    company_segment?: string;
    company_website?: string;
    annual_revenue_range?: string;
    current_position?: string;
  };
  
  // Contexto do negócio
  business_context?: {
    business_model?: string;
    business_challenges?: string[];
    short_term_goals?: string[];
    medium_term_goals?: string[];
    important_kpis?: string[];
    additional_context?: string;
  };
  
  // Objetivos de negócio
  business_goals?: {
    primary_goal?: string;
    expected_outcomes?: string[];
    expected_outcome_30days?: string;
    priority_solution_type?: string;
    how_implement?: string;
    week_availability?: string;
    content_formats?: string[];
    timeline?: string;
    live_interest?: number;
  };
  
  // Experiência com IA
  ai_experience?: {
    ai_knowledge_level?: string;
    knowledge_level?: string; // compatibilidade
    previous_tools?: string[];
    has_implemented?: string;
    desired_ai_areas?: string[];
    completed_formation?: boolean;
    is_member_for_month?: boolean;
    nps_score?: number;
    improvement_suggestions?: string;
  };
  
  // Personalização da experiência
  experience_personalization?: {
    interests?: string[];
    time_preference?: string[];
    available_days?: string[];
    days_available?: string[];
    preferred_times?: string[];
    networking_availability?: number;
    networking_level?: number;
    skills_to_share?: string[];
    shareable_skills?: string[];
    mentorship_topics?: string[];
    authorize_case_usage?: boolean;
    interested_in_interview?: boolean;
    priority_topics?: string[];
  };
  
  // Informações complementares
  complementary_info?: {
    how_found_us?: string;
    referred_by?: string;
    country?: string;
    state?: string;
    city?: string;
    timezone?: string;
    instagram_url?: string;
    linkedin_url?: string;
  };
  
  // Dados de formação (se aplicável)
  formation_data?: {
    [key: string]: any;
  };
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  current_step: string;
  is_completed: boolean;
  completed_steps: string[];
  personal_info?: any;
  professional_info?: any;
  business_context?: any;
  business_goals?: any;
  ai_experience?: any;
  experience_personalization?: any;
  complementary_info?: any;
  formation_data?: any;
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  current_position?: string;
  annual_revenue?: string;
  sync_status?: string;
  last_sync_at?: string;
  metadata?: any;
  debug_logs?: any[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Interface para os steps do onboarding
export interface OnboardingStepData {
  stepId: string;
  title: string;
  description?: string;
  isRequired: boolean;
  data: Partial<OnboardingData>;
}

// Props para steps do onboarding
export interface OnboardingStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  initialData?: OnboardingData;
  isLastStep?: boolean;
  onComplete?: () => void;
}

// Tipos para informações pessoais
export interface PersonalInfoData {
  name?: string;
  email?: string;
  whatsapp?: string;
  country_code?: string;
  birth_date?: string;
  phone?: string;
  ddi?: string;
  city?: string;
  state?: string;
  country?: string;
  linkedin?: string;
  instagram?: string;
  timezone?: string;
}

// Tipos para dados profissionais
export interface ProfessionalDataInput {
  company_name?: string;
  role?: string;
  company_size?: string;
  company_segment?: string;
  company_website?: string;
  annual_revenue_range?: string;
  current_position?: string;
}

// Tipo para steps do onboarding (compatibilidade)
export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  data: Partial<OnboardingData>;
}
