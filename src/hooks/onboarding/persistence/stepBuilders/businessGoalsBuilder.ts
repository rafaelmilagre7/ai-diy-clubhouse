
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

interface BusinessGoalsData {
  primary_goal?: string;
  expected_outcomes?: string[];
  expected_outcome_30days?: string;
  timeline?: string;
  priority_solution_type?: string;
  how_implement?: string;
  week_availability?: string;
  live_interest?: number;
  content_formats?: string[];
}

export function buildBusinessGoalsUpdate(
  data: Partial<OnboardingData> | BusinessGoalsData, 
  progress: OnboardingProgress | null
) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingGoals: any = {};
  
  // Verificar se temos dados válidos de progresso
  if (progress) {
    if (typeof progress.business_goals === 'string') {
      try {
        // Verificar se é uma string válida antes de tentar trim
        const stringValue = progress.business_goals ? String(progress.business_goals) : '';
        if (stringValue && typeof stringValue === 'string' && stringValue.trim()) {
          existingGoals = JSON.parse(stringValue.trim());
        }
      } catch (e) {
        console.error("Erro ao converter business_goals de string para objeto:", e);
      }
    } else if (progress.business_goals && typeof progress.business_goals === 'object') {
      existingGoals = progress.business_goals;
    }
  }
  
  // Inicializar o objeto de atualização com os dados existentes
  updateObj.business_goals = {...existingGoals};
  
  // Verificar se estamos recebendo dados diretos ou em um objeto aninhado
  const sourceData = 'business_goals' in data && data.business_goals ? data.business_goals : data;
  
  if (typeof sourceData === 'object' && sourceData !== null) {
    // Verificar se a fonte é uma BusinessGoalsData ou um objeto aninhado
    const goalsData = sourceData as BusinessGoalsData;
    
    // Mesclar com dados existentes para campos específicos
    if ('content_formats' in goalsData && goalsData.content_formats !== undefined) {
      if (!Array.isArray(goalsData.content_formats)) {
        updateObj.business_goals.content_formats = [goalsData.content_formats].filter(Boolean);
      } else {
        updateObj.business_goals.content_formats = goalsData.content_formats;
      }
    }
    
    if ('expected_outcomes' in goalsData && goalsData.expected_outcomes !== undefined) {
      if (!Array.isArray(goalsData.expected_outcomes)) {
        updateObj.business_goals.expected_outcomes = [goalsData.expected_outcomes].filter(Boolean);
      } else {
        updateObj.business_goals.expected_outcomes = goalsData.expected_outcomes;
      }
    }
    
    if ('live_interest' in goalsData && goalsData.live_interest !== undefined) {
      // Converter para número caso seja necessário
      updateObj.business_goals.live_interest = typeof goalsData.live_interest === 'string' ? 
        parseInt(goalsData.live_interest, 10) || 0 : goalsData.live_interest;
    }
    
    // Campos de string simples
    const stringFields = [
      'primary_goal', 
      'expected_outcome_30days', 
      'priority_solution_type',
      'how_implement',
      'week_availability',
      'timeline'
    ];
    
    stringFields.forEach(field => {
      if (field in goalsData && goalsData[field as keyof BusinessGoalsData] !== undefined) {
        updateObj.business_goals[field] = goalsData[field as keyof BusinessGoalsData];
      }
    });
    
    // Sincronização especial entre expected_outcomes e expected_outcome_30days
    if ('expected_outcome_30days' in goalsData && goalsData.expected_outcome_30days !== undefined) {
      if (!updateObj.business_goals.expected_outcomes || 
          !Array.isArray(updateObj.business_goals.expected_outcomes) || 
          updateObj.business_goals.expected_outcomes.length === 0) {
        updateObj.business_goals.expected_outcomes = [goalsData.expected_outcome_30days];
      }
    } 
    else if ('expected_outcomes' in goalsData && 
             Array.isArray(goalsData.expected_outcomes) && 
             goalsData.expected_outcomes.length > 0) {
      if (!updateObj.business_goals.expected_outcome_30days) {
        updateObj.business_goals.expected_outcome_30days = goalsData.expected_outcomes[0];
      }
    }
  }
  
  console.log("Objeto de atualização para business_goals:", updateObj);
  
  return updateObj;
}
