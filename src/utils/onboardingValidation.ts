import { useMemo } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export class OnboardingValidator {
  private static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  private static urlRegex = /^https?:\/\/.+\..+/;

  static validateStep1(data: Partial<QuickOnboardingData>): ValidationResult {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Validações obrigatórias
    if (!data.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (data.name.length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!data.email?.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!this.emailRegex.test(data.email)) {
      errors.email = 'E-mail deve ter um formato válido';
    }

    if (!data.whatsapp?.trim()) {
      errors.whatsapp = 'WhatsApp é obrigatório';
    } else if (!this.phoneRegex.test(data.whatsapp)) {
      errors.whatsapp = 'WhatsApp deve estar no formato (11) 99999-9999';
    }

    if (!data.country_code) {
      errors.country_code = 'País é obrigatório';
    }

    if (!data.how_found_us) {
      errors.how_found_us = 'Como nos conheceu é obrigatório';
    }

    if (data.how_found_us === 'indicacao' && !data.referred_by?.trim()) {
      errors.referred_by = 'Nome de quem indicou é obrigatório';
    }

    // Validações opcionais com warnings
    if (data.instagram_url && !this.urlRegex.test(data.instagram_url)) {
      warnings.instagram_url = 'URL do Instagram parece inválida';
    }

    if (data.linkedin_url && !this.urlRegex.test(data.linkedin_url)) {
      warnings.linkedin_url = 'URL do LinkedIn parece inválida';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  static validateStep2(data: Partial<QuickOnboardingData>): ValidationResult {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    if (!data.company_name?.trim()) {
      errors.company_name = 'Nome da empresa é obrigatório';
    }

    if (!data.role?.trim()) {
      errors.role = 'Cargo é obrigatório';
    }

    if (!data.company_size) {
      errors.company_size = 'Tamanho da empresa é obrigatório';
    }

    if (!data.company_segment) {
      errors.company_segment = 'Segmento da empresa é obrigatório';
    }

    if (!data.annual_revenue_range) {
      errors.annual_revenue_range = 'Faturamento anual é obrigatório';
    }

    if (!data.main_challenge?.trim()) {
      errors.main_challenge = 'Principal desafio é obrigatório';
    }

    if (data.company_website && !this.urlRegex.test(data.company_website)) {
      warnings.company_website = 'URL do site parece inválida';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  static validateStep3(data: Partial<QuickOnboardingData>): ValidationResult {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    if (!data.ai_knowledge_level) {
      errors.ai_knowledge_level = 'Nível de conhecimento em IA é obrigatório';
    }

    if (!data.uses_ai) {
      errors.uses_ai = 'Frequência de uso de IA é obrigatória';
    }

    if (!data.main_goal) {
      errors.main_goal = 'Principal objetivo com IA é obrigatório';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  static validateAllSteps(data: QuickOnboardingData): ValidationResult {
    const step1 = this.validateStep1(data);
    const step2 = this.validateStep2(data);
    const step3 = this.validateStep3(data);

    return {
      isValid: step1.isValid && step2.isValid && step3.isValid,
      errors: { ...step1.errors, ...step2.errors, ...step3.errors },
      warnings: { ...step1.warnings, ...step2.warnings, ...step3.warnings }
    };
  }
}

// Hook para validação reativa
export const useOnboardingValidation = (
  data: Partial<QuickOnboardingData>,
  currentStep: number
) => {
  return useMemo(() => {
    switch (currentStep) {
      case 1:
        return OnboardingValidator.validateStep1(data);
      case 2:
        return OnboardingValidator.validateStep2(data);
      case 3:
        return OnboardingValidator.validateStep3(data);
      default:
        return { isValid: true, errors: {}, warnings: {} };
    }
  }, [data, currentStep]);
};
