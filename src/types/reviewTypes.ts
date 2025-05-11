
import { OnboardingProgress } from "./onboarding";

// Tipo para representar dados processados para a revisão
export type ReviewData = OnboardingProgress;

// Interface para dados processados de analytics
export interface AnalyticsInsight {
  key: string;
  label: string;
  value: string | number;
  type?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}

export interface SectionAnalytics {
  completeness: number;
  insights: AnalyticsInsight[];
}

export interface OnboardingAnalytics {
  personal: SectionAnalytics;
  professional: SectionAnalytics;
  business: SectionAnalytics;
  goals: SectionAnalytics;
  experience: SectionAnalytics;
  preferences: SectionAnalytics;
  complementary: SectionAnalytics;
  overall: {
    score: number;
    completedSections: number;
    totalSections: number;
    nextSteps: string[];
  };
}
