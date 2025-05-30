
export interface QuickOnboardingData {
  name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  how_found_us: string;
  referred_by?: string;
  instagram_url?: string;
  linkedin_url?: string;
  company_name: string;
  role: string;
  company_size: string;
  company_segment: string;
  company_website?: string;
  annual_revenue_range: string;
  main_challenge: string;
  ai_knowledge_level: string;
  uses_ai: string;
  main_goal: string;
}

export interface OnboardingStepProps {
  data: QuickOnboardingData;
  onUpdate: (field: keyof QuickOnboardingData, value: string) => void;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}
