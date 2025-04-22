
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";

export function buildProfessionalDataUpdate(data: ProfessionalDataInput, progress: OnboardingProgress | null) {
  // Começar com um objeto vazio
  const updateObj: any = {};
  
  // Dados profissionais existentes ou inicializar objeto vazio
  const existingProfessionalInfo = progress?.professional_info || {};
  
  // Identificar a fonte dos dados (dados diretos ou objeto aninhado)
  const directData = {
    company_name: data.company_name,
    company_size: data.company_size,
    company_sector: data.company_sector,
    company_website: data.company_website,
    current_position: data.current_position,
    annual_revenue: data.annual_revenue,
  };
  
  const nestedData = data.professional_info || {};
  
  // Mesclar dados, priorizando campos diretos sobre campos aninhados
  const professionalInfo = {
    ...existingProfessionalInfo,
    ...nestedData,
    company_name: directData.company_name || nestedData.company_name || existingProfessionalInfo.company_name,
    company_size: directData.company_size || nestedData.company_size || existingProfessionalInfo.company_size,
    company_sector: directData.company_sector || nestedData.company_sector || existingProfessionalInfo.company_sector,
    company_website: directData.company_website || nestedData.company_website || existingProfessionalInfo.company_website,
    current_position: directData.current_position || nestedData.current_position || existingProfessionalInfo.current_position,
    annual_revenue: directData.annual_revenue || nestedData.annual_revenue || existingProfessionalInfo.annual_revenue,
  };
  
  // Processar website para garantir que está formatado corretamente
  if (professionalInfo.company_website) {
    // Adicionar protocolo se não existir
    if (!professionalInfo.company_website.match(/^https?:\/\//)) {
      professionalInfo.company_website = `https://${professionalInfo.company_website}`;
    }
  }
  
  // Atualizar objeto de informação profissional completo
  updateObj.professional_info = professionalInfo;
  
  // Atualizar também campos individuais para compatibilidade com a estrutura atual
  updateObj.company_name = professionalInfo.company_name;
  updateObj.company_size = professionalInfo.company_size;
  updateObj.company_sector = professionalInfo.company_sector;
  updateObj.company_website = professionalInfo.company_website;
  updateObj.current_position = professionalInfo.current_position;
  updateObj.annual_revenue = professionalInfo.annual_revenue;
  
  // Retornar o objeto de atualização
  return updateObj;
}
