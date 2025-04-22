
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Log para debug dos dados recebidos
  console.log("Dados recebidos no businessGoalsBuilder:", data);
  
  // Inicializar objeto de atualização
  const updateObj: any = {};
  
  // Verificar se temos um objeto business_goals nos dados
  if (data.business_goals) {
    // Trabalhar com uma cópia para não modificar os dados originais
    const businessGoalsData = { ...(data.business_goals) };
    
    // Garantir que content_formats seja sempre um array
    if (businessGoalsData.content_formats && !Array.isArray(businessGoalsData.content_formats)) {
      businessGoalsData.content_formats = [businessGoalsData.content_formats];
    }
    
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
    
    // Normalizar valores numéricos
    if (businessGoalsData.live_interest !== undefined) {
      businessGoalsData.live_interest = Number(businessGoalsData.live_interest);
      if (isNaN(businessGoalsData.live_interest)) {
        businessGoalsData.live_interest = 5; // Valor padrão se for inválido
      }
    }
    
    // Log para debug
    console.log("Dados de business_goals processados:", businessGoalsData);
    
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
      // Processe campos específicos
      if (filteredFields.content_formats && !Array.isArray(filteredFields.content_formats)) {
        filteredFields.content_formats = [filteredFields.content_formats];
      }

      if (filteredFields.live_interest !== undefined) {
        filteredFields.live_interest = Number(filteredFields.live_interest);
        if (isNaN(filteredFields.live_interest)) {
          filteredFields.live_interest = 5;
        }
      }

      // Sincronizar expected_outcome_30days e expected_outcomes
      if (filteredFields.expected_outcome_30days && !filteredFields.expected_outcomes) {
        filteredFields.expected_outcomes = [filteredFields.expected_outcome_30days];
      }

      updateObj.business_goals = {
        ...filteredFields,
        _last_updated: new Date().toISOString()
      };
    }
  }

  // Processar o objeto progress.business_goals existente, se necessário
  if (progress?.business_goals) {
    let existingBusinessGoals = progress.business_goals;
    
    // Converter de string para objeto, se necessário
    if (typeof existingBusinessGoals === 'string' && existingBusinessGoals !== '{}' && existingBusinessGoals !== '') {
      try {
        existingBusinessGoals = JSON.parse(existingBusinessGoals);
      } catch (e) {
        console.error("Erro ao analisar business_goals:", e);
        existingBusinessGoals = {};
      }
    }
    
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
