
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

type ProfessionalDataInput = Partial<OnboardingData> & {
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  current_position?: string;
  annual_revenue?: string;
  professional_info?: OnboardingData['professional_info'];
};

export function buildProfessionalDataUpdate(data: ProfessionalDataInput, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Se já temos dados em professional_info, usamos eles como base
  const existingProfessionalInfo = progress?.professional_info || {};
  
  // Processamos dados profissionais que podem vir de ambas as fontes
  const professionalInfo = {
    ...existingProfessionalInfo,
    ...(data.professional_info || {}),
    // Priorizar os campos individuais sobre os agrupados, caso ambos estejam presentes
    company_name: data.company_name || data.professional_info?.company_name || existingProfessionalInfo.company_name,
    company_size: data.company_size || data.professional_info?.company_size || existingProfessionalInfo.company_size,
    company_sector: data.company_sector || data.professional_info?.company_sector || existingProfessionalInfo.company_sector,
    company_website: data.company_website || data.professional_info?.company_website || existingProfessionalInfo.company_website,
    current_position: data.current_position || data.professional_info?.current_position || existingProfessionalInfo.current_position,
    annual_revenue: data.annual_revenue || data.professional_info?.annual_revenue || existingProfessionalInfo.annual_revenue,
  };
  
  // Atualizar objeto principal
  updateObj.professional_info = professionalInfo;
  
  // Adicionar também como campos de nível superior para compatibilidade
  updateObj.company_name = professionalInfo.company_name;
  updateObj.company_size = professionalInfo.company_size;
  updateObj.company_sector = professionalInfo.company_sector;
  updateObj.company_website = professionalInfo.company_website;
  updateObj.current_position = professionalInfo.current_position;
  updateObj.annual_revenue = professionalInfo.annual_revenue;
  
  return updateObj;
}
