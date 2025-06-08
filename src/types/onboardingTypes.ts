
/**
 * Tipos TypeScript para o sistema de onboarding
 * FASE 3: Steps interativos para coleta de dados
 */

export interface OnboardingStepData {
  welcome?: {
    hasWatched: boolean;
    agreedToTerms: boolean;
  };
  profile?: {
    name: string;
    currentPosition: string;
    companyName: string;
    companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    linkedin?: string;
    instagram?: string;
  };
  preferences?: {
    interestedCategories: string[];
    priorityTools: string[];
    learningStyle: 'visual' | 'hands-on' | 'reading' | 'mixed';
    timeAvailability: 'low' | 'medium' | 'high';
  };
  goals?: {
    primaryGoal: 'automation' | 'growth' | 'efficiency' | 'learning' | 'innovation';
    shortTermGoals: string[];
    timeline: '1month' | '3months' | '6months' | '1year';
    successMetrics: string[];
  };
  completion?: {
    wantsNewsletter: boolean;
    interestedInMentoring: boolean;
    additionalFeedback?: string;
  };
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  data: OnboardingStepData;
  isLoading: boolean;
  errors: Record<string, string>;
}

export type OnboardingStepType = 'welcome' | 'profile' | 'preferences' | 'goals' | 'completion';

export interface StepConfig {
  id: OnboardingStepType;
  title: string;
  description: string;
  icon: string;
  isOptional?: boolean;
  validationRequired?: boolean;
}

export interface OnboardingWizardProps {
  onComplete: (data: OnboardingStepData) => Promise<void>;
  onSkip?: () => void;
}
