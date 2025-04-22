
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeWebsite } from "../utils/dataNormalization";

export function buildProfessionalDataUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Create a mutable copy of the progress object to modify
  const updateObj: Partial<OnboardingProgress> = {
    ...progress,
    professional_info: progress?.professional_info || {},
  };
  
  // Verificar se temos dados diretos ou dentro do objeto professional_info
  const professionalData = data.professional_info || data;
  
  // Criar objeto de dados profissionais
  const professionalInfo: any = {
    ...progress?.professional_info || {},
  };

  // Atualizar campos do objeto professional_info
  const fieldsToCheck = [
    'company_name', 
    'company_size', 
    'company_sector', 
    'company_website', 
    'current_position', 
    'annual_revenue'
  ];
  
  // Verificar cada campo para atualização
  let hasUpdates = false;
  
  fieldsToCheck.forEach(field => {
    if (professionalData[field as keyof typeof professionalData]) {
      let value = professionalData[field as keyof typeof professionalData];
      
      // Formatação especial para website
      if (field === 'company_website' && value) {
        value = normalizeWebsite(value as string);
      }
      
      // Atualizar no objeto principal
      professionalInfo[field] = value;
      
      // Atualizar campos de nível superior
      if (field === 'company_name') updateObj.company_name = value as string;
      if (field === 'company_size') updateObj.company_size = value as string;
      if (field === 'company_sector') updateObj.company_sector = value as string;
      if (field === 'company_website') updateObj.company_website = value as string;
      if (field === 'current_position') updateObj.current_position = value as string;
      if (field === 'annual_revenue') updateObj.annual_revenue = value as string;
      
      hasUpdates = true;
    }
  });
  
  // Adicionar objeto professional_info atualizado
  if (hasUpdates) {
    updateObj.professional_info = professionalInfo;
  }
  
  console.log("Objeto de atualização para dados profissionais:", updateObj);
  
  return updateObj;
}
