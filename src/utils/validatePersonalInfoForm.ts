
import { PersonalInfoData } from "@/types/onboarding";
import { validateBrazilianPhone, validateLinkedInUrl, validateInstagramUrl } from "./validationUtils";

/**
 * Valida os dados do formulário de informações pessoais
 * @param data Dados do formulário
 * @returns Objeto com erros, se houver
 */
export const validatePersonalInfoForm = (data: Partial<PersonalInfoData>) => {
  const errors: Record<string, string> = {};

  // Validar campos obrigatórios
  if (!data.state) {
    errors.state = "Estado é obrigatório";
  }

  if (!data.city) {
    errors.city = "Cidade é obrigatória";
  }
  
  if (!data.timezone) {
    errors.timezone = "Fuso horário é obrigatório";
  }

  // Validar telefone se informado
  if (data.phone && data.phone.trim() !== '') {
    if (!validateBrazilianPhone(data.phone)) {
      errors.phone = "Formato de telefone inválido";
    }
  }

  // Validar LinkedIn se informado
  if (data.linkedin && data.linkedin.trim() !== '') {
    if (!validateLinkedInUrl(data.linkedin)) {
      errors.linkedin = "URL do LinkedIn inválida";
    }
  }

  // Validar Instagram se informado
  if (data.instagram && data.instagram.trim() !== '') {
    if (!validateInstagramUrl(data.instagram)) {
      errors.instagram = "Username do Instagram inválido";
    }
  }

  return errors;
};
