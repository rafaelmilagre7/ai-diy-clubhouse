
import { PersonalInfoData } from "@/types/onboarding";
import { validateLinkedInUrl, validateInstagramUrl, validateBrazilianPhone } from "@/utils/validationUtils";

/**
 * Valida os dados do formulário de informações pessoais
 * @param data Dados do formulário
 * @returns Objeto com erros de validação (vazio se não houver erros)
 */
export const validatePersonalInfoForm = (data: PersonalInfoData): Record<string, string> => {
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
  
  // Validar campos opcionais se preenchidos
  if (data.phone && !validateBrazilianPhone(data.phone)) {
    errors.phone = "Número de telefone inválido";
  }
  
  if (data.linkedin && !validateLinkedInUrl(data.linkedin)) {
    errors.linkedin = "URL do LinkedIn inválida";
  }
  
  if (data.instagram && !validateInstagramUrl(data.instagram)) {
    errors.instagram = "Usuário do Instagram inválido";
  }
  
  return errors;
};
