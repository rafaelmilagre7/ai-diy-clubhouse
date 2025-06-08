
import { useState, useEffect, useCallback } from 'react';
import { OnboardingData } from '../types/onboardingTypes';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface FieldValidation {
  [key: string]: ValidationResult;
}

export const useRealTimeValidation = () => {
  const [fieldValidations, setFieldValidations] = useState<FieldValidation>({});

  const validateField = useCallback((fieldName: string, value: any, step: number): ValidationResult => {
    switch (fieldName) {
      case 'name':
        if (!value?.trim()) return { isValid: false, message: 'Nome é obrigatório' };
        if (value.trim().length < 2) return { isValid: false, message: 'Nome muito curto' };
        return { isValid: true };

      case 'email':
        if (!value?.trim()) return { isValid: false, message: 'E-mail é obrigatório' };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return { isValid: false, message: 'E-mail inválido' };
        return { isValid: true };

      case 'phone':
        if (value && value.length > 0 && value.length < 10) {
          return { isValid: false, message: 'Telefone incompleto' };
        }
        return { isValid: true };

      case 'curiosity':
        if (!value?.trim()) return { isValid: false, message: 'Conte algo sobre você' };
        if (value.trim().length < 10) return { isValid: false, message: 'Conte um pouco mais (mín. 10 caracteres)' };
        return { isValid: true };

      case 'companyName':
        if (!value?.trim()) return { isValid: false, message: 'Nome da empresa é obrigatório' };
        return { isValid: true };

      case 'businessSector':
        if (!value?.trim()) return { isValid: false, message: 'Setor é obrigatório' };
        return { isValid: true };

      case 'companySize':
        if (!value?.trim()) return { isValid: false, message: 'Tamanho da empresa é obrigatório' };
        return { isValid: true };

      case 'areaToImpact':
        if (!value?.trim()) return { isValid: false, message: 'Área para impactar é obrigatória' };
        if (value.trim().length < 5) return { isValid: false, message: 'Descreva melhor a área' };
        return { isValid: true };

      case 'expectedResult90Days':
        if (!value?.trim()) return { isValid: false, message: 'Resultado esperado é obrigatório' };
        if (value.trim().length < 10) return { isValid: false, message: 'Descreva melhor o resultado esperado' };
        return { isValid: true };

      default:
        return { isValid: true };
    }
  }, []);

  const validateFieldRealTime = useCallback((fieldName: string, value: any, step: number) => {
    const result = validateField(fieldName, value, step);
    setFieldValidations(prev => ({
      ...prev,
      [fieldName]: result
    }));
    return result;
  }, [validateField]);

  const clearFieldValidation = useCallback((fieldName: string) => {
    setFieldValidations(prev => {
      const { [fieldName]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllValidations = useCallback(() => {
    setFieldValidations({});
  }, []);

  const getFieldValidation = useCallback((fieldName: string): ValidationResult | undefined => {
    return fieldValidations[fieldName];
  }, [fieldValidations]);

  return {
    fieldValidations,
    validateFieldRealTime,
    clearFieldValidation,
    clearAllValidations,
    getFieldValidation
  };
};
