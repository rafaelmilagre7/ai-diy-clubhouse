
import { QuickOnboardingData } from '@/types/quickOnboarding';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class OnboardingValidator {
  // Validação da Etapa 1: Informações Pessoais
  static validateStep1(data: QuickOnboardingData): ValidationResult {
    const errors: Record<string, string> = {};

    // Campos obrigatórios
    if (!data.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!data.email?.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'E-mail inválido';
    }

    if (!data.whatsapp?.trim()) {
      errors.whatsapp = 'WhatsApp é obrigatório';
    } else if (!this.isValidPhone(data.whatsapp)) {
      errors.whatsapp = 'WhatsApp inválido';
    }

    if (!data.country_code?.trim()) {
      errors.country_code = 'País é obrigatório';
    }

    if (!data.how_found_us?.trim()) {
      errors.how_found_us = 'Como conheceu o VIVER DE IA é obrigatório';
    }

    // Se escolheu indicação, precisa informar quem indicou
    if (data.how_found_us === 'indicacao' && !data.referred_by?.trim()) {
      errors.referred_by = 'Nome de quem indicou é obrigatório';
    }

    // Validação de URLs opcionais
    if (data.instagram_url && !this.isValidUrl(data.instagram_url)) {
      errors.instagram_url = 'URL do Instagram inválida';
    }

    if (data.linkedin_url && !this.isValidUrl(data.linkedin_url)) {
      errors.linkedin_url = 'URL do LinkedIn inválida';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validação da Etapa 2: Negócio
  static validateStep2(data: QuickOnboardingData): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.company_name?.trim()) {
      errors.company_name = 'Nome da empresa é obrigatório';
    }

    if (!data.role?.trim()) {
      errors.role = 'Cargo é obrigatório';
    }

    if (!data.company_size?.trim()) {
      errors.company_size = 'Tamanho da empresa é obrigatório';
    }

    if (!data.company_segment?.trim()) {
      errors.company_segment = 'Segmento da empresa é obrigatório';
    }

    if (!data.annual_revenue_range?.trim()) {
      errors.annual_revenue_range = 'Faixa de faturamento anual é obrigatória';
    }

    // Validação de business_challenges como array
    if (!Array.isArray(data.business_challenges) || data.business_challenges.length === 0) {
      errors.business_challenges = 'Selecione pelo menos um desafio do negócio';
    }

    // Validação de URL opcional
    if (data.company_website && !this.isValidUrl(data.company_website)) {
      errors.company_website = 'Website da empresa inválido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validação da Etapa 3: Experiência com IA
  static validateStep3(data: QuickOnboardingData): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.ai_knowledge_level?.trim()) {
      errors.ai_knowledge_level = 'Nível de conhecimento em IA é obrigatório';
    }

    if (!data.has_implemented?.trim()) {
      errors.has_implemented = 'Implementação de IA é obrigatória';
    }

    if (!data.primary_goal?.trim()) {
      errors.primary_goal = 'Principal objetivo é obrigatório';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validação completa de todos os dados
  static validateAllSteps(data: QuickOnboardingData): ValidationResult {
    const step1 = this.validateStep1(data);
    const step2 = this.validateStep2(data);
    const step3 = this.validateStep3(data);

    return {
      isValid: step1.isValid && step2.isValid && step3.isValid,
      errors: {
        ...step1.errors,
        ...step2.errors,
        ...step3.errors
      }
    };
  }

  // Utilitários de validação
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    // Remove formatação e verifica se tem pelo menos 10 dígitos
    const numbersOnly = phone.replace(/\D/g, '');
    return numbersOnly.length >= 10 && numbersOnly.length <= 15;
  }

  private static isValidUrl(url: string): boolean {
    try {
      // Se não tem protocolo, adiciona https://
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  }
}
