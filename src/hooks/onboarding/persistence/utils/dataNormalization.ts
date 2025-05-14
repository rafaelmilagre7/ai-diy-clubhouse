
/**
 * Normaliza um campo genérico, garantindo que seja sempre um objeto válido
 */
export function normalizeField(field: any): any {
  if (!field) return {};
  
  // Se for string JSON, tentar converter
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      return {};
    }
  }
  
  // Se não for objeto, retornar objeto vazio
  if (typeof field !== 'object' || field === null) {
    return {};
  }
  
  return field;
}

/**
 * Normaliza especificamente o campo AI Experience
 */
export function normalizeAIExperience(aiExp: any): any {
  const normalized = normalizeField(aiExp);
  
  // Converter campos específicos para garantir tipos consistentes
  if (normalized.has_implemented === 'sim' || normalized.has_implemented === 'yes' || normalized.has_implemented === true) {
    normalized.has_implemented = true;
  } else if (normalized.has_implemented === 'não' || normalized.has_implemented === 'nao' || normalized.has_implemented === 'no' || normalized.has_implemented === false) {
    normalized.has_implemented = false;
  }
  
  // Garantir que arrays sejam realmente arrays
  if (normalized.previous_tools && !Array.isArray(normalized.previous_tools)) {
    normalized.previous_tools = [normalized.previous_tools];
  }
  
  if (normalized.desired_ai_areas && !Array.isArray(normalized.desired_ai_areas)) {
    normalized.desired_ai_areas = [normalized.desired_ai_areas];
  }
  
  return normalized;
}

/**
 * Normaliza especificamente o campo Business Goals
 */
export function normalizeBusinessGoals(goals: any): any {
  const normalized = normalizeField(goals);
  
  // Converter valores numéricos
  if (typeof normalized.live_interest === 'string') {
    const numValue = parseInt(normalized.live_interest);
    normalized.live_interest = isNaN(numValue) ? 0 : numValue;
  }
  
  // Garantir que arrays sejam realmente arrays
  if (normalized.expected_outcomes && !Array.isArray(normalized.expected_outcomes)) {
    normalized.expected_outcomes = [normalized.expected_outcomes];
  }
  
  if (normalized.content_formats && !Array.isArray(normalized.content_formats)) {
    normalized.content_formats = [normalized.content_formats];
  }
  
  return normalized;
}

/**
 * Normaliza especificamente o campo Experience Personalization
 */
export function normalizeExperiencePersonalization(exp: any): any {
  const normalized = normalizeField(exp);
  
  // Converter valores numéricos
  if (typeof normalized.networking_availability === 'string') {
    const numValue = parseInt(normalized.networking_availability);
    normalized.networking_availability = isNaN(numValue) ? 0 : numValue;
  }
  
  // Garantir que arrays sejam realmente arrays
  const arrayFields = ['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'];
  
  arrayFields.forEach(field => {
    if (normalized[field] && !Array.isArray(normalized[field])) {
      normalized[field] = [normalized[field]];
    } else if (!normalized[field]) {
      normalized[field] = [];
    }
  });
  
  return normalized;
}
