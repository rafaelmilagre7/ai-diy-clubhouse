
/**
 * Utilitários para normalização de dados do onboarding
 * Garantindo que todos os campos estão no formato correto independente da fonte
 */

/**
 * Normaliza um campo genérico, convertendo string JSON para objeto
 * e garantindo que temos pelo menos um objeto vazio
 */
export function normalizeField<T = Record<string, any>>(field: any, defaultValue: T | Record<string, any> = {}): T {
  if (!field) return defaultValue as T;
  
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch (e) {
      console.error("Erro ao converter campo de string para objeto:", e);
      return defaultValue as T;
    }
  }
  
  if (typeof field === 'object') {
    return field as T;
  }
  
  return defaultValue as T;
}

/**
 * Normaliza os dados de experiência com IA
 */
export function normalizeAIExperience(aiExperience: any): any {
  const normalized = normalizeField(aiExperience, {
    knowledge_level: '',
    previous_tools: [],
    has_implemented: '',
    desired_ai_areas: [],
    completed_formation: false,
    is_member_for_month: false,
    nps_score: 5,
    improvement_suggestions: ''
  });
  
  // Garantir que listas são arrays
  if (!Array.isArray(normalized.previous_tools)) {
    normalized.previous_tools = normalized.previous_tools ? [normalized.previous_tools] : [];
  }
  
  if (!Array.isArray(normalized.desired_ai_areas)) {
    normalized.desired_ai_areas = normalized.desired_ai_areas ? [normalized.desired_ai_areas] : [];
  }
  
  // Converter valores booleanos
  normalized.completed_formation = Boolean(normalized.completed_formation);
  normalized.is_member_for_month = Boolean(normalized.is_member_for_month);
  
  // Garantir valor numérico para NPS
  normalized.nps_score = Number(normalized.nps_score || 5);
  
  return normalized;
}

/**
 * Normaliza os dados de objetivos de negócio
 */
export function normalizeBusinessGoals(businessGoals: any): any {
  const normalized = normalizeField(businessGoals, {
    primary_goal: '',
    expected_outcomes: [],
    expected_outcome_30days: '',
    priority_solution_type: '',
    how_implement: '',
    week_availability: '',
    live_interest: 5,
    content_formats: []
  });
  
  // Garantir que listas são arrays
  if (!Array.isArray(normalized.expected_outcomes)) {
    normalized.expected_outcomes = normalized.expected_outcomes ? [normalized.expected_outcomes] : [];
  }
  
  if (!Array.isArray(normalized.content_formats)) {
    normalized.content_formats = normalized.content_formats ? [normalized.content_formats] : [];
  }
  
  // Garantir que live_interest é número
  const liveInterestNum = Number(normalized.live_interest || 5);
  normalized.live_interest = isNaN(liveInterestNum) ? 5 : liveInterestNum;
  
  return normalized;
}

/**
 * Normaliza os dados de personalização da experiência
 */
export function normalizeExperiencePersonalization(experiencePersonalization: any): any {
  const normalized = normalizeField(experiencePersonalization, {
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: 5,
    skills_to_share: [],
    mentorship_topics: []
  });
  
  // Garantir que listas são arrays
  if (!Array.isArray(normalized.interests)) {
    normalized.interests = normalized.interests ? [normalized.interests] : [];
  }
  
  if (!Array.isArray(normalized.time_preference)) {
    normalized.time_preference = normalized.time_preference ? [normalized.time_preference] : [];
  }
  
  if (!Array.isArray(normalized.available_days)) {
    normalized.available_days = normalized.available_days ? [normalized.available_days] : [];
  }
  
  if (!Array.isArray(normalized.skills_to_share)) {
    normalized.skills_to_share = normalized.skills_to_share ? [normalized.skills_to_share] : [];
  }
  
  if (!Array.isArray(normalized.mentorship_topics)) {
    normalized.mentorship_topics = normalized.mentorship_topics ? [normalized.mentorship_topics] : [];
  }
  
  // Garantir que networking_availability é número
  const networkAvailNum = Number(normalized.networking_availability || 5);
  normalized.networking_availability = isNaN(networkAvailNum) ? 5 : networkAvailNum;
  
  return normalized;
}
