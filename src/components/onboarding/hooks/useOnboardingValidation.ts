
import { useState, useCallback } from 'react';
import { OnboardingData } from '../types/onboardingTypes';

interface ValidationError {
  field: string;
  message: string;
}

interface StepValidation {
  isValid: boolean;
  errors: ValidationError[];
}

export const useOnboardingValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateStep1 = useCallback((data: OnboardingData): StepValidation => {
    const errors: ValidationError[] = [];

    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Nome é obrigatório' });
    } else if (data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' });
    }

    if (!data.email?.trim()) {
      errors.push({ field: 'email', message: 'E-mail é obrigatório' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: 'email', message: 'E-mail inválido' });
    }

    if (!data.state?.trim()) {
      errors.push({ field: 'state', message: 'Estado é obrigatório' });
    }

    if (!data.city?.trim()) {
      errors.push({ field: 'city', message: 'Cidade é obrigatória' });
    }

    if (!data.curiosity?.trim()) {
      errors.push({ field: 'curiosity', message: 'Curiosidade é obrigatória' });
    } else if (data.curiosity.trim().length < 10) {
      errors.push({ field: 'curiosity', message: 'Conte um pouco mais sobre você (mínimo 10 caracteres)' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateStep2 = useCallback((data: OnboardingData): StepValidation => {
    const errors: ValidationError[] = [];

    if (!data.companyName?.trim()) {
      errors.push({ field: 'companyName', message: 'Nome da empresa é obrigatório' });
    }

    if (!data.businessSector?.trim()) {
      errors.push({ field: 'businessSector', message: 'Setor de atuação é obrigatório' });
    }

    if (!data.companySize?.trim()) {
      errors.push({ field: 'companySize', message: 'Tamanho da empresa é obrigatório' });
    }

    if (!data.annualRevenue?.trim()) {
      errors.push({ field: 'annualRevenue', message: 'Faturamento anual é obrigatório' });
    }

    if (!data.position?.trim()) {
      errors.push({ field: 'position', message: 'Cargo/posição é obrigatório' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateStep3 = useCallback((data: OnboardingData): StepValidation => {
    const errors: ValidationError[] = [];

    if (!data.hasImplementedAI || data.hasImplementedAI === '') {
      errors.push({ field: 'hasImplementedAI', message: 'Experiência com IA é obrigatória' });
    }

    if (!data.aiKnowledgeLevel || data.aiKnowledgeLevel === '') {
      errors.push({ field: 'aiKnowledgeLevel', message: 'Nível de conhecimento em IA é obrigatório' });
    }

    if (!data.whoWillImplement || data.whoWillImplement === '') {
      errors.push({ field: 'whoWillImplement', message: 'Quem vai implementar é obrigatório' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateStep4 = useCallback((data: OnboardingData): StepValidation => {
    const errors: ValidationError[] = [];

    if (!data.mainObjective || data.mainObjective === '') {
      errors.push({ field: 'mainObjective', message: 'Objetivo principal é obrigatório' });
    }

    if (!data.areaToImpact?.trim()) {
      errors.push({ field: 'areaToImpact', message: 'Área para impactar é obrigatória' });
    }

    if (!data.expectedResult90Days?.trim()) {
      errors.push({ field: 'expectedResult90Days', message: 'Resultado esperado em 90 dias é obrigatório' });
    }

    if (!data.aiImplementationBudget?.trim()) {
      errors.push({ field: 'aiImplementationBudget', message: 'Orçamento para IA é obrigatório' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateStep5 = useCallback((data: OnboardingData): StepValidation => {
    const errors: ValidationError[] = [];

    if (!data.weeklyLearningTime?.trim()) {
      errors.push({ field: 'weeklyLearningTime', message: 'Tempo semanal é obrigatório' });
    }

    if (!data.contentPreference || data.contentPreference === '') {
      errors.push({ field: 'contentPreference', message: 'Preferência de conteúdo é obrigatória' });
    }

    if (!data.wantsNetworking || data.wantsNetworking === '') {
      errors.push({ field: 'wantsNetworking', message: 'Preferência de networking é obrigatória' });
    }

    if (!data.acceptsCaseStudy || data.acceptsCaseStudy === '') {
      errors.push({ field: 'acceptsCaseStudy', message: 'Aceitar case de sucesso é obrigatório' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateCurrentStep = useCallback((
    step: number, 
    data: OnboardingData, 
    memberType: 'club' | 'formacao'
  ): StepValidation => {
    console.log('[useOnboardingValidation] Validando step:', step, 'dados:', data);
    
    setIsValidating(true);
    
    let result: StepValidation;
    
    switch (step) {
      case 1:
        result = validateStep1(data);
        break;
      case 2:
        result = validateStep2(data);
        break;
      case 3:
        result = validateStep3(data);
        break;
      case 4:
        result = validateStep4(data);
        break;
      case 5:
        result = validateStep5(data);
        break;
      default:
        result = { isValid: true, errors: [] };
    }
    
    console.log('[useOnboardingValidation] Resultado da validação:', result);
    
    setValidationErrors(result.errors);
    setIsValidating(false);
    
    return result;
  }, [validateStep1, validateStep2, validateStep3, validateStep4, validateStep5]);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return validationErrors.find(error => error.field === fieldName)?.message;
  }, [validationErrors]);

  return {
    validationErrors,
    isValidating,
    validateCurrentStep,
    clearValidationErrors,
    getFieldError
  };
};
