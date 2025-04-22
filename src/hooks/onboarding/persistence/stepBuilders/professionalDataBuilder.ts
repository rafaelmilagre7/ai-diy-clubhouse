
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeWebsite } from "../utils/dataNormalization";

export function buildProfessionalDataUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Criar um objeto de atualização explícito para a tipagem
  const updateObj: Partial<OnboardingProgress> = {
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
      
      // Atualizar no objeto principal
      professionalInfo[field] = value;
      
      // Atualizar campos de nível superior com tipagem segura
      // Usamos uma função auxiliar para garantir a tipagem correta
      updateTopLevelField(updateObj, field, value);
      
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

// Função auxiliar para atualização segura dos campos de nível superior
function updateTopLevelField(obj: Partial<OnboardingProgress>, fieldName: string, value: any): void {
  // Usamos type assertion para contornar a verificação de tipos do TypeScript
  // já que sabemos que estes campos existem no objeto OnboardingProgress
  if (fieldName === 'company_name') (obj as any).company_name = value;
  if (fieldName === 'company_size') (obj as any).company_size = value;
  if (fieldName === 'company_sector') (obj as any).company_sector = value;
  if (fieldName === 'company_website') (obj as any).company_website = value;
  if (fieldName === 'current_position') (obj as any).current_position = value;
  if (fieldName === 'annual_revenue') (obj as any).annual_revenue = value;
}
