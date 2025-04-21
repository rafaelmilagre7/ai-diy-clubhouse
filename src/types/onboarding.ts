export interface OnboardingData {
  personal_info: {
    name?: string;
    role?: string;
    company_size?: string;
    email?: string;
    phone?: string;
    ddi?: string;
    linkedin?: string;
    instagram?: string;
    country?: string;
    state?: string;
    city?: string;
    timezone?: string;
  };
  professional_info: {
    company_name?: string;
    company_size?: string;
    company_sector?: string;
    company_website?: string;
    current_position?: string;
    annual_revenue?: string;
  };
  business_context: {
    business_model?: string;
    business_challenges?: string[];
    short_term_goals?: string[];
    medium_term_goals?: string[];
    important_kpis?: string[];
    additional_context?: string;
  };
  business_goals: {
    primary_goal?: string;
    expected_outcomes?: string[];
    expected_outcome_30days?: string; // Campo individual para verificação
    timeline?: string;
    priority_solution_type?: string;
    how_implement?: string;
    week_availability?: string;
    live_interest?: number;
    content_formats?: string[];
  };
  ai_experience: {
    knowledge_level?: string;
    previous_tools?: string[];
    has_implemented?: string; // "sim" | "nao"
    desired_ai_areas?: string[]; // agora array de áreas!
    completed_formation?: boolean;
    is_member_for_month?: boolean;
    nps_score?: number;
    improvement_suggestions?: string;
  };
  experience_personalization: {
    interests?: string[];
    time_preference?: string[];
    available_days?: string[];
    networking_availability?: number;
    skills_to_share?: string[];
    mentorship_topics?: string[];
  };
  complementary_info: {
    how_found_us?: string;
    referred_by?: string;
    authorize_case_usage?: boolean;
    interested_in_interview?: boolean;
    priority_topics?: string[];
  };
  industry_focus?: {
    sector?: string;
    target_market?: string;
    main_challenges?: string[];
  };
  resources_needs?: {
    budget_range?: string;
    team_size?: string;
    tech_stack?: string[];
  };
  team_info?: {
    decision_makers?: string[];
    technical_expertise?: string;
    training_needs?: string[];
  };
  implementation_preferences?: {
    priority_areas?: string[];
    implementation_speed?: string;
    support_level?: string;
  };
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  current_step: string;
  completed_steps: string[];
  is_completed: boolean;
  personal_info: OnboardingData['personal_info'];
  professional_info: OnboardingData['professional_info'];
  business_data: OnboardingData['business_context']; // Mantendo compatibilidade 
  business_context?: OnboardingData['business_context']; // Adicionando nova propriedade para clareza
  business_goals: OnboardingData['business_goals'];
  ai_experience: OnboardingData['ai_experience'];
  experience_personalization: OnboardingData['experience_personalization'];
  complementary_info: OnboardingData['complementary_info'];
  industry_focus?: OnboardingData['industry_focus'];
  resources_needs?: OnboardingData['resources_needs'];
  team_info?: OnboardingData['team_info'];
  implementation_preferences?: OnboardingData['implementation_preferences'];
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  current_position?: string;
  annual_revenue?: string;
  
  // Adicionando as propriedades para a trilha
  trail_solutions?: any[];
  trail_generated_at?: string;
}

export interface OnboardingStepProps {
  onSubmit: (stepId: string, data: any) => void;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
  initialData?: any;
  personalInfo?: OnboardingData['personal_info'];
}

export interface OnboardingStep {
  id: string;
  title: string;
  section: string;
  path: string;
}
