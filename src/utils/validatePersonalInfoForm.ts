
import { PersonalInfo } from "@/types/onboarding";

// Validador simples para formato de telefone brasileiro
export const validateBrazilianPhone = (phone: string): boolean => {
  // Aceitar formatado e não formatado
  // Aceita: (99) 99999-9999, 99999999999, etc.
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

// Validador de LinkedIn URL
export const validateLinkedInUrl = (url: string): boolean => {
  if (!url) return true; // Opcional
  return url.includes('linkedin.com') || url.includes('in/');
};

// Validador de Instagram
export const validateInstagramHandle = (handle: string): boolean => {
  if (!handle) return true; // Opcional
  return handle.includes('instagram.com') || handle.startsWith('@');
};

export const validatePersonalInfoForm = (data: PersonalInfo) => {
  const errors: Record<string, string> = {};

  // Validar cidade e estado (obrigatórios)
  if (!data.city) {
    errors.city = "Cidade é obrigatória";
  }

  if (!data.state) {
    errors.state = "Estado é obrigatório";
  }

  // Validar timezone (obrigatório)
  if (!data.timezone) {
    errors.timezone = "Fuso horário é obrigatório";
  }

  // Validar telefone (opcional, mas se preenchido deve ser válido)
  if (data.phone && !validateBrazilianPhone(data.phone)) {
    errors.phone = "Formato de telefone inválido";
  }
  
  // Validar DDI (se existe, verificar formatação)
  if (data.ddi && !data.ddi.startsWith('+')) {
    // Corrigir automaticamente ao invés de mostrar erro
    data.ddi = "+" + data.ddi.replace(/\+/g, '');
    console.log("DDI corrigido na validação:", data.ddi);
  }

  // Validar LinkedIn (opcional, mas se preenchido deve ser URL válida)
  if (data.linkedin && !validateLinkedInUrl(data.linkedin)) {
    errors.linkedin = "URL do LinkedIn inválida";
  }

  // Validar Instagram (opcional, mas se preenchido deve ter formato válido)
  if (data.instagram && !validateInstagramHandle(data.instagram)) {
    errors.instagram = "Nome de usuário do Instagram inválido";
  }

  return errors;
};
