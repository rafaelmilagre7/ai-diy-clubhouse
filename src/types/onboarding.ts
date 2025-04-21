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
    timeline?: string;
  };
  ai_experience: {
    knowledge_level?: string;
    previous_tools?: string[];
    implemented_solutions?: string[];
    desired_solutions?: string[];
    previous_attempts?: string;
    completed_formation?: boolean;
    is_member_for_month?: boolean;
    nps_score?: number;
    improvement_suggestions?: string;
  };
  industry_focus: {
    sector?: string;
    target_market?: string;
    main_challenges?: string[];
  };
  resources_needs: {
    budget_range?: string;
    team_size?: string;
    tech_stack?: string[];
  };
  team_info: {
    decision_makers?: string[];
    technical_expertise?: string;
    training_needs?: string[];
  };
  implementation_preferences: {
    priority_areas?: string[];
    implementation_speed?: string;
    support_level?: string;
  };
  experience_personalization: {
    interests?: string[]; // interesses em IA
    time_preference?: string; // manhã, tarde, noite
    available_days?: string[]; // dias da semana
    networking_availability?: number; // slider de 0 a 10
    skills_to_share?: string[]; // habilidades do usuário
    mentorship_topics?: string[]; // tópicos em que quer mentoria
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
  business_context: OnboardingData['business_context'];
  business_goals: OnboardingData['business_goals'];
  ai_experience: OnboardingData['ai_experience'];
  industry_focus: OnboardingData['industry_focus'];
  resources_needs: OnboardingData['resources_needs'];
  team_info: OnboardingData['team_info'];
  implementation_preferences: OnboardingData['implementation_preferences'];
  experience_personalization: OnboardingData['experience_personalization'];
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  current_position?: string;
  annual_revenue?: string;
}

export interface OnboardingStepProps {
  onSubmit: (stepId: string, data: any) => void;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
  initialData?: any;
  personalInfo?: OnboardingData['personal_info'];
}
