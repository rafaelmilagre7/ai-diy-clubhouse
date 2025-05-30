import { useMemo, useCallback } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';

export interface FieldValidation {
  isValid: boolean;
  error?: string;
  isRequired: boolean;
  hasValue: boolean;
}

export interface StepValidation {
  isValid: boolean;
  errors: Record<string, string>;
  fieldValidations: Record<string, FieldValidation>;
  completionPercentage: number;
}

export const useRealtimeValidation = (data: QuickOnboardingData, currentStep: number) => {
  
  // Validadores por campo
  const validateEmail = useCallback((email: string): FieldValidation => {
    const isRequired = true;
    const hasValue = !!email?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = hasValue && emailRegex.test(email);
    
    return {
      isValid,
      error: !hasValue ? 'Email é obrigatório' : !isValid ? 'Email inválido' : undefined,
      isRequired,
      hasValue
    };
  }, []);

  const validatePhone = useCallback((phone: string): FieldValidation => {
    const isRequired = true;
    const hasValue = !!phone?.trim();
    const numbersOnly = phone?.replace(/\D/g, '') || '';
    const isValid = hasValue && numbersOnly.length >= 10 && numbersOnly.length <= 15;
    
    return {
      isValid,
      error: !hasValue ? 'WhatsApp é obrigatório' : !isValid ? 'WhatsApp inválido' : undefined,
      isRequired,
      hasValue
    };
  }, []);

  const validateRequired = useCallback((value: string | string[], fieldName: string): FieldValidation => {
    const isRequired = true;
    const hasValue = Array.isArray(value) ? value.length > 0 : !!value?.toString().trim();
    const isValid = hasValue;
    
    return {
      isValid,
      error: !isValid ? `${fieldName} é obrigatório` : undefined,
      isRequired,
      hasValue
    };
  }, []);

  const validateUrl = useCallback((url: string, fieldName: string, required = false): FieldValidation => {
    const hasValue = !!url?.trim();
    
    if (!required && !hasValue) {
      return { isValid: true, isRequired: false, hasValue: false };
    }
    
    if (required && !hasValue) {
      return { 
        isValid: false, 
        error: `${fieldName} é obrigatório`, 
        isRequired: true, 
        hasValue: false 
      };
    }
    
    try {
      const testUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(testUrl);
      return { isValid: true, isRequired: required, hasValue: true };
    } catch {
      return { 
        isValid: false, 
        error: `${fieldName} inválida`, 
        isRequired: required, 
        hasValue: true 
      };
    }
  }, []);

  // Validações por step
  const getStepValidation = useCallback((step: number): StepValidation => {
    const fieldValidations: Record<string, FieldValidation> = {};
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Quem é você
        fieldValidations.name = validateRequired(data.name || '', 'Nome');
        fieldValidations.email = validateEmail(data.email || '');
        fieldValidations.whatsapp = validatePhone(data.whatsapp || '');
        fieldValidations.country_code = validateRequired(data.country_code || '', 'País');
        break;
        
      case 2: // Localização e redes
        fieldValidations.country = validateRequired(data.country || '', 'País');
        fieldValidations.state = validateRequired(data.state || '', 'Estado');
        fieldValidations.city = validateRequired(data.city || '', 'Cidade');
        fieldValidations.timezone = validateRequired(data.timezone || '', 'Fuso horário');
        fieldValidations.instagram_url = validateUrl(data.instagram_url || '', 'Instagram', false);
        fieldValidations.linkedin_url = validateUrl(data.linkedin_url || '', 'LinkedIn', false);
        break;
        
      case 3: // Como nos conheceu
        fieldValidations.how_found_us = validateRequired(data.how_found_us || '', 'Como nos conheceu');
        if (data.how_found_us === 'indicacao') {
          fieldValidations.referred_by = validateRequired(data.referred_by || '', 'Nome de quem indicou');
        }
        break;
        
      case 4: // Seu negócio
        fieldValidations.company_name = validateRequired(data.company_name || '', 'Nome da empresa');
        fieldValidations.role = validateRequired(data.role || '', 'Seu cargo');
        fieldValidations.company_size = validateRequired(data.company_size || '', 'Tamanho da empresa');
        fieldValidations.company_segment = validateRequired(data.company_segment || '', 'Segmento da empresa');
        fieldValidations.company_website = validateUrl(data.company_website || '', 'Website da empresa', false);
        break;
        
      case 5: // Contexto do negócio
        fieldValidations.business_model = validateRequired(data.business_model || '', 'Modelo de negócio');
        fieldValidations.business_challenges = validateRequired(data.business_challenges || [], 'Desafios do negócio');
        break;
        
      case 6: // Objetivos e metas
        fieldValidations.primary_goal = validateRequired(data.primary_goal || '', 'Principal objetivo');
        fieldValidations.expected_outcome_30days = validateRequired(data.expected_outcome_30days || '', 'Expectativa 30 dias');
        break;
        
      case 7: // Experiência com IA
        fieldValidations.ai_knowledge_level = validateRequired(data.ai_knowledge_level || '', 'Nível de conhecimento em IA');
        fieldValidations.has_implemented = validateRequired(data.has_implemented || '', 'Implementação de IA');
        break;
        
      case 8: // Personalização da experiência
        // Todos os campos são opcionais neste step
        break;
    }
    
    // Extrair erros
    Object.entries(fieldValidations).forEach(([field, validation]) => {
      if (!validation.isValid && validation.error) {
        errors[field] = validation.error;
      }
    });
    
    const totalFields = Object.keys(fieldValidations).length;
    const validFields = Object.values(fieldValidations).filter(v => v.isValid).length;
    const completionPercentage = totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 0;
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      fieldValidations,
      completionPercentage
    };
  }, [data, validateRequired, validateEmail, validatePhone, validateUrl]);

  // Validação do step atual
  const currentStepValidation = useMemo(() => 
    getStepValidation(currentStep), 
    [currentStep, getStepValidation]
  );

  // Progresso geral do onboarding
  const overallProgress = useMemo(() => {
    let totalValidFields = 0;
    let totalFields = 0;
    
    for (let step = 1; step <= 8; step++) {
      const stepValidation = getStepValidation(step);
      const stepFields = Object.values(stepValidation.fieldValidations);
      totalFields += stepFields.length;
      totalValidFields += stepFields.filter(f => f.isValid).length;
    }
    
    return totalFields > 0 ? Math.round((totalValidFields / totalFields) * 100) : 0;
  }, [getStepValidation]);

  return {
    currentStepValidation,
    overallProgress,
    getStepValidation,
    getFieldValidation: (field: keyof QuickOnboardingData) => 
      currentStepValidation.fieldValidations[field] || { isValid: true, isRequired: false, hasValue: false }
  };
};
