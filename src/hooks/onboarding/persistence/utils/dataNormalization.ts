
/**
 * Utilitários para normalização de dados de onboarding
 */

/**
 * Normaliza um campo, convertendo string JSON para objeto, se necessário
 */
export function normalizeField(value: any, fieldName: string): any {
  if (value === null || value === undefined) {
    console.log(`Campo ${fieldName} é nulo ou indefinido, retornando objeto vazio`);
    return {};
  }

  // Se já for um objeto, retornar como está
  if (typeof value === 'object' && value !== null) {
    console.log(`Campo ${fieldName} já é um objeto, retornando como está`);
    return value;
  }

  // Se for string, tentar converter para objeto
  if (typeof value === 'string') {
    try {
      if (value.trim() === '' || value === '{}') {
        console.log(`Campo ${fieldName} é string vazia ou {}, retornando objeto vazio`);
        return {};
      }
      
      const parsed = JSON.parse(value);
      console.log(`Campo ${fieldName} convertido de string para objeto:`, parsed);
      return parsed;
    } catch (e) {
      console.error(`Erro ao converter string para objeto no campo ${fieldName}:`, e);
      console.log(`String original:`, value);
      return {};
    }
  }

  // Caso padrão, retornar objeto vazio
  console.warn(`Tipo inesperado para campo ${fieldName}:`, typeof value);
  return {};
}

/**
 * Normaliza URLs de website, garantindo formato consistente
 */
export function normalizeWebsite(url: string): string {
  if (!url) return '';
  
  // Se não tiver http:// ou https://, adicionar https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
}

/**
 * Normaliza especificamente dados de experiência com IA
 */
export function normalizeAIExperience(value: any): any {
  const aiExp = normalizeField(value, 'ai_experience');
  
  // Garantir campos consistentes
  if (!aiExp.knowledge_level) aiExp.knowledge_level = '';
  
  // Garantir que campos que devem ser arrays sejam arrays
  if (!Array.isArray(aiExp.previous_tools)) {
    aiExp.previous_tools = aiExp.previous_tools ? [aiExp.previous_tools] : [];
  }
  
  if (!Array.isArray(aiExp.desired_ai_areas)) {
    aiExp.desired_ai_areas = aiExp.desired_ai_areas ? [aiExp.desired_ai_areas] : [];
  }
  
  // Converter campos booleanos
  aiExp.completed_formation = !!aiExp.completed_formation;
  aiExp.is_member_for_month = !!aiExp.is_member_for_month;
  
  // Converter nps_score para número
  if (aiExp.nps_score !== undefined) {
    aiExp.nps_score = typeof aiExp.nps_score === 'string' 
      ? parseInt(aiExp.nps_score, 10) || 0 
      : (aiExp.nps_score || 0);
  }
  
  return aiExp;
}

/**
 * Normaliza especificamente dados de business_goals
 */
export function normalizeBusinessGoals(value: any): any {
  const businessGoals = normalizeField(value, 'business_goals');
  
  // Garantir campos consistentes
  if (!businessGoals.primary_goal) businessGoals.primary_goal = '';
  if (!businessGoals.priority_solution_type) businessGoals.priority_solution_type = '';
  if (!businessGoals.how_implement) businessGoals.how_implement = '';
  if (!businessGoals.week_availability) businessGoals.week_availability = '';
  
  // Garantir que expected_outcomes seja array
  if (!Array.isArray(businessGoals.expected_outcomes)) {
    businessGoals.expected_outcomes = businessGoals.expected_outcomes ? [businessGoals.expected_outcomes] : [];
  }
  
  // Adicionar expected_outcome_30days aos expected_outcomes se existir
  if (businessGoals.expected_outcome_30days && 
      !businessGoals.expected_outcomes.includes(businessGoals.expected_outcome_30days)) {
    businessGoals.expected_outcomes = [
      businessGoals.expected_outcome_30days,
      ...businessGoals.expected_outcomes.filter(Boolean)
    ];
  }
  
  // Garantir que content_formats seja array
  if (!Array.isArray(businessGoals.content_formats)) {
    businessGoals.content_formats = businessGoals.content_formats ? [businessGoals.content_formats] : [];
  }
  
  // Converter live_interest para número
  if (businessGoals.live_interest !== undefined) {
    businessGoals.live_interest = typeof businessGoals.live_interest === 'string' 
      ? parseInt(businessGoals.live_interest, 10) || 5
      : (businessGoals.live_interest || 5);
  } else {
    businessGoals.live_interest = 5;
  }
  
  return businessGoals;
}
