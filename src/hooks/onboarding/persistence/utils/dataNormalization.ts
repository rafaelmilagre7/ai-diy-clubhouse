
import { OnboardingProgress } from "@/types/onboarding";

export const normalizeField = (value: any, fieldName: string): any => {
  if (typeof value === 'string' && value.trim() !== '') {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn(`Campo ${fieldName} é string mas não é JSON válido, inicializando como objeto vazio`);
      return {};
    }
  }
  return value === null ? {} : value;
};

export const normalizeWebsite = (website: string | undefined): string | undefined => {
  if (website && typeof website === 'string' && !website.match(/^https?:\/\//)) {
    return `https://${website}`;
  }
  return website;
};

export const normalizeDDI = (ddi: string | undefined): string | undefined => {
  if (ddi) {
    return "+" + ddi.replace(/\+/g, '').replace(/\D/g, '');
  }
  return ddi;
};

export const normalizeArrayField = (value: any[]): any[] => {
  if (!Array.isArray(value)) {
    return [value];
  }
  return value;
};

export const normalizeAIExperience = (aiExp: any) => {
  let normalizedAIExp = aiExp;
  
  if (typeof aiExp === 'string' && aiExp.trim() !== '') {
    try {
      normalizedAIExp = JSON.parse(aiExp);
    } catch (e) {
      console.warn("Erro ao processar ai_experience:", e);
      normalizedAIExp = {};
    }
  }

  // Garantir que os campos são arrays
  if (normalizedAIExp) {
    if (normalizedAIExp.desired_ai_areas && !Array.isArray(normalizedAIExp.desired_ai_areas)) {
      normalizedAIExp.desired_ai_areas = [normalizedAIExp.desired_ai_areas];
    }
    if (normalizedAIExp.previous_tools && !Array.isArray(normalizedAIExp.previous_tools)) {
      normalizedAIExp.previous_tools = [normalizedAIExp.previous_tools];
    }
  }

  return normalizedAIExp;
};

export const normalizeBusinessGoals = (data: any) => {
  let normalizedGoals = data;
  
  // Verificar se é undefined ou null
  if (data === undefined || data === null) {
    return {};
  }
  
  // Converter de string para objeto se necessário
  if (typeof data === 'string' && data.trim() !== '') {
    try {
      normalizedGoals = JSON.parse(data);
    } catch (e) {
      console.warn("Erro ao processar business_goals:", e);
      normalizedGoals = {};
    }
  }
  
  // Se for objeto vazio, retornar objeto vazio
  if (!normalizedGoals || (typeof normalizedGoals === 'object' && Object.keys(normalizedGoals).length === 0)) {
    return {};
  }
  
  // Garantir que content_formats é sempre array
  if (normalizedGoals.content_formats) {
    if (!Array.isArray(normalizedGoals.content_formats)) {
      normalizedGoals.content_formats = [normalizedGoals.content_formats];
    }
  } else {
    normalizedGoals.content_formats = [];
  }
  
  // Garantir que expected_outcomes é sempre array
  if (normalizedGoals.expected_outcomes) {
    if (!Array.isArray(normalizedGoals.expected_outcomes)) {
      normalizedGoals.expected_outcomes = [normalizedGoals.expected_outcomes];
    }
  } else {
    normalizedGoals.expected_outcomes = [];
  }
  
  // Sincronizar expected_outcome_30days com expected_outcomes
  if (normalizedGoals.expected_outcome_30days && 
      (!normalizedGoals.expected_outcomes || normalizedGoals.expected_outcomes.length === 0)) {
    normalizedGoals.expected_outcomes = [normalizedGoals.expected_outcome_30days];
  } else if (normalizedGoals.expected_outcomes && 
             Array.isArray(normalizedGoals.expected_outcomes) && 
             normalizedGoals.expected_outcomes.length > 0 && 
             !normalizedGoals.expected_outcome_30days) {
    normalizedGoals.expected_outcome_30days = normalizedGoals.expected_outcomes[0];
  }
  
  // Converter live_interest para número
  if (normalizedGoals.live_interest !== undefined) {
    normalizedGoals.live_interest = Number(normalizedGoals.live_interest);
    if (isNaN(normalizedGoals.live_interest)) {
      normalizedGoals.live_interest = 5; // Valor padrão
    }
  }
  
  return normalizedGoals;
};
