
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingBusinessGoals: any = {};
  
  // Verificar se temos dados válidos de progresso
  if (progress) {
    if (typeof progress.business_goals === 'string') {
      try {
        const trimmedValue = String(progress.business_goals).trim();
        if (trimmedValue !== '') {
          existingBusinessGoals = JSON.parse(trimmedValue);
          console.log("business_goals convertido de string para objeto:", existingBusinessGoals);
        }
      } catch (e) {
        console.error("Erro ao converter business_goals de string para objeto:", e);
      }
    } else if (progress.business_goals && typeof progress.business_goals === 'object') {
      existingBusinessGoals = progress.business_goals;
    }
  }
  
  // Inicializar o objeto de atualização com os dados existentes
  updateObj.business_goals = {...existingBusinessGoals};
  
  // Verificar se estamos recebendo dados diretos ou em um objeto aninhado
  const sourceData = data.business_goals || data;
  
  if (typeof sourceData === 'object' && sourceData !== null) {
    // Debug: Logue o objeto de origem para verificar estrutura
    console.log("Dados de origem para business_goals:", JSON.stringify(sourceData, null, 2));
    
    // Processar campos de string
    ['primary_goal', 'expected_outcome_30days', 'timeline', 'priority_solution_type', 
     'how_implement', 'week_availability'].forEach(field => {
      if (field in sourceData && sourceData[field as keyof typeof sourceData]) {
        updateObj.business_goals[field] = sourceData[field as keyof typeof sourceData];
        console.log(`Definindo ${field}:`, updateObj.business_goals[field]);
      }
    });
    
    // Processar campos de array
    ['expected_outcomes', 'content_formats'].forEach(field => {
      if (field in sourceData && sourceData[field as keyof typeof sourceData]) {
        const fieldValue = Array.isArray(sourceData[field as keyof typeof sourceData]) ? 
          sourceData[field as keyof typeof sourceData] : 
          [sourceData[field as keyof typeof sourceData]].filter(Boolean);
          
        if (fieldValue.length > 0) {
          updateObj.business_goals[field] = fieldValue;
          console.log(`Definindo ${field}:`, updateObj.business_goals[field]);
        }
      }
    });
    
    // Processar campos numéricos
    if ('live_interest' in sourceData && sourceData.live_interest !== undefined) {
      updateObj.business_goals.live_interest = typeof sourceData.live_interest === 'string' ? 
        parseInt(sourceData.live_interest, 10) : 
        sourceData.live_interest;
      console.log(`Definindo live_interest:`, updateObj.business_goals.live_interest);
    }
    
    // Garantir que temos campos obrigatórios
    if (!updateObj.business_goals.expected_outcomes) {
      updateObj.business_goals.expected_outcomes = [];
    }
    
    // Adicionar o resultado de 30 dias aos resultados esperados
    if (updateObj.business_goals.expected_outcome_30days && 
        !updateObj.business_goals.expected_outcomes.includes(updateObj.business_goals.expected_outcome_30days)) {
      updateObj.business_goals.expected_outcomes = [
        updateObj.business_goals.expected_outcome_30days,
        ...updateObj.business_goals.expected_outcomes
      ].filter(Boolean);
    }
  }
  
  console.log("Objeto de atualização final para business_goals:", JSON.stringify(updateObj, null, 2));
  
  return updateObj;
}
