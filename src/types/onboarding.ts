export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  country_code?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
  linkedin?: string;
  instagram?: string;
  ddi?: string;
  whatsapp?: string;
  timezone?: string;
  birth_date?: string;
  _updated_at?: string; // Add this property
}

export interface AIExperience {
  ai_knowledge_level?: string;
  knowledge_level?: string; // compatibilidade
  ai_tools_used?: string[];
  previous_tools?: string[];
  ai_previous_attempts?: string;
  has_implemented?: string;
  ai_implemented_solutions?: string[];
  desired_ai_areas?: string[];
  ai_desired_solutions?: string[];
  ai_suggestions?: string;
  improvement_suggestions?: string;
  ai_nps?: number;
  nps_score?: number;
  completed_formation?: boolean;
  is_member_for_month?: boolean;
  _updated_at?: string; // Add this property
}

export interface BusinessInfo {
  company_name?: string;
  company_website?: string;
  current_position?: string;
  company_sector?: string;
  company_segment?: string;
  company_size?: string;
  annual_revenue?: string;
  annual_revenue_range?: string;
  role?: string;
  _updated_at?: string; // Add this property
}

export interface BusinessContext {
  business_model?: string;
  business_challenges?: string[];
  short_term_goals?: string[];
  medium_term_goals?: string[];
  kpis?: string[];
  important_kpis?: string[];
  additional_context?: string;
  _updated_at?: string; // Add this property
}

export interface DiscoveryInfo {
  how_discovered?: string;
  how_found_us?: string;
  referral_name?: string;
  referred_by?: string;
  priority_topics?: string[];
  marketing_consent?: boolean;
  whatsapp_consent?: boolean;
  authorize_case_usage?: boolean;
  interested_in_interview?: boolean;
  _updated_at?: string; // Add this property
}

export interface GoalsInfo {
  primary_goals?: string[];
  primary_goal?: string;
  secondary_goals?: string[];
  success_metrics?: string[];
  expected_outcomes?: string[];
  expected_outcome_30days?: string;
  timeline?: string;
  budget_range?: string;
  content_formats?: string[];
  priority_solution_type?: string;
  how_implement?: string;
  week_availability?: string;
  live_interest?: number;
  _updated_at?: string; // Add this property
}

export interface PersonalizationInfo {
  interests?: string[];
  available_days?: string[];
  time_preference?: string | string[];
  networking_availability?: boolean | string | number;
  mentorship_topics?: string[];
  skills_to_share?: string[];
  live_interest?: number;
  authorize_case_usage?: boolean; // Add this property
  interested_in_interview?: boolean;
  priority_topics?: string[];
  _updated_at?: string; // Add this property
}

export interface OnboardingData {
  personal_info?: PersonalInfo;
  ai_experience?: AIExperience;
  business_info?: BusinessInfo;
  professional_info?: BusinessInfo; // alias
  business_context?: BusinessContext;
  discovery_info?: DiscoveryInfo;
  complementary_info?: DiscoveryInfo; // alias
  goals_info?: GoalsInfo;
  business_goals?: GoalsInfo; // alias
  personalization?: PersonalizationInfo;
  experience_personalization?: PersonalizationInfo; // alias
  // Campos diretos para compatibilidade
  name?: string;
  email?: string;
  whatsapp?: string;
  how_found_us?: string;
  referred_by?: string;
  primary_goal?: string;
  expected_outcome_30days?: string;
  content_formats?: string[];
  country_code?: string;
  birth_date?: string;
}

export interface OnboardingProgress {
  id?: string;
  user_id: string;
  personal_info?: PersonalInfo;
  professional_info?: BusinessInfo;
  ai_experience?: AIExperience;
  business_info?: BusinessInfo;
  business_context?: BusinessContext;
  business_goals?: GoalsInfo;
  discovery_info?: DiscoveryInfo;
  goals_info?: GoalsInfo;
  personalization?: PersonalizationInfo;
  experience_personalization?: PersonalizationInfo;
  complementary_info?: DiscoveryInfo;
  current_step?: string;
  completed_steps?: string[];
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
  debug_logs?: any; // Add this property
  // Campos diretos para compatibilidade
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  current_position?: string;
  name?: string;
  email?: string;
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
  onSubmit?: (stepId: string, data: any) => void;
  isSubmitting?: boolean;
  initialData?: OnboardingData;
  isLastStep?: boolean;
  onComplete?: () => void;
}

// Tipos adicionais para compatibilidade
export interface PersonalInfoData extends PersonalInfo {}

export interface ProfessionalDataInput extends BusinessInfo {
  company_segment?: string;
}

export interface OnboardingStepProps extends StepProps {}

export interface OnboardingStep {
  id: string;
  title: string;
  section?: string;
  component: React.ComponentType<any>;
  isCompleted?: boolean;
}

export interface CompleteOnboardingStep extends OnboardingStep {
  section: string;
  path: string;
  forClub?: boolean;
  forFormation?: boolean;
}

export enum OnboardingStepType {
  PERSONAL_INFO = 'personal_info',
  PROFESSIONAL_DATA = 'professional_data',
  BUSINESS_CONTEXT = 'business_context',
  AI_EXPERIENCE = 'ai_experience',
  GOALS = 'goals',
  PERSONALIZATION = 'personalization',
  REVIEW = 'review'
}
