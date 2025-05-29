
// Tipo para dados do Quick Onboarding
export interface QuickOnboardingData {
  // Dados pessoais
  name: string;
  email: string;
  whatsapp: string;
  howFoundUs: string;
  
  // Dados do negócio
  company: string;
  sector: string;
  
  // Experiência com IA
  aiKnowledge: number;
  usesAI: string;
  mainGoal: string;
}

// Tipo para dados expandidos que incluem campos do banco
export interface ExpandedQuickOnboardingData {
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
}

// Adapter para converter QuickOnboardingData para formato do banco
export const adaptQuickDataToDatabase = (data: QuickOnboardingData) => {
  return {
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    how_found_us: data.howFoundUs,
    company_name: data.company,
    company_segment: data.sector,
    ai_knowledge: data.aiKnowledge,
    uses_ai: data.usesAI,
    main_goal: data.mainGoal,
    country_code: '+55' // Default para Brasil
  };
};

// Adapter para converter dados do banco para QuickOnboardingData
export const adaptDatabaseToQuickData = (dbData: any): QuickOnboardingData => {
  return {
    name: dbData.name || '',
    email: dbData.email || '',
    whatsapp: dbData.whatsapp || '',
    howFoundUs: dbData.how_found_us || '',
    company: dbData.company_name || '',
    sector: dbData.company_segment || '',
    aiKnowledge: dbData.ai_knowledge || 5,
    usesAI: dbData.uses_ai || '',
    mainGoal: dbData.main_goal || ''
  };
};
