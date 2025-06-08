
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

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateStep2 = useCallback((data: OnboardingData, memberType: 'club' | 'formacao'): StepValidation => {
    const errors: ValidationError[] = [];

    if (memberType === 'club') {
      if (!data.businessStage) {
        errors.push({ field: 'businessStage', message: 'Estágio do negócio é obrigatório' });
      }
      if (!data.businessArea?.trim()) {
        errors.push({ field: 'businessArea', message: 'Área do negócio é obrigatória' });
      }
      if (!data.teamSize) {
        errors.push({ field: 'teamSize', message: 'Tamanho da equipe é obrigatório' });
      }
    } else {
      if (!data.educationLevel) {
        errors.push({ field: 'educationLevel', message: 'Nível educacional é obrigatório' });
      }
      if (!data.studyArea?.trim()) {
        errors.push({ field: 'studyArea', message: 'Área de estudo é obrigatória' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateStep3 = useCallback((data: OnboardingData): StepValidation => {
    const errors: ValidationError[] = [];

    if (!data.targetMarket?.trim()) {
      errors.push({ field: 'targetMarket', message: 'Campo obrigatório' });
    }

    if (!data.mainChallenges || data.mainChallenges.length === 0) {
      errors.push({ field: 'mainChallenges', message: 'Descreva pelo menos um desafio' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateStep4 = useCallback((data: OnboardingData): StepValidation => {
    const errors: ValidationError[] = [];

    if (!data.aiExperience) {
      errors.push({ field: 'aiExperience', message: 'Nível de experiência com IA é obrigatório' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateStep5 = useCallback((data: OnboardingData): StepValidation => {
    const errors: ValidationError[] = [];

    if (!data.primaryGoals || data.primaryGoals.length === 0) {
      errors.push({ field: 'primaryGoals', message: 'Selecione pelo menos um objetivo' });
    }

    if (!data.timeframe) {
      errors.push({ field: 'timeframe', message: 'Prazo é obrigatório' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateStep6 = useCallback((data: OnboardingData): StepValidation => {
    const errors: ValidationError[] = [];

    if (!data.communicationStyle) {
      errors.push({ field: 'communicationStyle', message: 'Estilo de comunicação é obrigatório' });
    }

    if (!data.learningPreference) {
      errors.push({ field: 'learningPreference', message: 'Preferência de aprendizado é obrigatória' });
    }

    if (!data.contentTypes || data.contentTypes.length === 0) {
      errors.push({ field: 'contentTypes', message: 'Selecione pelo menos um tipo de conteúdo' });
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
    setIsValidating(true);
    
    let result: StepValidation;
    
    switch (step) {
      case 1:
        result = validateStep1(data);
        break;
      case 2:
        result = validateStep2(data, memberType);
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
      case 6:
        result = validateStep6(data);
        break;
      default:
        result = { isValid: true, errors: [] };
    }
    
    setValidationErrors(result.errors);
    setIsValidating(false);
    
    return result;
  }, [validateStep1, validateStep2, validateStep3, validateStep4, validateStep5, validateStep6]);

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
