
import { PersonalInfoData } from "@/types/onboarding";
import { validateBrazilianPhone, validateLinkedInUrl, validateInstagramUrl } from "./validationUtils";

export const validatePersonalInfoForm = (data: PersonalInfoData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validar nome e email (opcionalmente, se necessário validar)
  // Campos name e email já são validados em outros lugares e são preenchidos automaticamente

  // Validar telefone (opcional)
  if (data.phone && !validateBrazilianPhone(data.phone)) {
    errors.phone = "Telefone inválido. Use o formato (99) 99999-9999";
  }

  // Validar LinkedIn (opcional)
  if (data.linkedin && !validateLinkedInUrl(data.linkedin)) {
    errors.linkedin = "URL do LinkedIn inválida. Ex: https://linkedin.com/in/seu-perfil";
  }

  // Validar Instagram (opcional)
  if (data.instagram && !validateInstagramUrl(data.instagram)) {
    errors.instagram = "URL do Instagram inválida. Ex: https://instagram.com/seu-perfil";
  }

  // Validar estado
  if (!data.state || data.state.trim().length < 2) {
    errors.state = "Estado é obrigatório";
  }

  // Validar cidade
  if (!data.city || data.city.trim().length < 2) {
    errors.city = "Cidade é obrigatória";
  }

  // Validar timezone
  if (!data.timezone) {
    errors.timezone = "Fuso horário é obrigatório";
  }

  return errors;
};
