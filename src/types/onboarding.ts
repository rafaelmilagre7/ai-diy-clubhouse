
export interface OnboardingFormData {
  // Dados pessoais
  name?: string;
  email?: string;
  phone?: string;
  ddi?: string;
  linkedin?: string;
  instagram?: string;
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
  
  // Dados profissionais
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  current_position?: string;
  annual_revenue?: string;
  
  // Contexto do negócio
  business_model?: string;
  business_challenges?: string[];
  short_term_goals?: string[];
  medium_term_goals?: string[];
  important_kpis?: string[];
  additional_context?: string;
  
  // Objetivos de negócio
  primary_goal?: string;
  expected_outcomes?: string[];
  expected_outcome_30days?: string;
  timeline?: string;
  priority_solution_type?: string;
  how_implement?: string;
  week_availability?: string;
  live_interest?: number;
  content_formats?: string[];
  
  // Experiência com IA
  knowledge_level?: string;
  previous_tools?: string[];
  has_implemented?: string;
  desired_ai_areas?: string[];
  completed_formation?: boolean;
  is_member_for_month?: boolean;
  nps_score?: number;
  improvement_suggestions?: string;
  
  // Personalização da experiência
  interests?: string[];
  time_preference?: string[];
  available_days?: string[];
  networking_availability?: number;
  skills_to_share?: string[];
  mentorship_topics?: string[];
  
  // Complementares
  how_found_us?: string;
  referred_by?: string;
  authorize_case_usage?: boolean;
  interested_in_interview?: boolean;
  priority_topics?: string[];
}

export interface OnboardingData extends OnboardingFormData {
  id: string;
  user_id: string;
  current_step: string;
  completed_steps: string[];
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  fields: Array<keyof OnboardingFormData>;
  isCompleted: (data: OnboardingFormData) => boolean;
}
