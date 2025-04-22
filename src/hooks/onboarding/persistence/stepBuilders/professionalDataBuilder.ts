
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";

export function buildProfessionalDataUpdate(data: Partial<OnboardingData> | ProfessionalDataInput, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  const professionalInfo = {
    ...(progress?.professional_info || {})
  };
  
  // Verificar se os dados são do tipo OnboardingData com professional_info aninhado
  if (data && typeof data === 'object' && 'professional_info' in data && data.professional_info) {
    // Caso 1: Dados aninhados em professional_info
    updateObj.professional_info = {
      ...professionalInfo,
      ...data.professional_info
    };
    
    // Sincronizar campos diretos para compatibilidade
    if (data.professional_info.company_name) updateObj.company_name = data.professional_info.company_name;
    if (data.professional_info.company_size) updateObj.company_size = data.professional_info.company_size;
    if (data.professional_info.company_sector) updateObj.company_sector = data.professional_info.company_sector;
    if (data.professional_info.company_website) updateObj.company_website = data.professional_info.company_website;
    if (data.professional_info.current_position) updateObj.current_position = data.professional_info.current_position;
    if (data.professional_info.annual_revenue) updateObj.annual_revenue = data.professional_info.annual_revenue;
  } else {
    // Caso 2: Campos diretos (ProfessionalDataInput ou objeto plano)
    // Criar objeto professional_info para o armazenamento aninhado
    const newProfessionalInfo = { ...professionalInfo };
    
    // Verificar e atualizar cada campo individual se presente nos dados
    if ('company_name' in data && data.company_name !== undefined) {
      updateObj.company_name = data.company_name;
      newProfessionalInfo.company_name = data.company_name;
    }
    
    if ('company_size' in data && data.company_size !== undefined) {
      updateObj.company_size = data.company_size;
      newProfessionalInfo.company_size = data.company_size;
    }
    
    if ('company_sector' in data && data.company_sector !== undefined) {
      updateObj.company_sector = data.company_sector;
      newProfessionalInfo.company_sector = data.company_sector;
    }
    
    if ('company_website' in data && data.company_website !== undefined) {
      updateObj.company_website = data.company_website;
      newProfessionalInfo.company_website = data.company_website;
    }
    
    if ('current_position' in data && data.current_position !== undefined) {
      updateObj.current_position = data.current_position;
      newProfessionalInfo.current_position = data.current_position;
    }
    
    if ('annual_revenue' in data && data.annual_revenue !== undefined) {
      updateObj.annual_revenue = data.annual_revenue;
      newProfessionalInfo.annual_revenue = data.annual_revenue;
    }
    
    // Atualizar o objeto aninhado
    updateObj.professional_info = newProfessionalInfo;
  }
  
  console.log("Objeto de atualização para professional_data:", updateObj);
  
  return updateObj;
}
