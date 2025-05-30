
import { useMemo } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';

export interface FieldValidation {
  hasValue: boolean;
  isValid: boolean;
  isRequired: boolean;
  error?: string;
}

export const useRealtimeValidation = (data: QuickOnboardingData, currentStep: number) => {
  const validation = useMemo(() => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
      const numbersOnly = phone.replace(/\D/g, '');
      return numbersOnly.length >= 10 && numbersOnly.length <= 15;
    };

    const validateUrl = (url: string): boolean => {
      if (!url.trim()) return true; // Optional field
      try {
        const urlToTest = url.startsWith('http') ? url : `https://${url}`;
        new URL(urlToTest);
        return true;
      } catch {
        return false;
      }
    };

    // Step 1 validation
    const step1Fields = {
      name: {
        hasValue: !!(data.name?.trim()),
        isValid: !!(data.name?.trim()),
        isRequired: true,
        error: !data.name?.trim() ? 'Nome é obrigatório' : undefined
      },
      email: {
        hasValue: !!(data.email?.trim()),
        isValid: !!(data.email?.trim() && validateEmail(data.email)),
        isRequired: true,
        error: !data.email?.trim() ? 'E-mail é obrigatório' : 
               !validateEmail(data.email || '') ? 'E-mail inválido' : undefined
      },
      whatsapp: {
        hasValue: !!(data.whatsapp?.trim()),
        isValid: !!(data.whatsapp?.trim() && validatePhone(data.whatsapp)),
        isRequired: true,
        error: !data.whatsapp?.trim() ? 'WhatsApp é obrigatório' : 
               !validatePhone(data.whatsapp || '') ? 'WhatsApp inválido' : undefined
      },
      country_code: {
        hasValue: !!(data.country_code?.trim()),
        isValid: !!(data.country_code?.trim()),
        isRequired: true,
        error: !data.country_code?.trim() ? 'País é obrigatório' : undefined
      },
      how_found_us: {
        hasValue: !!(data.how_found_us?.trim()),
        isValid: !!(data.how_found_us?.trim()),
        isRequired: true,
        error: !data.how_found_us?.trim() ? 'Como conheceu é obrigatório' : undefined
      },
      referred_by: {
        hasValue: !!(data.referred_by?.trim()),
        isValid: data.how_found_us !== 'indicacao' || !!(data.referred_by?.trim()),
        isRequired: data.how_found_us === 'indicacao',
        error: data.how_found_us === 'indicacao' && !data.referred_by?.trim() ? 
               'Nome de quem indicou é obrigatório' : undefined
      },
      instagram_url: {
        hasValue: !!(data.instagram_url?.trim()),
        isValid: validateUrl(data.instagram_url || ''),
        isRequired: false,
        error: data.instagram_url && !validateUrl(data.instagram_url) ? 'URL inválida' : undefined
      },
      linkedin_url: {
        hasValue: !!(data.linkedin_url?.trim()),
        isValid: validateUrl(data.linkedin_url || ''),
        isRequired: false,
        error: data.linkedin_url && !validateUrl(data.linkedin_url) ? 'URL inválida' : undefined
      }
    };

    // Step 2 validation
    const step2Fields = {
      country: {
        hasValue: !!(data.country?.trim()),
        isValid: !!(data.country?.trim()),
        isRequired: true,
        error: !data.country?.trim() ? 'País é obrigatório' : undefined
      },
      state: {
        hasValue: !!(data.state?.trim()),
        isValid: !!(data.state?.trim()),
        isRequired: true,
        error: !data.state?.trim() ? 'Estado é obrigatório' : undefined
      },
      city: {
        hasValue: !!(data.city?.trim()),
        isValid: !!(data.city?.trim()),
        isRequired: true,
        error: !data.city?.trim() ? 'Cidade é obrigatória' : undefined
      },
      timezone: {
        hasValue: !!(data.timezone?.trim()),
        isValid: !!(data.timezone?.trim()),
        isRequired: true,
        error: !data.timezone?.trim() ? 'Fuso horário é obrigatório' : undefined
      }
    };

    // Step 3 validation (same as step 1 for how_found_us)
    const step3Fields = {
      how_found_us: step1Fields.how_found_us,
      referred_by: step1Fields.referred_by
    };

    // Step 4 validation
    const step4Fields = {
      company_name: {
        hasValue: !!(data.company_name?.trim()),
        isValid: !!(data.company_name?.trim()),
        isRequired: true,
        error: !data.company_name?.trim() ? 'Nome da empresa é obrigatório' : undefined
      },
      role: {
        hasValue: !!(data.role?.trim()),
        isValid: !!(data.role?.trim()),
        isRequired: true,
        error: !data.role?.trim() ? 'Cargo é obrigatório' : undefined
      },
      company_size: {
        hasValue: !!(data.company_size?.trim()),
        isValid: !!(data.company_size?.trim()),
        isRequired: true,
        error: !data.company_size?.trim() ? 'Tamanho da empresa é obrigatório' : undefined
      },
      company_segment: {
        hasValue: !!(data.company_segment?.trim()),
        isValid: !!(data.company_segment?.trim()),
        isRequired: true,
        error: !data.company_segment?.trim() ? 'Segmento é obrigatório' : undefined
      },
      annual_revenue_range: {
        hasValue: !!(data.annual_revenue_range?.trim()),
        isValid: !!(data.annual_revenue_range?.trim()),
        isRequired: true,
        error: !data.annual_revenue_range?.trim() ? 'Faturamento é obrigatório' : undefined
      },
      company_website: {
        hasValue: !!(data.company_website?.trim()),
        isValid: validateUrl(data.company_website || ''),
        isRequired: false,
        error: data.company_website && !validateUrl(data.company_website) ? 'URL inválida' : undefined
      }
    };

    // Step 5 validation
    const step5Fields = {
      business_model: {
        hasValue: !!(data.business_model?.trim()),
        isValid: !!(data.business_model?.trim()),
        isRequired: true,
        error: !data.business_model?.trim() ? 'Modelo de negócio é obrigatório' : undefined
      },
      business_challenges: {
        hasValue: !!(data.business_challenges?.length),
        isValid: !!(data.business_challenges?.length),
        isRequired: true,
        error: !data.business_challenges?.length ? 'Selecione pelo menos um desafio' : undefined
      }
    };

    // Step 6 validation
    const step6Fields = {
      primary_goal: {
        hasValue: !!(data.primary_goal?.trim()),
        isValid: !!(data.primary_goal?.trim()),
        isRequired: true,
        error: !data.primary_goal?.trim() ? 'Objetivo principal é obrigatório' : undefined
      },
      expected_outcome_30days: {
        hasValue: !!(data.expected_outcome_30days?.trim()),
        isValid: !!(data.expected_outcome_30days?.trim()),
        isRequired: true,
        error: !data.expected_outcome_30days?.trim() ? 'Expectativa de 30 dias é obrigatória' : undefined
      }
    };

    // Step 7 validation
    const step7Fields = {
      ai_knowledge_level: {
        hasValue: !!(data.ai_knowledge_level?.trim()),
        isValid: !!(data.ai_knowledge_level?.trim()),
        isRequired: true,
        error: !data.ai_knowledge_level?.trim() ? 'Nível de conhecimento é obrigatório' : undefined
      },
      has_implemented: {
        hasValue: !!(data.has_implemented?.trim()),
        isValid: !!(data.has_implemented?.trim()),
        isRequired: true,
        error: !data.has_implemented?.trim() ? 'Implementação de IA é obrigatória' : undefined
      }
    };

    // Step 8 validation (optional fields)
    const step8Fields = {
      interests: {
        hasValue: !!(data.interests?.length),
        isValid: true,
        isRequired: false
      },
      time_preference: {
        hasValue: !!(data.time_preference?.length),
        isValid: true,
        isRequired: false
      }
    };

    const allFields = {
      ...step1Fields,
      ...step2Fields,
      ...step3Fields,
      ...step4Fields,
      ...step5Fields,
      ...step6Fields,
      ...step7Fields,
      ...step8Fields
    };

    const getStepFields = (step: number) => {
      switch (step) {
        case 1: return step1Fields;
        case 2: return step2Fields;
        case 3: return step3Fields;
        case 4: return step4Fields;
        case 5: return step5Fields;
        case 6: return step6Fields;
        case 7: return step7Fields;
        case 8: return step8Fields;
        default: return {};
      }
    };

    const currentStepFields = getStepFields(currentStep);
    const requiredFields = Object.entries(currentStepFields).filter(([_, field]) => field.isRequired);
    const allRequiredValid = requiredFields.every(([_, field]) => field.isValid);

    return {
      fields: allFields,
      currentStepFields,
      canProceed: allRequiredValid,
      hasErrors: Object.values(currentStepFields).some(field => field.error),
      errorCount: Object.values(currentStepFields).filter(field => field.error).length
    };
  }, [data, currentStep]);

  return validation;
};
