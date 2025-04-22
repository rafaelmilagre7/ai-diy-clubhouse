
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";
import { normalizeWebsiteUrl } from "@/utils/professionalDataValidation";

/**
 * Builder específico para dados profissionais
 * Processa e normaliza os dados antes de armazená-los no Supabase
 */
export function buildProfessionalDataUpdate(data: ProfessionalDataInput, progress: OnboardingProgress | null) {
  console.log("Iniciando buildProfessionalDataUpdate com dados:", data);
  
  // Definir os campos que existem no nível superior do progresso
  const topLevelFields = [
    "company_name",
    "company_size",
    "company_sector",
    "company_website",
    "current_position",
    "annual_revenue"
  ];

  // Criar objeto de atualização base
  const updateObj: Record<string, any> = {};
  
  // Processar website para garantir formato correto
  let processedData = { ...data };
  if (processedData.company_website) {
    processedData.company_website = normalizeWebsiteUrl(processedData.company_website);
  }
  
  // Estruturar o objeto professional_info
  const professionalInfo = {
    company_name: processedData.company_name || '',
    company_size: processedData.company_size || '',
    company_sector: processedData.company_sector || '',
    company_website: processedData.company_website || '',
    current_position: processedData.current_position || '',
    annual_revenue: processedData.annual_revenue || ''
  };
  
  // Adicionar professional_info ao objeto de atualização
  updateObj.professional_info = professionalInfo;
  
  // Adicionar também os campos individuais de nível superior para compatibilidade
  topLevelFields.forEach(field => {
    updateObj[field] = professionalInfo[field as keyof typeof professionalInfo];
  });
  
  console.log("Dados profissionais processados:", updateObj);
  
  // Usar o builder base para finalizar o objeto de atualização
  return { ...buildBaseUpdate("professional_data", data, progress), ...updateObj };
}
