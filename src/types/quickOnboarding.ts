
// Tipo para dados do Quick Onboarding
export interface QuickOnboardingData {
  // Dados pessoais estruturados
  personal_info: {
    name: string;
    email: string;
    whatsapp: string;
    country_code: string;
    birth_date?: string;
    instagram_url?: string;
    linkedin_url?: string;
    how_found_us: string;
    referred_by?: string;
  };

  // Dados profissionais estruturados
  professional_info: {
    company_name: string;
    role: string;
    company_size: string;
    company_segment: string;
    company_website?: string;
    annual_revenue_range: string;
    main_challenge: string;
  };

  // Experiência com IA estruturada
  ai_experience: {
    ai_knowledge_level: string;
    uses_ai: string;
    main_goal: string;
    desired_ai_areas: string[];
    has_implemented: string;
    previous_tools: string[];
  };

  // Campos legados para compatibilidade (serão removidos gradualmente)
  name?: string;
  email?: string;
  whatsapp?: string;
  country_code?: string;
  birth_date?: string;
  instagram_url?: string;
  linkedin_url?: string;
  how_found_us?: string;
  referred_by?: string;
  company_name?: string;
  role?: string;
  company_size?: string;
  company_segment?: string;
  company_website?: string;
  annual_revenue_range?: string;
  main_challenge?: string;
  ai_knowledge_level?: string;
  uses_ai?: string;
  main_goal?: string;
  desired_ai_areas?: string[];
  has_implemented?: string;
  previous_tools?: string[];
}

// Resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Status do onboarding com tipos seguros
export interface OnboardingStatus {
  isCompleted: boolean;
  currentStep: number;
  canProceed: boolean;
  canFinalize: boolean;
  lastSaveTime: number | null;
}

// Etapas do onboarding
export interface OnboardingStep {
  id: number;
  key: string;
  title: string;
  description: string;
  isComplete: boolean;
  isAccessible: boolean;
}
