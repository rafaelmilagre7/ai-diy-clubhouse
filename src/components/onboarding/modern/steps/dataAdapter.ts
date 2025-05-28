
import { QuickOnboardingData } from '@/types/quickOnboarding';

// Adaptador para converter QuickOnboardingData para o formato dos componentes originais
export const adaptQuickDataToStepQuemEVoce = (data: QuickOnboardingData) => ({
  name: data.name,
  email: data.email,
  whatsapp: data.whatsapp,
  howFoundUs: data.how_found_us
});

export const adaptQuickDataToStepSeuNegocio = (data: QuickOnboardingData) => ({
  name: data.name,
  companyName: data.company_name,
  role: data.role,
  companySize: data.company_size,
  mainChallenge: data.main_challenge
});

export const adaptQuickDataToStepExperienciaIA = (data: QuickOnboardingData) => ({
  name: data.name,
  aiKnowledge: 5, // Valor padrão, será atualizado pelos componentes
  usesAI: data.uses_ai,
  mainGoal: data.main_goal
});

// Funções para converter de volta os dados dos componentes para QuickOnboardingData
export const adaptStepQuemEVoceToQuickData = (stepData: any): Partial<QuickOnboardingData> => ({
  name: stepData.name,
  email: stepData.email,
  whatsapp: stepData.whatsapp,
  how_found_us: stepData.howFoundUs
});

export const adaptStepSeuNegocioToQuickData = (stepData: any): Partial<QuickOnboardingData> => ({
  company_name: stepData.companyName,
  role: stepData.role,
  company_size: stepData.companySize,
  main_challenge: stepData.mainChallenge
});

export const adaptStepExperienciaIAToQuickData = (stepData: any): Partial<QuickOnboardingData> => ({
  uses_ai: stepData.usesAI,
  main_goal: stepData.mainGoal,
  ai_knowledge_level: stepData.aiKnowledge?.toString() || '5'
});
