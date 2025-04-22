
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";

/**
 * Builder específico para dados profissionais
 * Utiliza o builder base para garantir consistência e evitar duplicação
 */
export function buildProfessionalDataUpdate(data: ProfessionalDataInput, progress: OnboardingProgress | null) {
  // Definir os campos que também existem no nível superior do progresso
  const topLevelFields = [
    "company_name",
    "company_size",
    "company_sector",
    "company_website",
    "current_position",
    "annual_revenue"
  ];

  // Processar website para garantir formato correto (antes de enviar ao builder)
  if (data.company_website && !data.company_website.match(/^https?:\/\//)) {
    data.company_website = `https://${data.company_website}`;
  }
  
  // Usar o builder base para construir o objeto de atualização
  return buildBaseUpdate("professional_info", data, progress, {
    topLevelFields
  });
}
