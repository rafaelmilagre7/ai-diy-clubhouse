
import { PersonalInfoData } from "@/types/onboarding";
import { validateBrazilianPhone, validateLinkedInUrl, validateInstagramUrl } from "./validationUtils";

export const validatePersonalInfoForm = (data: PersonalInfoData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validar telefone
  if (data.phone && !validateBrazilianPhone(data.phone)) {
    errors.phone = "Telefone inválido. Use o formato (99) 99999-9999";
  }

  // Validar LinkedIn
  if (data.linkedin && !validateLinkedInUrl(data.linkedin)) {
    errors.linkedin = "URL do LinkedIn inválida. Ex: https://linkedin.com/in/seu-perfil";
  }

  // Validar Instagram
  if (data.instagram && !validateInstagramUrl(data.instagram)) {
    errors.instagram = "URL do Instagram inválida. Ex: https://instagram.com/seu-perfil";
  }

  // Validar estado
  if (!data.state || data.state.length < 2) {
    errors.state = "Estado é obrigatório";
  }

  // Validar cidade
  if (!data.city || data.city.length < 2) {
    errors.city = "Cidade é obrigatória";
  }

  // Validar timezone (opcional)
  if (!data.timezone) {
    errors.timezone = "Fuso horário é obrigatório";
  }

  return errors;
};
