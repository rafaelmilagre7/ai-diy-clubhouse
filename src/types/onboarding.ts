
// Arquivo mantido para compatibilidade com tipos existentes
// mas com implementação simplificada

export interface OnboardingProgress {
  id: string;
  user_id: string;
  current_step: string;
  is_completed: boolean;
  completed_steps: string[];
  created_at: string;
  updated_at: string;
  // Campos adicionais que podem ser referenciados no código
  [key: string]: any;
}

export interface OnboardingAnalytics {
  user_id: string;
  current_step: string;
  is_completed: boolean;
  started_at: string;
  last_activity: string;
  // Campos flexíveis para compatibilidade
  [key: string]: any;
}
