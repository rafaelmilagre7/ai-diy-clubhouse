
import { useState, useCallback } from 'react';
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
    try {
      // Proteção contra dados não carregados
      if (!data || Object.keys(data).length <= 1) {
        console.warn('[ONBOARDING-VALIDATION] Dados não carregados ainda');
        return false;
      }

      const errors: ValidationError[] = [];

      switch (step) {
        case 1: // Informações Pessoais
          if (!data.name?.trim()) {
            errors.push({ field: 'name', message: 'Nome é obrigatório' });
          }
          if (!data.email?.trim()) {
            errors.push({ field: 'email', message: 'E-mail é obrigatório' });
          }
          if (!data.phone?.trim()) {
            errors.push({ field: 'phone', message: 'Telefone é obrigatório' });
          }
          break;

        case 2: // Perfil Empresarial
          if (!data.company?.trim()) {
            errors.push({ field: 'company', message: 'Nome da empresa é obrigatório' });
          }
          if (!data.position?.trim()) {
            errors.push({ field: 'position', message: 'Cargo é obrigatório' });
          }
          if (!data.companySize) {
            errors.push({ field: 'companySize', message: 'Tamanho da empresa é obrigatório' });
          }
          break;

        case 3: // Maturidade em IA
          if (!data.aiExperience) {
            errors.push({ field: 'aiExperience', message: 'Experiência com IA é obrigatória' });
          }
          if (!data.currentTools || data.currentTools.length === 0) {
            errors.push({ field: 'currentTools', message: 'Selecione pelo menos uma ferramenta' });
          }
          break;

        case 4: // Objetivos e Expectativas
          if (!data.primaryGoals || data.primaryGoals.length === 0) {
            errors.push({ field: 'primaryGoals', message: 'Selecione pelo menos um objetivo' });
          }
          if (!data.timeline) {
            errors.push({ field: 'timeline', message: 'Timeline é obrigatório' });
          }
          break;

        case 5: // Personalização da Experiência
          if (!data.preferredLearningStyle) {
            errors.push({ field: 'preferredLearningStyle', message: 'Estilo de aprendizado é obrigatório' });
          }
          if (!data.communicationPreference) {
            errors.push({ field: 'communicationPreference', message: 'Preferência de comunicação é obrigatória' });
          }
          break;

        case 6: // Finalização
          // Validação final - todos os campos obrigatórios devem estar preenchidos
          const requiredFields = [
            'name', 'email', 'phone', 'company', 'position', 
            'companySize', 'aiExperience', 'timeline', 
            'preferredLearningStyle', 'communicationPreference'
          ];

          for (const field of requiredFields) {
            if (!data[field as keyof OnboardingData]) {
              errors.push({ 
                field, 
                message: `Campo ${field} é obrigatório` 
              });
            }
          }

          if (!data.currentTools || data.currentTools.length === 0) {
            errors.push({ 
              field: 'currentTools', 
              message: 'Selecione pelo menos uma ferramenta atual' 
            });
          }

          if (!data.primaryGoals || data.primaryGoals.length === 0) {
            errors.push({ 
              field: 'primaryGoals', 
              message: 'Selecione pelo menos um objetivo principal' 
            });
          }
          break;

        default:
          console.warn('[ONBOARDING-VALIDATION] Etapa desconhecida:', step);
          return true;
      }

      setValidationErrors(errors);
      
      const isValid = errors.length === 0;
      
      if (!isValid) {
        console.log('[ONBOARDING-VALIDATION] Erros encontrados na etapa', step, ':', errors);
      }

      return isValid;

    } catch (error) {
      console.error('[ONBOARDING-VALIDATION] Erro na validação:', error);
      setValidationErrors([{ 
        field: 'general', 
        message: 'Erro na validação' 
      }]);
      return false;
    }
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const error = validationErrors.find(err => err.field === fieldName);
    return error?.message;
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
