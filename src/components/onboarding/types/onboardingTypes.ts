
export interface OnboardingData {
  // Etapa 1 - Informações pessoais
  name?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  linkedin?: string;
  state?: string;
  city?: string;
  birthDate?: string;
  curiosity?: string;
  
  // Etapa 2 - Perfil Empresarial
  companyName?: string;
  companyWebsite?: string;
  businessSector?: string;
  companySize?: string;
  annualRevenue?: string;
  position?: string;
  
  // Etapa 3 - Maturidade em IA
  hasImplementedAI?: 'yes' | 'no' | 'tried-failed' | '';
  aiToolsUsed?: string[];
  aiKnowledgeLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | '';
  dailyTools?: string[];
  whoWillImplement?: 'myself' | 'team' | 'hire' | '';
  
  // Etapa 4 - Objetivos e Expectativas
  mainObjective?: 'reduce-costs' | 'increase-sales' | 'automate-processes' | 'innovate-products' | '';
  areaToImpact?: string;
  expectedResult90Days?: string;
  aiImplementationBudget?: string;
  
  // Etapa 5 - Personalização da Experiência
  weeklyLearningTime?: string;
  contentPreference?: 'theoretical' | 'hands-on' | '';
  wantsNetworking?: 'yes' | 'no' | '';
  bestDays?: string[];
  bestPeriods?: string[];
  acceptsCaseStudy?: 'yes' | 'no' | '';
  
  // Metadados
  memberType?: 'club' | 'formacao';
  completedAt?: string;
  startedAt?: string;
  
  // IA Interativa - mensagens personalizadas para cada etapa
  aiMessage1?: string;
  aiMessage2?: string;
  aiMessage3?: string;
  aiMessage4?: string;
  aiMessage5?: string;
  aiFinalMessage?: string;
}

export interface OnboardingStepProps {
  data: OnboardingData;
  onUpdateData: (stepData: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev?: () => void;
  memberType: 'club' | 'formacao';
  userProfile?: any;
  validationErrors?: Array<{ field: string; message: string }>;
  getFieldError?: (field: string) => string | undefined;
}
