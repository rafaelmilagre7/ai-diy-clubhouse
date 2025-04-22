
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeWebsite } from "../utils/dataNormalization";

export function buildProfessionalDataUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Criar um objeto de retorno com tipagem explícita
  const updateObj: Partial<OnboardingProgress> = {};
  
  // Se tivermos um objeto de progresso existente, copiar campos relevantes
  if (progress) {
    updateObj.id = progress.id;
    updateObj.user_id = progress.user_id;
    updateObj.completed_steps = progress.completed_steps;
    updateObj.is_completed = progress.is_completed;
    
    // Inicializar o objeto professional_info se existir no progresso
    updateObj.professional_info = progress.professional_info 
      ? { ...progress.professional_info } 
      : {};
  } else {
    // Inicializar objeto vazio se não tivermos progresso
    updateObj.professional_info = {};
  }
  
  // Verificar se temos dados diretos ou dentro do objeto professional_info
  const professionalData = data.professional_info || data;
  
  // Criar objeto de dados profissionais temporário para manipulação
  const professionalInfo: Record<string, any> = {
    ...(updateObj.professional_info || {})
  };

  // Campos a serem verificados e atualizados
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
    if (professionalData && typeof professionalData === 'object' && field in professionalData) {
      const value = professionalData[field as keyof typeof professionalData];
      
      // Formatação especial para website
      if (field === 'company_website' && value && typeof value === 'string') {
        professionalInfo[field] = normalizeWebsite(value);
        updateObj[field as keyof OnboardingProgress] = normalizeWebsite(value);
      } else {
        professionalInfo[field] = value;
        
        // Atualizar campo de nível superior com type assertion para evitar erros de tipagem
        (updateObj as any)[field] = value;
      }
      
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
