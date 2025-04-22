
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";
import { normalizeWebsiteUrl } from "@/utils/professionalDataValidation";

/**
 * Builder específico para dados profissionais
 * Processa e normaliza os dados antes de armazená-los no Supabase
 * Estrutura os dados de forma semântica para facilitar interpretação por IA
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

  // Criar cópia dos dados para manipulação
  const processedData = { ...data };
  
  // Processar website para garantir formato correto (antes de enviar ao builder)
  if (processedData.company_website) {
    processedData.company_website = normalizeWebsiteUrl(processedData.company_website);
  }
  
  // Se os dados vierem dentro do objeto professional_info, também normalizar
  if (processedData.professional_info?.company_website) {
    processedData.professional_info.company_website = normalizeWebsiteUrl(
      processedData.professional_info.company_website
    );
  }
  
  // Criar uma versão atualizada de professional_info com os dados, se necessário
  if (processedData.professional_info) {
    // Criar cópia para não modificar diretamente o objeto original
    processedData.professional_info = {
      ...processedData.professional_info
    };
  }
  
  // Registrar transformação para depuração
  console.log("Dados profissionais processados e preparados para armazenamento:", processedData);
  
  // Usar o builder base para construir o objeto de atualização com os dados processados
  return buildBaseUpdate("professional_info", processedData, progress, {
    topLevelFields
  });
}
