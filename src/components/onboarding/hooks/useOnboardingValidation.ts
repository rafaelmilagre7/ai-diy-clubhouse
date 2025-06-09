
import { useState } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { validateFormacaoStep } from '../validation/formacaoValidation';

interface ValidationError {
  field: string;
  message: string;
}

export const useOnboardingValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const validateCurrentStep = (step: number, data: OnboardingData, memberType: 'club' | 'formacao') => {
    let result;
    
    if (memberType === 'formacao') {
      result = validateFormacaoStep(step, data);
    } else {
      // Usar validação existente do club
      result = validateFormacaoStep(step, data); // Por enquanto usar a mesma validação
    }
    
    setValidationErrors(result.errors);
    return result;
  };

  const clearValidationErrors = () => {
    setValidationErrors([]);
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  return {
    validationErrors,
    validateCurrentStep,
    clearValidationErrors,
    getFieldError
  };
};
