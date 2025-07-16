import { validateBrazilianPhone, validateLinkedInUrl, validateInstagramUrl } from './validationUtils';

// Interface unificada para dados do onboarding
export interface OnboardingData {
  personal_info?: {
    name?: string;
    email?: string;
    phone?: string;
    ddi?: string;
    linkedin?: string;
    instagram?: string;
    country?: string;
    state?: string;
    city?: string;
    timezone?: string;
  };
  business_info?: {
    company_name?: string;
    position?: string;
    company_sector?: string;
    employee_count?: string;
    company_stage?: string;
  };
  ai_experience?: {
    hasImplementedAI?: string;
    aiToolsUsed?: string[];
    aiKnowledgeLevel?: string;
    whoWillImplement?: string;
    aiImplementationObjective?: string;
    aiImplementationUrgency?: string;
  };
  goals_info?: {
    mainObjective?: string;
    areaToImpact?: string;
    expectedResult90Days?: string;
    urgencyLevel?: string;
    successMetric?: string;
    mainObstacle?: string;
    preferredSupport?: string;
    aiImplementationBudget?: string;
  };
  personalization?: {
    weeklyLearningTime?: string;
    bestDays?: string[];
    bestPeriods?: string[];
    contentPreference?: string[];
    contentFrequency?: string;
    wantsNetworking?: string;
    communityInteractionStyle?: string;
    preferredCommunicationChannel?: string;
    followUpType?: string;
    motivationSharing?: string;
  };
}

// Validação específica por step
export const validateOnboardingStep = (step: number, data: OnboardingData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  console.log(`🔍 [VALIDATION] Validando Step ${step} com dados:`, data);
  
  switch (step) {
    case 1:
      return validateStep1(data.personal_info || {});
    case 2:
      return validateStep2(data.business_info || {});
    case 3:
      return validateStep3(data.ai_experience || {});
    case 4:
      return validateStep4(data.goals_info || {});
    case 5:
      return validateStep5(data.personalization || {});
    case 6:
      return {}; // Step 6 sempre válido (confirmação)
    default:
      console.warn(`⚠️ [VALIDATION] Step ${step} não reconhecido`);
      return {};
  }
};

// STEP 1: Apenas nome e email obrigatórios
const validateStep1 = (personalInfo: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Nome obrigatório
  if (!personalInfo.name?.trim()) {
    errors.name = "Nome é obrigatório";
  } else if (personalInfo.name.trim().length < 2) {
    errors.name = "Nome deve ter pelo menos 2 caracteres";
  }
  
  // Email obrigatório
  if (!personalInfo.email?.trim()) {
    errors.email = "Email é obrigatório";
  } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
    errors.email = "Email inválido";
  }
  
  // Validações opcionais no Step 1
  if (personalInfo.phone && !validateBrazilianPhone(personalInfo.phone)) {
    errors.phone = "Formato inválido. Use (XX) XXXXX-XXXX";
  }
  
  if (personalInfo.linkedin && !validateLinkedInUrl(personalInfo.linkedin)) {
    errors.linkedin = "URL do LinkedIn inválida";
  }
  
  if (personalInfo.instagram && !validateInstagramUrl(personalInfo.instagram)) {
    errors.instagram = "URL do Instagram inválida";
  }
  
  console.log(`✅ [VALIDATION] Step 1 - Erros encontrados:`, errors);
  return errors;
};

// STEP 2: Sempre válido (permitir pular se necessário)
const validateStep2 = (businessInfo: any): Record<string, string> => {
  console.log(`✅ [VALIDATION] Step 2 - Sempre válido (permite pular)`);
  return {}; // Step 2 sempre válido para permitir flexibilidade
};

// STEP 3: Campos obrigatórios
const validateStep3 = (aiExperience: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  const requiredFields = [
    'hasImplementedAI',
    'aiKnowledgeLevel', 
    'whoWillImplement',
    'aiImplementationObjective',
    'aiImplementationUrgency'
  ];
  
  requiredFields.forEach(field => {
    if (!aiExperience[field]) {
      errors[field] = `Campo ${field} é obrigatório`;
    }
  });
  
  console.log(`✅ [VALIDATION] Step 3 - Erros encontrados:`, errors);
  return errors;
};

// STEP 4: Reduzir campos obrigatórios para ser mais flexível
const validateStep4 = (goalsInfo: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Apenas 3 campos mais importantes obrigatórios
  const requiredFields = [
    'mainObjective',
    'areaToImpact',
    'urgencyLevel'
  ];
  
  requiredFields.forEach(field => {
    if (!goalsInfo[field]) {
      errors[field] = `Campo ${field} é obrigatório`;
    }
  });
  
  console.log(`✅ [VALIDATION] Step 4 - Erros encontrados:`, errors);
  return errors;
};

// STEP 5: Melhorar validação de arrays vazios
const validateStep5 = (personalization: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validar campos obrigatórios
  if (!personalization.weeklyLearningTime) {
    errors.weeklyLearningTime = "Tempo semanal é obrigatório";
  }
  
  if (!personalization.wantsNetworking) {
    errors.wantsNetworking = "Preferência de networking é obrigatória";
  }
  
  // Validar arrays - pelo menos uma opção
  if (!personalization.bestDays || personalization.bestDays.length === 0) {
    errors.bestDays = "Selecione pelo menos um dia da semana";
  }
  
  if (!personalization.bestPeriods || personalization.bestPeriods.length === 0) {
    errors.bestPeriods = "Selecione pelo menos um período do dia";
  }
  
  if (!personalization.contentPreference || personalization.contentPreference.length === 0) {
    errors.contentPreference = "Selecione pelo menos um formato de conteúdo";
  }
  
  console.log(`✅ [VALIDATION] Step 5 - Erros encontrados:`, errors);
  return errors;
};

// Validação global do onboarding (todos os steps)
export const validateCompleteOnboarding = (data: OnboardingData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validar cada step
  for (let step = 1; step <= 5; step++) {
    const stepErrors = validateOnboardingStep(step, data);
    Object.keys(stepErrors).forEach(key => {
      errors[`step${step}_${key}`] = stepErrors[key];
    });
  }
  
  return errors;
};

// Verificar se step pode ser considerado válido (flexível)
export const isStepValid = (step: number, data: OnboardingData): boolean => {
  const errors = validateOnboardingStep(step, data);
  const isValid = Object.keys(errors).length === 0;
  
  console.log(`🎯 [VALIDATION] Step ${step} válido:`, isValid, errors);
  return isValid;
};

// Exportar também a validação original para compatibilidade
export { validatePersonalInfoForm } from './validatePersonalInfoForm';