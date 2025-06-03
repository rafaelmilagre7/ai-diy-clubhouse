
import { OnboardingFinalData } from './onboardingFinal';

export interface QuickOnboardingData {
  name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  birth_date?: string;
  how_found_us: string;
  referred_by?: string;
  primary_goal: string;
  expected_outcome_30days: string;
  content_formats: string[];
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
