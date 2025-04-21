
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  const existingBusinessGoals = progress?.business_goals || {};
  
  if ((data as any).business_goals) {
    const businessGoalsData = (data as any).business_goals;
    
    // Garantir sincronização entre expected_outcome_30days e expected_outcomes
    if (businessGoalsData.expected_outcome_30days && !businessGoalsData.expected_outcomes) {
      businessGoalsData.expected_outcomes = [businessGoalsData.expected_outcome_30days];
    } else if (
      businessGoalsData.expected_outcomes &&
      Array.isArray(businessGoalsData.expected_outcomes) &&
      businessGoalsData.expected_outcomes.length > 0 &&
      !businessGoalsData.expected_outcome_30days
    ) {
      businessGoalsData.expected_outcome_30days = businessGoalsData.expected_outcomes[0];
    }
    
    updateObj.business_goals = {
      ...existingBusinessGoals,
      ...businessGoalsData
    };
  } else if (typeof data === 'object' && data !== null) {
    // Verificar se estamos trabalhando com dados diretos
    const receivedData = data as any;
    
    // Inicializar com dados existentes
    updateObj.business_goals = { ...existingBusinessGoals };
    
    // Adicionar novos dados
    if (receivedData.primary_goal) updateObj.business_goals.primary_goal = receivedData.primary_goal;
    if (receivedData.expected_outcome_30days) {
      updateObj.business_goals.expected_outcome_30days = receivedData.expected_outcome_30days;
      
      // Sincronizar com expected_outcomes
      if (!updateObj.business_goals.expected_outcomes) {
        updateObj.business_goals.expected_outcomes = [receivedData.expected_outcome_30days];
      } else if (!updateObj.business_goals.expected_outcomes.includes(receivedData.expected_outcome_30days)) {
        updateObj.business_goals.expected_outcomes = [
          receivedData.expected_outcome_30days,
          ...updateObj.business_goals.expected_outcomes
        ];
      }
    }
    
    if (receivedData.expected_outcomes && Array.isArray(receivedData.expected_outcomes)) {
      updateObj.business_goals.expected_outcomes = receivedData.expected_outcomes;
      
      // Sincronizar com expected_outcome_30days se necessário
      if (!updateObj.business_goals.expected_outcome_30days && receivedData.expected_outcomes.length > 0) {
        updateObj.business_goals.expected_outcome_30days = receivedData.expected_outcomes[0];
      }
    }
    
    // Copiar outros campos relevantes
    ['priority_solution_type', 'how_implement', 'week_availability', 'live_interest', 'content_formats', 'timeline']
      .forEach(field => {
        if (receivedData[field] !== undefined) {
          updateObj.business_goals[field] = receivedData[field];
        }
      });
  }
  
  return updateObj;
}
