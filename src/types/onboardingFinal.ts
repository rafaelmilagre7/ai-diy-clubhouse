
export interface OnboardingPersonalInfo {
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  timezone?: string;
}

export interface OnboardingLocationInfo {
  country?: string;
  state?: string;
  city?: string;
  instagram_url?: string;
  linkedin_url?: string;
}

export interface OnboardingDiscoveryInfo {
  how_found_us?: string;
  referred_by?: string;
}

export interface OnboardingBusinessInfo {
  company_name?: string;
  role?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  annual_revenue?: string;
  current_position?: string;
}

export interface OnboardingBusinessContext {
  business_model?: string;
  business_challenges?: string[];
  short_term_goals?: string[];
  medium_term_goals?: string[];
  important_kpis?: string[];
  additional_context?: string;
}

export interface OnboardingGoalsInfo {
  primary_goal?: string;
  expected_outcomes?: string[];
  expected_outcome_30days?: string;
  priority_solution_type?: string;
  how_implement?: string;
  week_availability?: string;
  content_formats?: string[];
}

export interface OnboardingAIExperience {
  ai_knowledge_level?: string;
  implemented_solutions?: string[];
  desired_solutions?: string[];
  previous_attempts?: string;
  ai_tools?: string[];
  nps_score?: number;
  suggestions?: string;
}

export interface OnboardingPersonalization {
  interests?: string[];
  available_days?: string[];
  time_preference?: string;
  skills_to_share?: string[];
  mentorship_topics?: string[];
  networking_availability?: string;
}

export interface OnboardingFinalData {
  id: string;
  user_id: string;
  is_completed: boolean;
  completed_at?: string;
  personal_info: OnboardingPersonalInfo;
  location_info: OnboardingLocationInfo;
  discovery_info: OnboardingDiscoveryInfo;
  business_info: OnboardingBusinessInfo;
  business_context: OnboardingBusinessContext;
  goals_info: OnboardingGoalsInfo;
  ai_experience: OnboardingAIExperience;
  personalization: OnboardingPersonalization;
  created_at: string;
  updated_at: string;
}
