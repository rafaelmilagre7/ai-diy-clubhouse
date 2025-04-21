
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildProfessionalDataUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir que o bloco professional_info seja atualizado corretamente
  if (data.professional_info) {
    updateObj.professional_info = data.professional_info;
    
    // Adicionar também como campos de nível superior para compatibilidade
    updateObj.company_name = data.professional_info.company_name;
    updateObj.company_size = data.professional_info.company_size;
    updateObj.company_sector = data.professional_info.company_sector;
    updateObj.company_website = data.professional_info.company_website;
    updateObj.current_position = data.professional_info.current_position;
    updateObj.annual_revenue = data.professional_info.annual_revenue;
  }
  
  return updateObj;
}
