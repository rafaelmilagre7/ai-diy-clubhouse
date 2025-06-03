
export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
}

export interface AIExperience {
  ai_knowledge_level?: string;
  ai_tools_used?: string[];
  ai_previous_attempts?: string;
  ai_implemented_solutions?: string[];
  ai_desired_solutions?: string[];
  ai_suggestions?: string;
  ai_nps?: number;
}

export interface BusinessInfo {
  company_name?: string;
  company_website?: string;
  current_position?: string;
  company_sector?: string;
  company_size?: string;
  annual_revenue?: string;
}

export interface BusinessContext {
  business_model?: string;
  business_challenges?: string[];
  short_term_goals?: string[];
  medium_term_goals?: string[];
  kpis?: string[];
  additional_context?: string;
}

export interface DiscoveryInfo {
  how_discovered?: string;
  referral_name?: string;
  priority_topics?: string[];
  marketing_consent?: boolean;
  whatsapp_consent?: boolean;
}

export interface GoalsInfo {
  primary_goals?: string[];
  secondary_goals?: string[];
  success_metrics?: string[];
  timeline?: string;
  budget_range?: string;
}

export interface PersonalizationInfo {
  interests?: string[];
  available_days?: string[];
  time_preference?: string;
  networking_availability?: boolean;
  mentorship_topics?: string[];
  skills_to_share?: string[];
}

export interface OnboardingData {
  personal_info?: PersonalInfo;
  ai_experience?: AIExperience;
  business_info?: BusinessInfo;
  business_context?: BusinessContext;
  discovery_info?: DiscoveryInfo;
  goals_info?: GoalsInfo;
  personalization?: PersonalizationInfo;
}

export interface OnboardingProgress {
  id?: string;
  user_id: string;
  personal_info?: PersonalInfo;
  ai_experience?: AIExperience;
  business_info?: BusinessInfo;
  business_context?: BusinessContext;
  discovery_info?: DiscoveryInfo;
  goals_info?: GoalsInfo;
  personalization?: PersonalizationInfo;
  current_step?: string;
  completed_steps?: string[];
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ValidationErrors {
  [key: string]: string | string[] | ValidationErrors;
}

export interface StepProps {
  data: OnboardingData;
  onUpdate: (section: string, data: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
  validationErrors?: ValidationErrors;
}
