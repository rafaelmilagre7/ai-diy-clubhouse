
// Interfaces para o onboarding
export interface OnboardingData {
  personal_info?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  professional_info?: {
    company_name?: string;
    company_size?: string;
    company_sector?: string;
    company_website?: string;
    current_position?: string;
    annual_revenue?: string;
  };
  business_context?: {
    business_model?: string;
    business_challenges?: string[];
    short_term_goals?: string[];
    medium_term_goals?: string[];
    important_kpis?: string[];
    additional_context?: string;
  };
  ai_experience?: {
    ai_knowledge_level?: string;
    used_ai_tools?: string[];
    desired_ai_areas?: string[];
    expectations?: string;
  };
  business_goals?: {
    target_market?: string;
    main_goal?: string;
    expected_outcomes?: string[];
    expected_outcome_30days?: string;
    expected_outcome_60days?: string;
    expected_outcome_90days?: string;
  };
  experience_personalization?: {
    implementation_speed?: string;
    support_level?: string;
    technical_expertise?: string;
    priority_areas?: string[];
  };
  complementary_info?: {
    how_discovered?: string;
    referral_name?: string;
    authorize_testimonials?: boolean;
    authorize_case_studies?: boolean;
    interested_in_interviews?: boolean;
  };
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_completed: boolean;
  completed_steps: string[];
  current_step: string;

  // Campos de dados
  personal_info: any;
  professional_info: any;
  business_data: any;  // Versão legada
  business_context: any; // Versão atual
  ai_experience: any;
  business_goals: any;
  experience_personalization: any;
  complementary_info: any;
  industry_focus: any;
  resources_needs: any;
  team_info: any;
  implementation_preferences: any;

  // Campos diretos para compatibilidade
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  current_position?: string;
  annual_revenue?: string;
}
