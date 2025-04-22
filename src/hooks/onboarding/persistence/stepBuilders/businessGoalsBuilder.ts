
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeBusinessGoals } from "../utils/dataNormalization";

export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Log para debug dos dados recebidos
  console.log("Dados recebidos no businessGoalsBuilder:", data);
  
  // Inicializar objeto de atualização
  const updateObj: any = {};
  
  // Verificar se temos um objeto business_goals nos dados
  if (data.business_goals) {
    // Trabalhar com uma cópia para não modificar os dados originais
    let businessGoalsData = { ...(data.business_goals) };
    
    // Usar a função de normalização para garantir consistência
    businessGoalsData = normalizeBusinessGoals(businessGoalsData);
    
    // Log para debug
    console.log("Dados de business_goals normalizados:", businessGoalsData);
    
    // Criar objeto final
    updateObj.business_goals = {
      ...businessGoalsData,
      _last_updated: new Date().toISOString()
    };
  } else if ((data as any).business_goals === "{}") {
    // Corrigir caso onde temos um string vazio "{}" vindo do backend
    updateObj.business_goals = { _last_updated: new Date().toISOString() };
  } else {
    // Extrair campos relacionados a business_goals diretamente do objeto de dados
    const businessGoalsFields = {
      primary_goal: (data as any).primary_goal,
      expected_outcome_30days: (data as any).expected_outcome_30days,
      expected_outcomes: (data as any).expected_outcomes,
      priority_solution_type: (data as any).priority_solution_type,
      how_implement: (data as any).how_implement,
      week_availability: (data as any).week_availability,
      live_interest: (data as any).live_interest,
      content_formats: (data as any).content_formats,
    };

    // Filtrar campos não definidos
    const filteredFields = Object.fromEntries(
      Object.entries(businessGoalsFields).filter(([_, value]) => value !== undefined)
    );

    // Se tivermos campos para atualizar, criar o objeto de business_goals
    if (Object.keys(filteredFields).length > 0) {
      // Normalizar os campos específicos
      const normalizedFields = normalizeBusinessGoals(filteredFields);
      
      updateObj.business_goals = {
        ...normalizedFields,
        _last_updated: new Date().toISOString()
      };
    }
  }

  // Processar o objeto progress.business_goals existente, se necessário
  if (progress?.business_goals) {
    let existingBusinessGoals = normalizeBusinessGoals(progress.business_goals);
    
    // Garantir que é um objeto
    if (existingBusinessGoals && typeof existingBusinessGoals === 'object' && Object.keys(existingBusinessGoals).length > 0) {
      if (updateObj.business_goals) {
        updateObj.business_goals = {
          ...existingBusinessGoals,
          ...updateObj.business_goals
        };
      } else {
        updateObj.business_goals = existingBusinessGoals;
      }
    }
  }
  
  console.log("Objeto de atualização final:", updateObj);
  return updateObj;
}
