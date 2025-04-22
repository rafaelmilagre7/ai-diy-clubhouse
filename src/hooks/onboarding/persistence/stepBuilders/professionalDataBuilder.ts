
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeWebsite } from "../utils/dataNormalization";

export function buildProfessionalDataUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Criamos um objeto temporário que pode receber qualquer propriedade
  const tempObj: Record<string, any> = {
    ...(progress ? { 
      id: progress.id,
      user_id: progress.user_id,
      completed_steps: progress.completed_steps,
      is_completed: progress.is_completed
    } : {}),
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
      
      // Atualizar no objeto professional_info
      professionalInfo[field] = value;
      
      // Atualizar campos de nível superior - usando nosso objeto temporário
      tempObj[field] = value;
      
      hasUpdates = true;
    }
  });
  
  // Adicionar objeto professional_info atualizado
  if (hasUpdates) {
    tempObj.professional_info = professionalInfo;
  }
  
  console.log("Objeto de atualização para dados profissionais:", tempObj);
  
  // Convertemos para o tipo esperado antes de retornar
  return tempObj as Partial<OnboardingProgress>;
}
