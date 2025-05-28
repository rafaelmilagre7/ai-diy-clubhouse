
import { QuickOnboardingData } from '@/types/quickOnboarding';

// Adaptador para converter QuickOnboardingData para o formato dos componentes originais
export const adaptQuickDataToStepQuemEVoce = (data: QuickOnboardingData) => ({
  name: data.name,
  email: data.email,
  whatsapp: data.whatsapp,
  country_code: data.country_code,
  birth_date: data.birth_date,
  instagram_url: data.instagram_url,
  linkedin_url: data.linkedin_url,
  howFoundUs: data.how_found_us,
  referred_by: data.referred_by
});

export const adaptQuickDataToStepSeuNegocio = (data: QuickOnboardingData) => ({
  name: data.name,
  companyName: data.company_name,
  role: data.role,
  companySize: data.company_size,
  company_segment: data.company_segment,
  company_website: data.company_website,
  annual_revenue_range: data.annual_revenue_range,
  mainChallenge: data.main_challenge
});

export const adaptQuickDataToStepExperienciaIA = (data: QuickOnboardingData) => ({
  name: data.name,
  aiKnowledge: data.ai_knowledge_level,
  usesAI: data.uses_ai,
  mainGoal: data.main_goal
});

// Funções para converter de volta os dados dos componentes para QuickOnboardingData
export const adaptStepQuemEVoceToQuickData = (stepData: any): Partial<QuickOnboardingData> => ({
  name: stepData.name,
  email: stepData.email,
  whatsapp: stepData.whatsapp,
  country_code: stepData.country_code,
  birth_date: stepData.birth_date,
  instagram_url: stepData.instagram_url,
  linkedin_url: stepData.linkedin_url,
  how_found_us: stepData.howFoundUs,
  referred_by: stepData.referred_by
});

export const adaptStepSeuNegocioToQuickData = (stepData: any): Partial<QuickOnboardingData> => ({
  company_name: stepData.companyName,
  role: stepData.role,
  company_size: stepData.companySize,
  company_segment: stepData.company_segment,
  company_website: stepData.company_website,
  annual_revenue_range: stepData.annual_revenue_range,
  main_challenge: stepData.mainChallenge
});

export const adaptStepExperienciaIAToQuickData = (stepData: any): Partial<QuickOnboardingData> => ({
  uses_ai: stepData.usesAI,
  main_goal: stepData.mainGoal,
  ai_knowledge_level: stepData.aiKnowledge?.toString() || stepData.aiKnowledge || ''
});
