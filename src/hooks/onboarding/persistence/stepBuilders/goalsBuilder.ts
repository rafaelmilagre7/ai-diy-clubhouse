
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";

export function buildGoalsUpdate(data: Partial<OnboardingData> | ProfessionalDataInput, progress: OnboardingProgress | null) {
  const updateObj: Partial<OnboardingProgress> = {};
  
  // Verificar se temos dados profissionais
  if ('professional_info' in data && data.professional_info) {
    updateObj.professional_info = data.professional_info;
    
    // Campos diretos para compatibilidade
    updateObj.company_name = data.professional_info.company_name;
    updateObj.company_size = data.professional_info.company_size;
    updateObj.company_sector = data.professional_info.company_sector;
    updateObj.company_website = data.professional_info.company_website;
    updateObj.current_position = data.professional_info.current_position;
    updateObj.annual_revenue = data.professional_info.annual_revenue;
  } 
  // Verificar campos diretos
  else if ('company_name' in data || 'company_size' in data) {
    if ('company_name' in data) updateObj.company_name = data.company_name as string;
    if ('company_size' in data) updateObj.company_size = data.company_size as string;
    if ('company_sector' in data) updateObj.company_sector = data.company_sector as string;
    if ('company_website' in data) updateObj.company_website = data.company_website as string;
    if ('current_position' in data) updateObj.current_position = data.current_position as string;
    if ('annual_revenue' in data) updateObj.annual_revenue = data.annual_revenue as string;
    
    // Atualizar também no objeto aninhado
    updateObj.professional_info = {
      ...(progress?.professional_info || {}),
      ...(updateObj.company_name ? { company_name: updateObj.company_name } : {}),
      ...(updateObj.company_size ? { company_size: updateObj.company_size } : {}),
      ...(updateObj.company_sector ? { company_sector: updateObj.company_sector } : {}),
      ...(updateObj.company_website ? { company_website: updateObj.company_website } : {}),
      ...(updateObj.current_position ? { current_position: updateObj.current_position } : {}),
      ...(updateObj.annual_revenue ? { annual_revenue: updateObj.annual_revenue } : {})
    };
  }
  
  return updateObj;
}
