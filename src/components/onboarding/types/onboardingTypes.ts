
export interface OnboardingData {
  // Informações pessoais básicas
  name?: string;
  email?: string;
  
  // Informações de contato
  phone?: string;
  phone_country_code?: string;
  
  // Localização
  country?: string;
  state?: string;
  city?: string;
  
  // Redes sociais
  linkedin?: string;
  instagram?: string;
  
  // Informações profissionais
  company_name?: string;
  company_website?: string;
  current_position?: string;
  company_sector?: string;
  company_size?: string;
  annual_revenue?: string;
  
  // Objetivos e interesses
  primary_goal?: string;
  business_challenges?: string[];
  networking_interests?: string[];
  
  // Disponibilidade e conhecimento
  weekly_availability?: string;
  ai_knowledge_level?: number;
  
  // Feedback
  nps_score?: number;
  
  // Metadados do onboarding
  memberType: 'club' | 'formacao';
  startedAt?: string;
  completedAt?: string;
  lastUpdated?: string;
  fromInvite?: boolean;
  inviteToken?: string;
  
  // Propriedades adicionais para compatibilidade com componentes existentes
  curiosity?: string;
  companyName?: string;
  businessSector?: string;
  companySize?: string;
  annualRevenue?: string;
  position?: string;
  hasImplementedAI?: string;
  aiKnowledgeLevel?: number;
  whoWillImplement?: string;
  mainObjective?: string;
  areaToImpact?: string;
  expectedResult90Days?: string;
  aiImplementationBudget?: string;
  weeklyLearningTime?: string;
  contentPreference?: string[];
  wantsNetworking?: string;
  bestDays?: string[];
  bestPeriods?: string[];
  acceptsCaseStudy?: string;
  aiToolsUsed?: string[];
  updatedAt?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  isRequired: boolean;
  order: number;
  memberTypes: ('club' | 'formacao')[];
}

export interface OnboardingConfig {
  steps: OnboardingStep[];
  totalSteps: number;
  currentStep: number;
}

export interface OnboardingWizardProps {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  memberType: 'club' | 'formacao';
  isLoading?: boolean;
}

// Adicionar export que estava faltando
export interface OnboardingStepProps {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  onNext?: () => void;
  onPrev?: () => void;
  memberType: 'club' | 'formacao';
}
