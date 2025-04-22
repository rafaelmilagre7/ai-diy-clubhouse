
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeWebsite } from "../utils/dataNormalization";

export function buildProfessionalDataUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Criar um objeto de atualização usando interface explícita para o tipo
  const updateObj: Record<string, any> = {
    ...(progress || {}),
    professional_info: { ...(progress?.professional_info || {}) }
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
      
      // Atualizar campos de nível superior - usando Record<string, any> evitamos o problema de tipagem
      if (field === 'company_name') updateObj['company_name'] = value;
      if (field === 'company_size') updateObj['company_size'] = value;
      if (field === 'company_sector') updateObj['company_sector'] = value;
      if (field === 'company_website') updateObj['company_website'] = value;
      if (field === 'current_position') updateObj['current_position'] = value;
      if (field === 'annual_revenue') updateObj['annual_revenue'] = value;
      
      hasUpdates = true;
    }
  });
  
  // Adicionar objeto professional_info atualizado
  if (hasUpdates) {
    updateObj.professional_info = professionalInfo;
  }
  
  console.log("Objeto de atualização para dados profissionais:", updateObj);
  
  // Convertemos de volta para o tipo esperado antes de retornar
  return updateObj as Partial<OnboardingProgress>;
}
