
// Tipo para dados do Quick Onboarding
export interface QuickOnboardingData {
  // Dados pessoais
  name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  birth_date?: string;
  instagram_url?: string;
  linkedin_url?: string;
  how_found_us: string;
  referred_by?: string;

  // Dados do negócio
  company_name: string;
  role: string;
  company_size: string;
  company_segment: string;
  company_website?: string;
  annual_revenue_range: string;
  main_challenge: string;

  // Experiência com IA
  ai_knowledge_level: string;
  uses_ai: string;
  main_goal: string;

  // Campos adicionais para compatibilidade
  desired_ai_areas: string[];
  has_implemented: string;
  previous_tools: string[];
}

// Resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Status do onboarding
export interface OnboardingStatus {
  isCompleted: boolean;
  currentStep: number;
  canProceed: boolean;
  canFinalize: boolean;
}
