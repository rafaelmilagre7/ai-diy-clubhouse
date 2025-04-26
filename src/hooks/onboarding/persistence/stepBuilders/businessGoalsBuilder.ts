
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeBusinessGoals } from "../utils/dataNormalization";

export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Verificações iniciais
  if (!data) {
    console.warn("[businessGoalsBuilder] Dados vazios recebidos");
    return updateObj;
  }
  
  // Garantir base consistente para os dados
  let existingBusinessGoals = {};
  
  // Verificar se temos dados de progresso válidos
  if (progress && progress.business_goals) {
    if (typeof progress.business_goals === 'string') {
      try {
        existingBusinessGoals = JSON.parse(progress.business_goals);
        console.log("[businessGoalsBuilder] Convertido business_goals de string para objeto");
      } catch (e) {
        console.error("[businessGoalsBuilder] Erro ao converter business_goals de string para objeto:", e);
      }
    } else if (typeof progress.business_goals === 'object') {
      existingBusinessGoals = progress.business_goals;
    }
  }
  
  // Normalizar dados existentes para garantir estrutura correta
  existingBusinessGoals = normalizeBusinessGoals(existingBusinessGoals);
  
  // Verificar se estamos recebendo dados específicos de business_goals ou são dados aninhados
  const businessGoalsData = data.business_goals || {};
  
  // Se não tivermos dados específicos, não fazer atualização
  if (Object.keys(businessGoalsData).length === 0) {
    console.warn("[businessGoalsBuilder] Nenhum dado específico de business_goals encontrado para atualização");
    return updateObj;
  }
  
  // Construir objeto de atualização com cópia profunda para evitar referências
  const mergedData = {
    ...JSON.parse(JSON.stringify(existingBusinessGoals)),
    ...JSON.parse(JSON.stringify(businessGoalsData))
  };
  
  // Garantir que expected_outcomes é um array e não indefinido
  if (!Array.isArray(mergedData.expected_outcomes)) {
    mergedData.expected_outcomes = [];
  }
  
  // Adicionar expected_outcome_30days aos expected_outcomes se existir e não estiver duplicado
  if (mergedData.expected_outcome_30days && 
      !mergedData.expected_outcomes.includes(mergedData.expected_outcome_30days)) {
    mergedData.expected_outcomes = [
      mergedData.expected_outcome_30days,
      ...mergedData.expected_outcomes.filter(Boolean)
    ];
  }
  
  // Garantir que content_formats é um array e não indefinido
  if (!Array.isArray(mergedData.content_formats)) {
    mergedData.content_formats = [];
  }
  
  // Converter live_interest para número
  if (mergedData.live_interest !== undefined) {
    const numericValue = Number(mergedData.live_interest);
    mergedData.live_interest = isNaN(numericValue) ? 5 : numericValue;
  }
  
  // Garantir que campos de string não sejam null ou undefined
  const stringFields = ['primary_goal', 'timeline', 'priority_solution_type', 'how_implement', 'week_availability'];
  stringFields.forEach(field => {
    if (mergedData[field] === null || mergedData[field] === undefined) {
      mergedData[field] = '';
    }
  });
  
  // Atribuir ao objeto de atualização
  updateObj.business_goals = mergedData;
  
  console.log("[businessGoalsBuilder] Objeto de atualização construído:", updateObj);
  
  return updateObj;
}
