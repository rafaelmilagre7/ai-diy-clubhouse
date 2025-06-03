
export interface QuickOnboardingData {
  // Etapa 1: Informações Pessoais
  name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  birth_date?: string;
  instagram_url?: string;
  linkedin_url?: string;
  how_found_us: string;
  referred_by?: string;

  // Etapa 2: Negócio
  company_name: string;
  role: string;
  company_size: string;
  company_segment: string;
  company_website?: string;
  annual_revenue_range: string;
  main_challenge: string;

  // Etapa 3: Experiência com IA
  ai_knowledge_level: string;
  uses_ai: string;
  main_goal: string;
}

export interface QuickOnboardingRecord extends QuickOnboardingData {
  id: string;
  user_id: string;
  current_step: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}
