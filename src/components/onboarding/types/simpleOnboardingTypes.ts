export interface SimpleOnboardingData {
  // Informações Essenciais (Passo 1)
  name?: string;
  email?: string;
  phone?: string;
  
  // Contexto Profissional (Passo 2)
  company_name?: string;
  role?: string;
  company_size?: string;
  main_challenge?: string;
  
  // Finalização (Passo 3)
  goals?: string[];
  expectations?: string;
  
  // Controle
  current_step?: number;
  is_completed?: boolean;
  completed_at?: string;
}

export interface SimpleOnboardingStepProps {
  data: SimpleOnboardingData;
  onNext: () => void;
  onPrev?: () => void;
  onUpdateData: (stepData: Partial<SimpleOnboardingData>) => void;
}