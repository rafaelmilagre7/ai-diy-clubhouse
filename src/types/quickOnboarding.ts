
// Tipo completo para dados do Quick Onboarding com todos os campos necessários
export interface QuickOnboardingData {
  // Dados pessoais básicos
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

  // Campos de compatibilidade (mantidos para não quebrar código existente)
  howFoundUs?: string; // Alias para how_found_us
  company?: string; // Alias para company_name
  sector?: string; // Alias para company_segment
  aiKnowledge?: number; // Alias para ai_knowledge_level
  usesAI?: string; // Alias para uses_ai
  mainGoal?: string; // Alias para main_goal
}

// Tipo para dados expandidos que incluem campos do banco (mantido para compatibilidade)
export interface ExpandedQuickOnboardingData extends QuickOnboardingData {
  // Todos os campos já estão na interface principal
}

// Adapter para converter QuickOnboardingData para formato do banco
export const adaptQuickDataToDatabase = (data: QuickOnboardingData) => {
  return {
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    country_code: data.country_code || '+55',
    birth_date: data.birth_date || null,
    instagram_url: data.instagram_url || '',
    linkedin_url: data.linkedin_url || '',
    how_found_us: data.how_found_us || data.howFoundUs || '',
    referred_by: data.referred_by || '',
    company_name: data.company_name || data.company || '',
    role: data.role || '',
    company_size: data.company_size || '',
    company_segment: data.company_segment || data.sector || '',
    company_website: data.company_website || '',
    annual_revenue_range: data.annual_revenue_range || '',
    main_challenge: data.main_challenge || '',
    ai_knowledge_level: data.ai_knowledge_level || data.aiKnowledge?.toString() || '',
    uses_ai: data.uses_ai || data.usesAI || '',
    main_goal: data.main_goal || data.mainGoal || ''
  };
};

// Adapter para converter dados do banco para QuickOnboardingData
export const adaptDatabaseToQuickData = (dbData: any): QuickOnboardingData => {
  return {
    name: dbData.name || '',
    email: dbData.email || '',
    whatsapp: dbData.whatsapp || '',
    country_code: dbData.country_code || '+55',
    birth_date: dbData.birth_date || '',
    instagram_url: dbData.instagram_url || '',
    linkedin_url: dbData.linkedin_url || '',
    how_found_us: dbData.how_found_us || '',
    referred_by: dbData.referred_by || '',
    company_name: dbData.company_name || '',
    role: dbData.role || '',
    company_size: dbData.company_size || '',
    company_segment: dbData.company_segment || '',
    company_website: dbData.company_website || '',
    annual_revenue_range: dbData.annual_revenue_range || '',
    main_challenge: dbData.main_challenge || '',
    ai_knowledge_level: dbData.ai_knowledge_level || '',
    uses_ai: dbData.uses_ai || '',
    main_goal: dbData.main_goal || '',
    
    // Campos de compatibilidade
    howFoundUs: dbData.how_found_us || '',
    company: dbData.company_name || '',
    sector: dbData.company_segment || '',
    aiKnowledge: parseInt(dbData.ai_knowledge_level) || 5,
    usesAI: dbData.uses_ai || '',
    mainGoal: dbData.main_goal || ''
  };
};
