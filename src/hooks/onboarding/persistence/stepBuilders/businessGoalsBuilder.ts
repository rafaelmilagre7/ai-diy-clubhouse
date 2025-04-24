
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeBusinessGoals } from "../utils/dataNormalization";

export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Verificações iniciais
  if (!data) {
    console.warn("Dados vazios recebidos em buildBusinessGoalsUpdate");
    return updateObj;
  }
  
  // Garantir base consistente para os dados
  let existingBusinessGoals = {};
  
  // Verificar se temos dados de progresso válidos
  if (progress && progress.business_goals) {
    if (typeof progress.business_goals === 'string') {
      try {
        existingBusinessGoals = JSON.parse(progress.business_goals as string);
      } catch (e) {
        console.error("Erro ao converter business_goals de string para objeto:", e);
      }
    } else if (typeof progress.business_goals === 'object') {
      existingBusinessGoals = progress.business_goals;
    }
  }
  
  // Normalizar dados existentes
  existingBusinessGoals = normalizeBusinessGoals(existingBusinessGoals);
  
  // Verificar se estamos recebendo dados específicos de business_goals ou são dados aninhados
  const businessGoalsData = data.business_goals || {};
  
  // Se não tivermos dados específicos, não fazer atualização
  if (Object.keys(businessGoalsData).length === 0) {
    console.warn("Nenhum dado específico de business_goals encontrado para atualização");
    return updateObj;
  }
  
  // Construir objeto de atualização
  updateObj.business_goals = {
    ...existingBusinessGoals,
    ...businessGoalsData
  };
  
  // Garantir que expected_outcomes é um array
  if (!Array.isArray(updateObj.business_goals.expected_outcomes)) {
    updateObj.business_goals.expected_outcomes = [];
  }
  
  // Adicionar expected_outcome_30days aos expected_outcomes se existir
  if (updateObj.business_goals.expected_outcome_30days && 
      !updateObj.business_goals.expected_outcomes.includes(updateObj.business_goals.expected_outcome_30days)) {
    updateObj.business_goals.expected_outcomes = [
      updateObj.business_goals.expected_outcome_30days,
      ...updateObj.business_goals.expected_outcomes.filter(Boolean)
    ];
  }
  
  // Garantir que content_formats é um array
  if (!Array.isArray(updateObj.business_goals.content_formats)) {
    updateObj.business_goals.content_formats = [];
  }
  
  // Converter live_interest para número
  if (updateObj.business_goals.live_interest !== undefined) {
    updateObj.business_goals.live_interest = Number(updateObj.business_goals.live_interest);
  }
  
  return updateObj;
}
