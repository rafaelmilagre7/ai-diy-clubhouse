
export interface OnboardingData {
  // Etapa 1 - Informações básicas
  name?: string;
  nickname?: string;
  
  // Etapa 2 - Perfil (Club/Formação específico)
  // Para Club Members
  businessStage?: 'idea' | 'startup' | 'growth' | 'established' | '';
  businessArea?: string;
  teamSize?: 'solo' | 'small' | 'medium' | 'large' | '';
  
  // Para Formação Members
  educationLevel?: 'student' | 'graduate' | 'postgraduate' | 'professional' | '';
  studyArea?: string;
  institution?: string;
  
  // Etapa 3 - Mercado/Área de Atuação
  targetMarket?: string;
  mainChallenges?: string[];
  currentTools?: string[];
  
  // Etapa 4 - Experiência com IA
  aiExperience?: 'none' | 'basic' | 'intermediate' | 'advanced' | '';
  aiToolsUsed?: string[];
  aiChallenges?: string[];
  
  // Etapa 5 - Objetivos
  primaryGoals?: string[];
  timeframe?: '1month' | '3months' | '6months' | '1year' | '';
  successMetrics?: string[];
  
  // Etapa 6 - Personalização
  communicationStyle?: 'formal' | 'casual' | 'technical' | 'creative';
  learningPreference?: 'visual' | 'hands-on' | 'reading' | 'video';
  contentTypes?: string[];
  
  // Metadados
  memberType?: 'club' | 'formacao';
  completedAt?: string;
  startedAt?: string;
}

export interface OnboardingStepProps {
  data: OnboardingData;
  onUpdateData: (stepData: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  memberType: 'club' | 'formacao';
  userProfile?: any;
}
