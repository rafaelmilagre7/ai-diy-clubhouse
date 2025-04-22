
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";

export function buildProfessionalDataUpdate(data: Partial<OnboardingData> | ProfessionalDataInput, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Verificar se temos professional_info ou company_name
  if (data.professional_info || 'company_name' in data) {
    // Verificar se os dados vieram no formato aninhado ou plano
    if (data.professional_info) {
      updateObj.professional_info = {
        ...(progress?.professional_info || {}),
        ...data.professional_info
      };
      
      // Sincronizar com campos diretos para compatibilidade
      if (data.professional_info.company_name) updateObj.company_name = data.professional_info.company_name;
      if (data.professional_info.company_size) updateObj.company_size = data.professional_info.company_size;
      if (data.professional_info.company_sector) updateObj.company_sector = data.professional_info.company_sector;
      if (data.professional_info.company_website) updateObj.company_website = data.professional_info.company_website;
      if (data.professional_info.current_position) updateObj.current_position = data.professional_info.current_position;
      if (data.professional_info.annual_revenue) updateObj.annual_revenue = data.professional_info.annual_revenue;
    } else {
      // Processar campos diretos
      const professionalInfo = {
        ...(progress?.professional_info || {}),
      };
      
      // Atualizar campos individuais se presentes nos dados
      if ('company_name' in data && data.company_name !== undefined) {
        updateObj.company_name = data.company_name;
        professionalInfo.company_name = data.company_name;
      }
      
      if ('company_size' in data && data.company_size !== undefined) {
        updateObj.company_size = data.company_size;
        professionalInfo.company_size = data.company_size;
      }
      
      if ('company_sector' in data && data.company_sector !== undefined) {
        updateObj.company_sector = data.company_sector;
        professionalInfo.company_sector = data.company_sector;
      }
      
      if ('company_website' in data && data.company_website !== undefined) {
        updateObj.company_website = data.company_website;
        professionalInfo.company_website = data.company_website;
      }
      
      if ('current_position' in data && data.current_position !== undefined) {
        updateObj.current_position = data.current_position;
        professionalInfo.current_position = data.current_position;
      }
      
      if ('annual_revenue' in data && data.annual_revenue !== undefined) {
        updateObj.annual_revenue = data.annual_revenue;
        professionalInfo.annual_revenue = data.annual_revenue;
      }
      
      // Atualizar o objeto aninhado
      updateObj.professional_info = professionalInfo;
    }
  }
  
  console.log("Objeto de atualização para professional_data:", updateObj);
  
  return updateObj;
}
