
import { useCallback, useState } from 'react';
import { OnboardingData } from '../types/onboardingTypes';

interface ValidationError {
  field: string;
  message: string;
}

export const useOnboardingValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const validateStep = useCallback((
    step: number, 
    data: OnboardingData, 
    memberType: 'club' | 'formacao'
  ): boolean => {
    const errors: ValidationError[] = [];

    try {
      switch (step) {
        case 1:
          if (!data.name?.trim()) {
            errors.push({ field: 'name', message: 'Nome é obrigatório' });
          }
          if (!data.email?.trim()) {
            errors.push({ field: 'email', message: 'Email é obrigatório' });
          }
          break;

        case 2:
          if (!data.companyName?.trim()) {
            errors.push({ field: 'companyName', message: 'Nome da empresa é obrigatório' });
          }
          if (!data.businessSector?.trim()) {
            errors.push({ field: 'businessSector', message: 'Setor é obrigatório' });
          }
          break;

        case 3:
          if (!data.aiKnowledgeLevel) {
            errors.push({ field: 'aiKnowledgeLevel', message: 'Nível de conhecimento é obrigatório' });
          }
          break;

        case 4:
          if (!data.mainObjective) {
            errors.push({ field: 'mainObjective', message: 'Objetivo principal é obrigatório' });
          }
          break;

        case 5:
          if (!data.weeklyLearningTime) {
            errors.push({ field: 'weeklyLearningTime', message: 'Tempo de aprendizado é obrigatório' });
          }
          if (!data.bestDays || data.bestDays.length === 0) {
            errors.push({ field: 'bestDays', message: 'Pelo menos um dia deve ser selecionado' });
          }
          if (!data.bestPeriods || data.bestPeriods.length === 0) {
            errors.push({ field: 'bestPeriods', message: 'Pelo menos um período deve ser selecionado' });
          }
          break;

        default:
          break;
      }

      setValidationErrors(errors);
      return errors.length === 0;
    } catch (error) {
      console.error('[VALIDATION] Erro na validação:', error);
      return false;
    }
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return validationErrors.find(error => error.field === field)?.message;
  }, [validationErrors]);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  return {
    validateStep,
    validationErrors,
    getFieldError,
    clearValidationErrors
  };
};
