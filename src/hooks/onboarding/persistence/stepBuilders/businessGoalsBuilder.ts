
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Criar objeto de atualização
  const updateObj: any = {};
  
  // Obter os objetivos de negócios existentes (se houver)
  const existingBusinessGoals = progress?.business_goals || {};
  
  // Garantir que temos um objeto para business_goals, não uma string
  const businessGoalsBase = typeof existingBusinessGoals === 'string' 
    ? {} 
    : (existingBusinessGoals as Record<string, any>);
  
  // Verificar se os dados vieram dentro de um objeto business_goals
  if ((data as any).business_goals) {
    const businessGoalsData = (data as any).business_goals;
    
    // Normalizar dados de arrays
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
    
    // Normalizar números para a preferência de sessões ao vivo
    if (businessGoalsData.live_interest !== undefined) {
      const liveInterest = Number(businessGoalsData.live_interest);
      businessGoalsData.live_interest = isNaN(liveInterest) ? 5 : liveInterest;
    }
    
    // Log para debug
    console.log("Dados de business_goals processados:", businessGoalsData);
    
    // Criar objeto final
    updateObj.business_goals = {
      ...businessGoalsBase,
      ...businessGoalsData,
      _last_updated: new Date().toISOString()
    };
  } else if (typeof data === 'object' && data !== null) {
    // Se os dados não vieram dentro de business_goals, construir manualmente
    
    // Inicializar com dados existentes
    updateObj.business_goals = { 
      ...businessGoalsBase,
      _last_updated: new Date().toISOString()
    };
    
    // Campos a serem copiados
    const fieldsToCopy = [
      'primary_goal', 
      'expected_outcome_30days', 
      'priority_solution_type', 
      'how_implement', 
      'week_availability', 
      'live_interest', 
      'content_formats'
    ];
    
    // Copiar cada campo
    fieldsToCopy.forEach(field => {
      if ((data as any)[field] !== undefined) {
        updateObj.business_goals[field] = (data as any)[field];
      }
    });
    
    // Processamento de arrays específicos
    if ((data as any).content_formats && !Array.isArray((data as any).content_formats)) {
      updateObj.business_goals.content_formats = [(data as any).content_formats];
    }
    
    // Sincronizar expected_outcome_30days e expected_outcomes
    if ((data as any).expected_outcome_30days) {
      updateObj.business_goals.expected_outcome_30days = (data as any).expected_outcome_30days;
      
      // Garantir que expected_outcomes é um array e contém expected_outcome_30days
      updateObj.business_goals.expected_outcomes = updateObj.business_goals.expected_outcomes || [];
      if (!Array.isArray(updateObj.business_goals.expected_outcomes)) {
        updateObj.business_goals.expected_outcomes = [];
      }
      
      if (!updateObj.business_goals.expected_outcomes.includes((data as any).expected_outcome_30days)) {
        updateObj.business_goals.expected_outcomes = [
          (data as any).expected_outcome_30days,
          ...updateObj.business_goals.expected_outcomes
        ];
      }
    }
    
    // Normalizar live_interest para número
    if ((data as any).live_interest !== undefined) {
      const liveInterest = Number((data as any).live_interest);
      updateObj.business_goals.live_interest = isNaN(liveInterest) ? 5 : liveInterest;
    }
    
    // Log para debug
    console.log("Dados de business_goals construídos manualmente:", updateObj.business_goals);
  }
  
  return updateObj;
}
