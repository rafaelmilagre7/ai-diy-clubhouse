
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";

export function buildProfessionalDataUpdate(
  data: ProfessionalDataInput, 
  progress: OnboardingProgress | null
) {
  const updateObj: any = {};
  
  console.log("Construindo dados profissionais para salvar:", data);

  // Dados profissionais
  const professionalInfo = {
    company_name: data.company_name || data.professional_info?.company_name || "",
    company_size: data.company_size || data.professional_info?.company_size || "",
    company_sector: data.company_sector || data.professional_info?.company_sector || "",
    company_website: data.company_website || data.professional_info?.company_website || "",
    current_position: data.current_position || data.professional_info?.current_position || "",
    annual_revenue: data.annual_revenue || data.professional_info?.annual_revenue || "",
  };

  // Log detalhado dos dados
  console.log("Dados profissionais normalizados:", professionalInfo);

  // Adicionar dados ao objeto de atualização
  updateObj.professional_info = professionalInfo;
  
  // Adicionar campos de nível superior para compatibilidade
  updateObj.company_name = professionalInfo.company_name;
  updateObj.company_size = professionalInfo.company_size;
  updateObj.company_sector = professionalInfo.company_sector;
  updateObj.company_website = professionalInfo.company_website;
  updateObj.current_position = professionalInfo.current_position;
  updateObj.annual_revenue = professionalInfo.annual_revenue;

  // Validações adicionais
  if (!updateObj.company_name) {
    console.warn("Nome da empresa não foi preenchido");
  }

  return updateObj;
}
