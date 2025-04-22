
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

  // Criar objeto de atualização base que será retornado
  const updateObj: Record<string, any> = {};
  
  // Criar cópia profunda dos dados para manipulação
  const processedData = JSON.parse(JSON.stringify(data));
  
  // Processar website para garantir formato correto
  if (processedData.company_website) {
    processedData.company_website = normalizeWebsiteUrl(processedData.company_website);
  }
  
  // Se os dados vierem dentro do objeto professional_info, também normalizar
  if (processedData.professional_info?.company_website) {
    processedData.professional_info.company_website = normalizeWebsiteUrl(
      processedData.professional_info.company_website
    );
  }
  
  // Criar objeto professional_info com dados organizados
  const professionalInfo = {
    company_name: processedData.company_name || processedData.professional_info?.company_name || '',
    company_size: processedData.company_size || processedData.professional_info?.company_size || '',
    company_sector: processedData.company_sector || processedData.professional_info?.company_sector || '',
    company_website: processedData.company_website || processedData.professional_info?.company_website || '',
    current_position: processedData.current_position || processedData.professional_info?.current_position || '',
    annual_revenue: processedData.annual_revenue || processedData.professional_info?.annual_revenue || ''
  };
  
  // Adicionar professional_info ao objeto de atualização
  updateObj.professional_info = professionalInfo;
  
  // Adicionar também os campos de nível superior para compatibilidade
  topLevelFields.forEach(field => {
    updateObj[field] = professionalInfo[field as keyof typeof professionalInfo];
  });
  
  // Registrar transformação para depuração
  console.log("Dados profissionais processados e preparados para armazenamento:", updateObj);
  
  // Usar o builder base para finalizar o objeto de atualização com os metadados necessários
  return { ...buildBaseUpdate("professional_data", processedData, progress), ...updateObj };
}
