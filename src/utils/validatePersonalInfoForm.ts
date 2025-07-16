
import { validateBrazilianPhone, validateLinkedInUrl, validateInstagramUrl } from './validationUtils';

export interface PersonalInfoData {
  name: string;
  email: string;
  phone: string;
  ddi: string; // Tornando obrigatório para compatibilidade
  linkedin: string;
  instagram: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
}

// Validação específica para cada step
export const validatePersonalInfoForm = (data: PersonalInfoData, step: number = 1): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Step 1: Apenas nome e email obrigatórios
  if (step === 1) {
    // Validar nome (obrigatório)
    if (!data.name?.trim()) {
      errors.name = "Nome é obrigatório";
    } else if (data.name.trim().length < 2) {
      errors.name = "Nome deve ter pelo menos 2 caracteres";
    }
    
    // Validar email (obrigatório)
    if (!data.email?.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email inválido";
    }
    
    // Validações opcionais no Step 1
    if (data.phone && !validateBrazilianPhone(data.phone)) {
      errors.phone = "Formato inválido. Use (XX) XXXXX-XXXX";
    }
    
    if (data.linkedin && !validateLinkedInUrl(data.linkedin)) {
      errors.linkedin = "URL do LinkedIn inválida";
    }
    
    if (data.instagram && !validateInstagramUrl(data.instagram)) {
      errors.instagram = "URL do Instagram inválida";
    }
    
    return errors;
  }
  
  // Steps posteriores: validações mais rigorosas
  if (!data.name?.trim()) {
    errors.name = "Nome é obrigatório";
  } else if (data.name.trim().length < 2) {
    errors.name = "Nome deve ter pelo menos 2 caracteres";
  }
  
  if (!data.email?.trim()) {
    errors.email = "Email é obrigatório";
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "Email inválido";
  }
  
  // Validar estado (obrigatório em steps posteriores)
  if (!data.state) {
    errors.state = "Estado é obrigatório";
  }
  
  // Validar cidade (obrigatória em steps posteriores)
  if (!data.city) {
    errors.city = "Cidade é obrigatória";
  }
  
  // Validar telefone (se fornecido)
  if (data.phone && !validateBrazilianPhone(data.phone)) {
    errors.phone = "Formato inválido. Use (XX) XXXXX-XXXX";
  }
  
  // Validar LinkedIn (se fornecido)
  if (data.linkedin && !validateLinkedInUrl(data.linkedin)) {
    errors.linkedin = "URL do LinkedIn inválida";
  }
  
  // Validar Instagram (se fornecido)
  if (data.instagram && !validateInstagramUrl(data.instagram)) {
    errors.instagram = "URL do Instagram inválida";
  }
  
  // Validar fuso horário (obrigatório em steps posteriores)
  if (!data.timezone) {
    errors.timezone = "Fuso horário é obrigatório";
  }
  
  return errors;
};
