
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
