
import { validateBrazilianPhone, validateLinkedInUrl, validateInstagramUrl } from './validationUtils';

export interface PersonalInfoData {
  name: string;
  email: string;
  phone: string;
  ddi: string;
  linkedin: string;
  instagram: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
}

export const validatePersonalInfoForm = (data: PersonalInfoData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validar estado (obrigatório)
  if (!data.state) {
    errors.state = "Estado é obrigatório";
  }
  
  // Validar cidade (obrigatória)
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
  
  // Validar fuso horário (obrigatório)
  if (!data.timezone) {
    errors.timezone = "Fuso horário é obrigatório";
  }
  
  return errors;
};
