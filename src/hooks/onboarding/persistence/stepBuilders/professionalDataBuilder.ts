
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeWebsite } from "../utils/dataNormalization";

export function buildProfessionalDataUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Criar um objeto de retorno com tipagem correta
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
    if (professionalData[field as keyof typeof professionalData]) {
      let value = professionalData[field as keyof typeof professionalData];
      
      // Formatação especial para website
      if (field === 'company_website' && value) {
        value = normalizeWebsite(value as string);
      }
      
      // Atualizar no objeto professional_info
      professionalInfo[field] = value;
      
      // Atualizar campos de nível superior de forma segura usando tipagem assertiva explícita
      if (field === 'company_name') {
        (updateObj as any).company_name = value;
      } 
      else if (field === 'company_size') {
        (updateObj as any).company_size = value;
      }
      else if (field === 'company_sector') {
        (updateObj as any).company_sector = value;
      }
      else if (field === 'company_website') {
        (updateObj as any).company_website = value;
      }
      else if (field === 'current_position') {
        (updateObj as any).current_position = value;
      }
      else if (field === 'annual_revenue') {
        (updateObj as any).annual_revenue = value;
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
