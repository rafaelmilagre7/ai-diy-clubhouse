
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
  // Campos separados para salvar parcialmente
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  curiosity?: string;
  profilePicture?: string; // Nova foto de perfil opcional
  
  // Etapa 2 - Perfil Empresarial
  companyName?: string;
  companyWebsite?: string;
  businessSector?: string;
  companySize?: string;
  annualRevenue?: string;
  position?: string;
  
  // Etapa 3 - Maturidade em IA
  hasImplementedAI?: string;
  aiToolsUsed?: string[];
  aiKnowledgeLevel?: string;
  dailyTools?: string[];
  whoWillImplement?: string;
  
  // Etapa 4 - Objetivos e Expectativas
  mainObjective?: string;
  areaToImpact?: string;
  expectedResult90Days?: string;
  aiImplementationBudget?: string;
  
  // Etapa 5 - Personalização da Experiência
  weeklyLearningTime?: string;
  contentPreference?: string[]; // Corrigido para array
  wantsNetworking?: string;
  bestDays?: string[]; // Novo campo obrigatório
  bestPeriods?: string[]; // Novo campo obrigatório
  acceptsCaseStudy?: string; // Novo campo obrigatório
  
  // Metadados
  memberType?: 'club' | 'formacao';
  completedAt?: string;
  startedAt?: string;
  updatedAt?: string;
  
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
