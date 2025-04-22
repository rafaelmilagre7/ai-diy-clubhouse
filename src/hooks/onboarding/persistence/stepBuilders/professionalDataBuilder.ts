
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
  
  // Estruturar o objeto professional_info com todos os campos necessários
  const professionalInfo = {
    company_name: processedData.company_name || '',
    company_size: processedData.company_size || '',
    company_sector: processedData.company_sector || '',
    company_website: processedData.company_website || '',
    current_position: processedData.current_position || '',
    annual_revenue: processedData.annual_revenue || ''
  };
  
  // Criar objeto de atualização apenas com os campos que existem na tabela
  const updateObj = {
    // Objeto professional_info completo
    professional_info: professionalInfo,
    
    // Campos individuais para compatibilidade com o banco
    company_name: professionalInfo.company_name,
    company_size: professionalInfo.company_size,
    company_sector: professionalInfo.company_sector,
    company_website: professionalInfo.company_website,
    current_position: professionalInfo.current_position,
    annual_revenue: professionalInfo.annual_revenue,
    
    // Marcar etapa como completa
    completed_steps: progress?.completed_steps ? 
      [...new Set([...progress.completed_steps, 'professional_data'])] : 
      ['professional_data']
  };
  
  console.log("Objeto de atualização preparado:", updateObj);
  
  return { ...buildBaseUpdate("professional_data", data, progress), ...updateObj };
}
