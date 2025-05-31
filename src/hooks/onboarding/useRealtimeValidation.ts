
import { useMemo } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';

export interface FieldValidation {
  hasValue: boolean;
  isValid: boolean;
  isRequired: boolean;
  error?: string;
}

export interface ValidationResult {
  fields: Record<string, FieldValidation>;
  canProceed: boolean;
  currentStepValidation: {
    isValid: boolean;
    requiredFieldsCount: number;
    completedFieldsCount: number;
    missingFields: string[];
  };
}

export const useRealtimeValidation = (data: QuickOnboardingData, currentStep: number): ValidationResult => {
  return useMemo(() => {
    console.log('🔍 Validando etapa:', currentStep, 'com dados críticos:', {
      name: data.name,
      email: data.email,
      company_name: data.company_name,
      currentStep
    });

    const validateField = (value: any, isRequired: boolean = false, validator?: (val: any) => boolean): FieldValidation => {
      const hasValue = value !== undefined && value !== null && value !== '' && 
                      !(Array.isArray(value) && value.length === 0);
      const isValid = hasValue ? (validator ? validator(value) : true) : !isRequired;
      
      return {
        hasValue,
        isValid,
        isRequired,
        error: !isValid ? (isRequired ? 'Campo obrigatório' : 'Campo inválido') : undefined
      };
    };

    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
      const numbersOnly = phone.replace(/\D/g, '');
      return numbersOnly.length >= 10 && numbersOnly.length <= 15;
    };

    const validateArray = (arr: any[]): boolean => {
      return Array.isArray(arr) && arr.length > 0;
    };

    const validateMinLength = (text: string, minLength: number = 2): boolean => {
      return typeof text === 'string' && text.trim().length >= minLength;
    };

    // Validações por etapa com critérios mais rigorosos
    const getStepFields = (step: number): Record<string, FieldValidation> => {
      switch (step) {
        case 1: // Etapa 1 - Informações Pessoais
          return {
            name: validateField(data.name, true, (val) => validateMinLength(val, 2)),
            email: validateField(data.email, true, validateEmail),
            whatsapp: validateField(data.whatsapp, true, validatePhone),
            country_code: validateField(data.country_code, true),
            birth_date: validateField(data.birth_date, false) // Não obrigatório
          };

        case 2: // Etapa 2 - Localização e redes
          return {
            country: validateField(data.country, true, (val) => validateMinLength(val, 2)),
            state: validateField(data.state, true, (val) => validateMinLength(val, 2)),
            city: validateField(data.city, true, (val) => validateMinLength(val, 2)),
            instagram_url: validateField(data.instagram_url, false),
            linkedin_url: validateField(data.linkedin_url, false)
          };

        case 3: // Etapa 3 - Como nos conheceu
          return {
            how_found_us: validateField(data.how_found_us, true),
            referred_by: validateField(
              data.referred_by, 
              data.how_found_us === 'indicacao',
              (val) => data.how_found_us !== 'indicacao' || validateMinLength(val, 2)
            )
          };

        case 4: // Etapa 4 - Seu negócio
          return {
            company_name: validateField(data.company_name, true, (val) => validateMinLength(val, 2)),
            role: validateField(data.role, true, (val) => validateMinLength(val, 2)),
            company_size: validateField(data.company_size, true),
            company_segment: validateField(data.company_segment, true),
            annual_revenue_range: validateField(data.annual_revenue_range, true),
            company_website: validateField(data.company_website, false),
            current_position: validateField(data.current_position, false)
          };

        case 5: // Etapa 5 - Contexto do negócio
          return {
            business_model: validateField(data.business_model, true),
            business_challenges: validateField(data.business_challenges, true, validateArray),
            additional_context: validateField(data.additional_context, false)
          };

        case 6: // Etapa 6 - Objetivos e metas
          return {
            primary_goal: validateField(data.primary_goal, true),
            expected_outcome_30days: validateField(data.expected_outcome_30days, true, (val) => validateMinLength(val, 5)),
            week_availability: validateField(data.week_availability, false),
            how_implement: validateField(data.how_implement, false)
          };

        case 7: // Etapa 7 - Experiência com IA
          return {
            ai_knowledge_level: validateField(data.ai_knowledge_level, true, (val) => val !== '0' && val !== ''),
            has_implemented: validateField(data.has_implemented, true),
            previous_tools: validateField(data.previous_tools, false),
            desired_ai_areas: validateField(data.desired_ai_areas, false)
          };

        case 8: // Etapa 8 - Personalização
          return {
            content_formats: validateField(data.content_formats, true, validateArray),
            available_days: validateField(data.available_days, true, validateArray),
            interests: validateField(data.interests, false),
            time_preference: validateField(data.time_preference, false),
            networking_availability: validateField(data.networking_availability, false),
            skills_to_share: validateField(data.skills_to_share, false)
          };

        default:
          return {};
      }
    };

    const fields = getStepFields(currentStep);
    
    // Calcular estatísticas da etapa atual
    const fieldEntries = Object.entries(fields);
    const requiredFields = fieldEntries.filter(([_, validation]) => validation.isRequired);
    const completedRequiredFields = requiredFields.filter(([_, validation]) => validation.isValid);
    const missingFields = requiredFields
      .filter(([_, validation]) => !validation.isValid)
      .map(([fieldName]) => fieldName);

    const canProceed = missingFields.length === 0;

    const currentStepValidation = {
      isValid: canProceed,
      requiredFieldsCount: requiredFields.length,
      completedFieldsCount: completedRequiredFields.length,
      missingFields
    };

    console.log('✅ Validação da etapa:', currentStep, {
      canProceed,
      requiredFields: requiredFields.length,
      completedFields: completedRequiredFields.length,
      missingFields,
      fieldsDetails: Object.fromEntries(
        fieldEntries.map(([name, validation]) => [
          name, 
          { hasValue: validation.hasValue, isValid: validation.isValid, isRequired: validation.isRequired }
        ])
      )
    });

    return {
      fields,
      canProceed,
      currentStepValidation
    };
  }, [data, currentStep]);
};
