
// Types para o sistema de onboarding
export type OnboardingType = 'club' | 'formacao';

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export interface OnboardingData {
  // Etapa 1: Informações Pessoais
  fullName: string;
  preferredName: string;
  email: string;
  phone: string;
  instagram?: string;
  linkedin?: string;
  state: string;
  city: string;
  birthDate: string;
  curiosity: string;
  
  // Etapa 2: Perfil Empresarial
  companyName: string;
  companySite?: string;
  businessSector: string;
  companySize: string;
  annualRevenue: string;
  position: string;
  
  // Etapa 3: Maturidade em IA
  hasImplementedAI: 'yes' | 'no' | 'tried_failed';
  aiSolutions?: string[];
  aiKnowledgeLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  dailyAITool: string;
  implementationResponsible: 'myself' | 'team' | 'hire';
  
  // Etapa 4: Objetivos e Expectativas
  mainObjective: 'reduce_costs' | 'increase_sales' | 'automate_processes' | 'innovate_products';
  targetArea: string;
  expectedResult90Days: string;
  budget: string;
  
  // Etapa 5: Personalização
  weeklyLearningTime: string;
  contentPreference: 'theoretical' | 'hands_on' | 'mixed';
  wantsNetworking: boolean;
  bestMeetingDays: string[];
  bestTimeOfDay: string[];
  acceptsCaseStudy: boolean;
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  data: Partial<OnboardingData>;
  isLoading: boolean;
  completed: boolean;
}

export interface OnboardingStepProps {
  data: Partial<OnboardingData>;
  onDataChange: (newData: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
}

// AI Response types
export interface AIResponse {
  message: string;
  isLoading: boolean;
  error?: string;
}
