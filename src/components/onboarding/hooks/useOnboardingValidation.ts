
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
          if (!data.company_name?.trim() && !data.companyName?.trim()) {
            errors.push({ field: 'companyName', message: 'Nome da empresa é obrigatório' });
          }
          if (!data.current_position?.trim() && !data.position?.trim()) {
            errors.push({ field: 'position', message: 'Cargo é obrigatório' });
          }
          if (!data.company_size && !data.companySize) {
            errors.push({ field: 'companySize', message: 'Tamanho da empresa é obrigatório' });
          }
          break;

        case 3: // Maturidade em IA
          if (!data.ai_knowledge_level && !data.aiKnowledgeLevel) {
            errors.push({ field: 'aiKnowledgeLevel', message: 'Nível de conhecimento em IA é obrigatório' });
          }
          if (!data.aiToolsUsed || data.aiToolsUsed.length === 0) {
            errors.push({ field: 'aiToolsUsed', message: 'Selecione pelo menos uma ferramenta de IA' });
          }
          break;

        case 4: // Objetivos e Expectativas
          if (!data.primary_goal?.trim() && !data.mainObjective?.trim()) {
            errors.push({ field: 'mainObjective', message: 'Objetivo principal é obrigatório' });
          }
          if (!data.expectedResult90Days?.trim()) {
            errors.push({ field: 'expectedResult90Days', message: 'Resultado esperado em 90 dias é obrigatório' });
          }
          break;

        case 5: // Personalização da Experiência
          if (!data.weekly_availability?.trim() && !data.weeklyLearningTime?.trim()) {
            errors.push({ field: 'weeklyLearningTime', message: 'Tempo semanal de aprendizado é obrigatório' });
          }
          if (!data.contentPreference || data.contentPreference.length === 0) {
            errors.push({ field: 'contentPreference', message: 'Preferência de conteúdo é obrigatória' });
          }
          break;

        case 6: // Finalização
          // Validação final - todos os campos obrigatórios devem estar preenchidos
          const requiredFields = [
            'name', 'email', 'phone'
          ];

          for (const field of requiredFields) {
            if (!data[field as keyof OnboardingData]) {
              errors.push({ 
                field, 
                message: `Campo ${field} é obrigatório` 
              });
            }
          }

          // Verificar campos empresariais
          if (!data.company_name && !data.companyName) {
            errors.push({ field: 'companyName', message: 'Nome da empresa é obrigatório' });
          }

          if (!data.aiToolsUsed || data.aiToolsUsed.length === 0) {
            errors.push({ 
              field: 'aiToolsUsed', 
              message: 'Selecione pelo menos uma ferramenta de IA' 
            });
          }

          if (!data.primary_goal?.trim() && !data.mainObjective?.trim()) {
            errors.push({ 
              field: 'mainObjective', 
              message: 'Objetivo principal é obrigatório' 
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
