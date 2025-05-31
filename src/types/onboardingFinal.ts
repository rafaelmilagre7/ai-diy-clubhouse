
export interface OnboardingPersonalInfo {
  name: string;
  email: string;
  whatsapp?: string;
  country_code?: string;
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
  previous_tools?: string[];
  has_implemented?: string;
  desired_ai_areas?: string[];
  completed_formation?: boolean;
  is_member_for_month?: boolean;
  nps_score?: number;
  improvement_suggestions?: string;
  implemented_solutions?: string[];
  desired_solutions?: string[];
  previous_attempts?: string;
  ai_tools?: string[];
  suggestions?: string;
}

export interface OnboardingPersonalization {
  interests?: string[];
  time_preference?: string[];
  available_days?: string[];
  networking_availability?: string;
  skills_to_share?: string[];
  mentorship_topics?: string[];
  live_interest?: string;
  authorize_case_usage?: boolean;
  interested_in_interview?: boolean;
  priority_topics?: string[];
  content_formats?: string[];
}

export interface OnboardingFinalData {
  id?: string;
  user_id?: string;
  is_completed?: boolean;
  completed_at?: string;
  personal_info: OnboardingPersonalInfo;
  location_info: OnboardingLocationInfo;
  discovery_info: OnboardingDiscoveryInfo;
  business_info: OnboardingBusinessInfo;
  business_context: OnboardingBusinessContext;
  goals_info: OnboardingGoalsInfo;
  ai_experience: OnboardingAIExperience;
  personalization: OnboardingPersonalization;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingStepComponentProps {
  data: OnboardingFinalData;
  onUpdate: (section: keyof OnboardingFinalData, updates: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
}

export interface CompleteOnboardingResponse {
  success: boolean;
  error?: string;
  wasAlreadyCompleted?: boolean;
  data?: any;
}
