
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingGoals = progress?.business_goals || {};
  
  // Se os dados existentes forem uma string, tentar convertê-los para objeto
  if (typeof existingGoals === 'string') {
    try {
      // Verificar se a string não está vazia antes de tentar parsear
      if (existingGoals && existingGoals.trim() !== '') {
        existingGoals = JSON.parse(existingGoals);
      } else {
        existingGoals = {};
      }
    } catch (e) {
      console.error("Erro ao converter business_goals de string para objeto:", e);
      existingGoals = {};
    }
  } else if (typeof existingGoals === 'string' && existingGoals === '') {
    // Se for string vazia, transformar em objeto vazio
    existingGoals = {};
  }
  
  // Inicializar o objeto de atualização com os dados existentes
  updateObj.business_goals = {...existingGoals};
  
  // Verificar se estamos recebendo dados diretos ou em um objeto aninhado
  const sourceData = (data as any).business_goals || data;
  
  if (typeof sourceData === 'object' && sourceData !== null) {
    // Mesclar com dados existentes
    Object.entries(sourceData).forEach(([key, value]) => {
      // Tratamento especial para campos que devem ser arrays
      if (['expected_outcomes', 'content_formats'].includes(key)) {
        if (value !== null && value !== undefined) {
          if (!Array.isArray(value)) {
            updateObj.business_goals[key] = [value];
          } else {
            updateObj.business_goals[key] = value;
          }
        }
      } else if (key === 'live_interest' && value !== undefined) {
        // Converter para número caso seja necessário
        updateObj.business_goals[key] = typeof value === 'string' ? 
          parseInt(value, 10) || 0 : value;
      } else if (value !== undefined) {
        // Para outros campos, usar o valor diretamente
        updateObj.business_goals[key] = value;
      }
    });
    
    // Sincronização especial entre expected_outcomes e expected_outcome_30days
    if (sourceData.expected_outcome_30days && 
        (!updateObj.business_goals.expected_outcomes || 
         updateObj.business_goals.expected_outcomes.length === 0)) {
      updateObj.business_goals.expected_outcomes = [sourceData.expected_outcome_30days];
    } else if (sourceData.expected_outcomes && 
              Array.isArray(sourceData.expected_outcomes) && 
              sourceData.expected_outcomes.length > 0 &&
              !updateObj.business_goals.expected_outcome_30days) {
      updateObj.business_goals.expected_outcome_30days = sourceData.expected_outcomes[0];
    }
  }
  
  console.log("Objeto de atualização para business_goals:", updateObj);
  
  return updateObj;
}
