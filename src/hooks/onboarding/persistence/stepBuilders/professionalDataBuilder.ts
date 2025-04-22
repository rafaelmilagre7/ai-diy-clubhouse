
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

  // Criar cópia profunda dos dados para manipulação
  const processedData = JSON.parse(JSON.stringify(data));
  
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
  
  // Verificar se temos dados no nível superior ou dentro de professional_info
  if (!processedData.professional_info || 
      Object.keys(processedData.professional_info).length === 0) {
    
    // Criar objeto professional_info com base nos campos de nível superior
    processedData.professional_info = {
      company_name: processedData.company_name || '',
      company_size: processedData.company_size || '',
      company_sector: processedData.company_sector || '',
      company_website: processedData.company_website || '',
      current_position: processedData.current_position || '',
      annual_revenue: processedData.annual_revenue || ''
    };

    console.log("Criado objeto professional_info a partir de campos de nível superior:", 
                processedData.professional_info);
  }
  
  // Garantir que todos os campos de nível superior também estejam populados
  topLevelFields.forEach(field => {
    if (processedData.professional_info && processedData.professional_info[field]) {
      processedData[field] = processedData.professional_info[field];
    }
  });
  
  // Registrar transformação para depuração
  console.log("Dados profissionais processados e preparados para armazenamento:", processedData);
  
  // Usar o builder base para construir o objeto de atualização com os dados processados
  return buildBaseUpdate("professional_info", processedData, progress, {
    topLevelFields
  });
}
