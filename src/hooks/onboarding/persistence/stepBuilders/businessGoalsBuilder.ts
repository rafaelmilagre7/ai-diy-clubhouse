
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
    // Mesclar com dados existentes
    Object.entries(sourceData).forEach(([key, value]) => {
      // Tratar campos específicos
      if (key === 'content_formats' || key === 'expected_outcomes') {
        if (value !== null && value !== undefined) {
          if (!Array.isArray(value)) {
            updateObj.business_goals[key] = [value].filter(Boolean);
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
    // Obter as referências para processamento condicional
    const goalsData = sourceData as BusinessGoalsData;
    
    // Verificar se temos expected_outcome_30days nos dados de origem
    if ('expected_outcome_30days' in goalsData && 
        goalsData.expected_outcome_30days !== undefined) {
      
      // Se não temos expected_outcomes, inicializá-lo com expected_outcome_30days
      if (!updateObj.business_goals.expected_outcomes || 
          !Array.isArray(updateObj.business_goals.expected_outcomes) || 
          updateObj.business_goals.expected_outcomes.length === 0) {
        updateObj.business_goals.expected_outcomes = [goalsData.expected_outcome_30days];
      }
    } 
    // Verificar se temos expected_outcomes nos dados de origem
    else if ('expected_outcomes' in goalsData && 
             Array.isArray(goalsData.expected_outcomes) && 
             goalsData.expected_outcomes.length > 0) {
      
      // Se não temos expected_outcome_30days, inicializá-lo com o primeiro expected_outcomes
      if (!updateObj.business_goals.expected_outcome_30days) {
        updateObj.business_goals.expected_outcome_30days = goalsData.expected_outcomes[0];
      }
    }
  }
  
  console.log("Objeto de atualização para business_goals:", updateObj);
  
  return updateObj;
}
