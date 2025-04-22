
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";

export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  console.log("Construindo atualização de business_goals:", JSON.stringify(data?.business_goals || {}, null, 2));
  
  // Verificar se temos dados de business_goals para atualizar
  if (!data.business_goals) {
    console.warn("Não há dados de business_goals para atualizar");
    return {};
  }
  
  // Processar dados para garantir formato correto
  const businessGoals = data.business_goals;
  
  // Garantir que live_interest é um número
  if (businessGoals.live_interest !== undefined && typeof businessGoals.live_interest !== 'number') {
    businessGoals.live_interest = Number(businessGoals.live_interest);
  }
  
  // Garantir que content_formats é um array
  if (businessGoals.content_formats && !Array.isArray(businessGoals.content_formats)) {
    businessGoals.content_formats = [businessGoals.content_formats];
  } else if (!businessGoals.content_formats) {
    businessGoals.content_formats = [];
  }
  
  // Garantir expected_outcomes
  if (businessGoals.expected_outcome_30days && !businessGoals.expected_outcomes) {
    businessGoals.expected_outcomes = [businessGoals.expected_outcome_30days];
  } else if (!businessGoals.expected_outcomes) {
    businessGoals.expected_outcomes = [];
  }
  
  // Construir atualização base usando o business_goals processado
  return buildBaseUpdate("business_goals", { business_goals: businessGoals }, progress, {});
}
