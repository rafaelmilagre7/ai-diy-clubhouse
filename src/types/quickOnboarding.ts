
import { OnboardingFinalData } from './onboardingFinal';

export interface QuickOnboardingData {
  name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  birth_date?: string;
  how_found_us: string;
  howFoundUs?: string; // alias for compatibility
  referred_by?: string;
  primary_goal: string;
  expected_outcome_30days: string;
  content_formats: string[];
  // Additional fields for extended steps
  business_challenges?: string[];
  business_model?: string;
  additional_context?: string;
  previous_tools?: string[];
  desired_ai_areas?: string[];
  ai_knowledge_level?: string;
  has_implemented?: string;
  // Location fields
  country?: string;
  state?: string;
  city?: string;
  instagram_url?: string;
  linkedin_url?: string;
  // Business fields
  company_name?: string;
  role?: string;
  company_size?: string;
  company_segment?: string;
  company_website?: string;
  annual_revenue_range?: string;
  current_position?: string;
  // Goals fields
  priority_solution_type?: string;
  how_implement?: string;
  week_availability?: string;
  short_term_goals?: string[];
  medium_term_goals?: string[];
  important_kpis?: string[];
  expected_outcomes?: string[];
  // AI Experience fields
  completed_formation?: boolean;
  is_member_for_month?: boolean;
  nps_score?: number;
  improvement_suggestions?: string;
  // Personalization fields
  interests?: string[];
  time_preference?: string | string[];
  available_days?: string[];
  skills_to_share?: string[];
  networking_availability?: boolean | string;
  authorize_case_usage?: boolean;
  interested_in_interview?: boolean;
  mentorship_topics?: string[];
  live_interest?: number;
  priority_topics?: string[];
}

export interface OnboardingStepProps {
  data: QuickOnboardingData;
  onUpdate: (field: keyof QuickOnboardingData, value: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}

export interface QuickOnboardingFlowProps {
  onComplete: () => void;
}

// Interface para compatibilidade com steps específicos
export interface StepQuemEVoceProps {
  data: {
    name: string;
    email: string;
    whatsapp: string;
    howFoundUs: string;
  };
  onUpdate: (field: string, value: string) => void;
  onNext: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}
