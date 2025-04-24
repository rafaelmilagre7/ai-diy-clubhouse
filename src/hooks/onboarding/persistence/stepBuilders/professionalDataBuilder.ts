
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { normalizeField } from "../utils/dataNormalization";

export function buildProfessionalDataUpdate(data: Partial<OnboardingData> | ProfessionalDataInput, progress: OnboardingProgress | null) {
  const updateObj: Record<string, any> = {};
  
  // Se temos dados profissionais diretos
  if ('company_name' in data || 'company_size' in data) {
    updateObj.company_name = data.company_name as string;
    updateObj.company_size = data.company_size as string;
    updateObj.company_sector = data.company_sector as string;
    updateObj.company_website = data.company_website as string;
    updateObj.current_position = data.current_position as string;
    updateObj.annual_revenue = data.annual_revenue as string;
    
    // Também atualizar no objeto aninhado professional_info
    updateObj.professional_info = {
      ...(progress?.professional_info || {}),
      company_name: updateObj.company_name,
      company_size: updateObj.company_size,
      company_sector: updateObj.company_sector,
      company_website: updateObj.company_website,
      current_position: updateObj.current_position,
      annual_revenue: updateObj.annual_revenue
    };
  }
  // Se temos dados aninhados em professional_info
  else if ('professional_info' in data && data.professional_info) {
    const professional_info = normalizeField(data.professional_info);
    
    updateObj.professional_info = professional_info;
    
    // Extrair também para os campos de nível superior para compatibilidade
    updateObj.company_name = professional_info.company_name;
    updateObj.company_size = professional_info.company_size;
    updateObj.company_sector = professional_info.company_sector;
    updateObj.company_website = professional_info.company_website;
    updateObj.current_position = professional_info.current_position;
    updateObj.annual_revenue = professional_info.annual_revenue;
  }
  
  return updateObj;
}
