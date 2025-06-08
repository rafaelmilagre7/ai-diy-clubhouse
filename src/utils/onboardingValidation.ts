
import { OnboardingData } from '@/types/onboarding';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  score: number; // 0-100 para qualidade dos dados
}

export const validateWelcomeStep = (data: Partial<OnboardingData>): ValidationResult => {
  const errors: Record<string, string> = {};
  let score = 0;

  // Campos obrigatórios
  if (!data.fullName?.trim()) {
    errors.fullName = 'Nome completo é obrigatório';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Nome deve ter pelo menos 2 caracteres';
  } else {
    score += 20;
  }

  if (!data.preferredName?.trim()) {
    errors.preferredName = 'Nome de preferência é obrigatório';
  } else {
    score += 15;
  }

  if (!data.email?.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'E-mail deve ter um formato válido';
  } else {
    score += 20;
  }

  if (!data.state) {
    errors.state = 'Estado é obrigatório';
  } else {
    score += 10;
  }

  if (!data.city?.trim()) {
    errors.city = 'Cidade é obrigatória';
  } else {
    score += 10;
  }

  // Campos opcionais que aumentam o score
  if (data.phone?.trim()) score += 5;
  if (data.instagram?.trim()) score += 5;
  if (data.linkedin?.trim()) score += 5;
  if (data.birthDate?.trim()) score += 5;
  if (data.curiosity?.trim()) score += 5;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    score: Math.min(score, 100)
  };
};

export const validateBusinessStep = (data: Partial<OnboardingData>): ValidationResult => {
  const errors: Record<string, string> = {};
  let score = 0;

  if (!data.companyName?.trim()) {
    errors.companyName = 'Nome da empresa é obrigatório';
  } else if (data.companyName.trim().length < 2) {
    errors.companyName = 'Nome da empresa deve ter pelo menos 2 caracteres';
  } else {
    score += 25;
  }

  if (!data.businessSector) {
    errors.businessSector = 'Setor de atuação é obrigatório';
  } else {
    score += 20;
  }

  if (!data.companySize) {
    errors.companySize = 'Tamanho da empresa é obrigatório';
  } else {
    score += 20;
  }

  if (!data.position) {
    errors.position = 'Sua posição na empresa é obrigatória';
  } else {
    score += 20;
  }

  // Campos opcionais
  if (data.companySite?.trim()) score += 5;
  if (data.annualRevenue) score += 10;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    score: Math.min(score, 100)
  };
};

export const validateAIMaturityStep = (data: Partial<OnboardingData>): ValidationResult => {
  const errors: Record<string, string> = {};
  let score = 0;

  if (!data.hasImplementedAI) {
    errors.hasImplementedAI = 'Esta informação é obrigatória';
  } else {
    score += 25;
  }

  if (!data.aiKnowledgeLevel) {
    errors.aiKnowledgeLevel = 'Nível de conhecimento é obrigatório';
  } else {
    score += 25;
  }

  if (!data.dailyAITool) {
    errors.dailyAITool = 'Ferramenta principal é obrigatória';
  } else {
    score += 25;
  }

  if (!data.implementationResponsible) {
    errors.implementationResponsible = 'Responsável pela implementação é obrigatório';
  } else {
    score += 25;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    score
  };
};

export const validateObjectivesStep = (data: Partial<OnboardingData>): ValidationResult => {
  const errors: Record<string, string> = {};
  let score = 0;

  if (!data.mainObjective) {
    errors.mainObjective = 'Objetivo principal é obrigatório';
  } else {
    score += 30;
  }

  if (!data.targetArea) {
    errors.targetArea = 'Área de impacto é obrigatória';
  } else {
    score += 25;
  }

  if (!data.expectedResult90Days) {
    errors.expectedResult90Days = 'Resultado esperado é obrigatório';
  } else {
    score += 25;
  }

  // Orçamento é opcional mas adiciona pontos
  if (data.budget) score += 20;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    score: Math.min(score, 100)
  };
};

export const validatePersonalizationStep = (data: Partial<OnboardingData>): ValidationResult => {
  const errors: Record<string, string> = {};
  let score = 50; // Base score

  if (!data.weeklyLearningTime) {
    errors.weeklyLearningTime = 'Tempo de aprendizado é obrigatório';
  } else {
    score += 25;
  }

  if (!data.contentPreference) {
    errors.contentPreference = 'Preferência de conteúdo é obrigatória';
  } else {
    score += 25;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    score
  };
};

export const calculateOverallScore = (data: Partial<OnboardingData>): number => {
  const welcomeScore = validateWelcomeStep(data).score;
  const businessScore = validateBusinessStep(data).score;
  const aiScore = validateAIMaturityStep(data).score;
  const objectivesScore = validateObjectivesStep(data).score;
  const personalizationScore = validatePersonalizationStep(data).score;

  return Math.round((welcomeScore + businessScore + aiScore + objectivesScore + personalizationScore) / 5);
};
