
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";
import { normalizeWebsiteUrl } from "@/utils/professionalDataValidation";

export function buildProfessionalDataUpdate(data: ProfessionalDataInput, progress: OnboardingProgress | null) {
  console.log("Iniciando buildProfessionalDataUpdate com dados:", data);
  
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
  
  // Criar objeto de atualização com campos em ambos os níveis
  const updateObj = {
    // Campos de nível superior para compatibilidade
    company_name: professionalInfo.company_name,
    company_size: professionalInfo.company_size,
    company_sector: professionalInfo.company_sector,
    company_website: professionalInfo.company_website,
    current_position: professionalInfo.current_position,
    annual_revenue: professionalInfo.annual_revenue,
    
    // Objeto professional_info completo
    professional_info: professionalInfo,
    
    // Marcar etapa como completa no array de etapas
    completed_steps: progress?.completed_steps ? 
      [...new Set([...progress.completed_steps, 'professional_data'])] : 
      ['professional_data']
  };
  
  console.log("Objeto de atualização preparado:", updateObj);
  
  // Importante: NÃO incluir campo "professional_data" que não existe na tabela
  return { ...buildBaseUpdate("professional_data", data, progress), ...updateObj };
}
