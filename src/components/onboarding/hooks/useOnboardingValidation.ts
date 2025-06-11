
import { useState, useCallback } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { validateFormacaoStep } from '../validation/formacaoValidation';

interface ValidationError {
  field: string;
  message: string;
}

export const useOnboardingValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const validateCurrentStep = useCallback((step: number, data: OnboardingData, memberType: 'club' | 'formacao') => {
    let result;
    
    if (memberType === 'formacao') {
      result = validateFormacaoStep(step, data);
    } else {
      // Usar validação existente do club (usar a mesma por ora)
      result = validateFormacaoStep(step, data);
    }
    
    setValidationErrors(result.errors);
    return result;
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  const getFieldError = useCallback((field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  }, [validationErrors]);

  return {
    validationErrors,
    validateCurrentStep,
    clearValidationErrors,
    getFieldError
  };
};
