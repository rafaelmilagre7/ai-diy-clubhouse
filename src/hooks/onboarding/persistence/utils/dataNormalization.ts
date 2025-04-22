
/**
 * Normaliza um campo do tipo objeto para garantir que seja um objeto válido
 * Evita problemas com campos que podem ser strings JSON
 */
export function normalizeField(field: any, fieldName: string): Record<string, any> {
  if (!field) {
    console.log(`Campo ${fieldName} vazio, retornando objeto vazio`);
    return {};
  }

  // Se já for um objeto, retornar como está
  if (typeof field === 'object' && field !== null) {
    return field;
  }

  // Se for uma string, tentar converter para objeto
  if (typeof field === 'string') {
    try {
      if (field.trim() === '') {
        return {};
      }
      
      const parsed = JSON.parse(field);
      console.log(`Campo ${fieldName} convertido de string para objeto:`, parsed);
      return parsed;
    } catch (e) {
      console.error(`Erro ao converter string para objeto no campo ${fieldName}:`, e);
      return {};
    }
  }

  // Caso não seja nem objeto nem string, retornar objeto vazio
  console.warn(`Campo ${fieldName} tem tipo inesperado: ${typeof field}`);
  return {};
}

/**
 * Normalização específica para experiência com IA
 */
export function normalizeAIExperience(field: any): Record<string, any> {
  const normalized = normalizeField(field, 'ai_experience');
  
  // Garantir que arrays são de fato arrays
  if (normalized.previous_tools && !Array.isArray(normalized.previous_tools)) {
    if (typeof normalized.previous_tools === 'string') {
      normalized.previous_tools = [normalized.previous_tools];
    } else {
      normalized.previous_tools = [];
    }
  }
  
  if (normalized.desired_ai_areas && !Array.isArray(normalized.desired_ai_areas)) {
    if (typeof normalized.desired_ai_areas === 'string') {
      normalized.desired_ai_areas = [normalized.desired_ai_areas];
    } else {
      normalized.desired_ai_areas = [];
    }
  }
  
  return normalized;
}

/**
 * Normalização específica para objetivos de negócio
 */
export function normalizeBusinessGoals(field: any): Record<string, any> {
  const normalized = normalizeField(field, 'business_goals');
  
  // Garantir que arrays são de fato arrays
  if (normalized.expected_outcomes && !Array.isArray(normalized.expected_outcomes)) {
    if (typeof normalized.expected_outcomes === 'string') {
      normalized.expected_outcomes = [normalized.expected_outcomes];
    } else {
      normalized.expected_outcomes = [];
    }
  }
  
  if (normalized.content_formats && !Array.isArray(normalized.content_formats)) {
    if (typeof normalized.content_formats === 'string') {
      normalized.content_formats = [normalized.content_formats];
    } else {
      normalized.content_formats = [];
    }
  }
  
  return normalized;
}

/**
 * Normalização específica para personalização de experiência
 */
export function normalizeExperiencePersonalization(field: any): Record<string, any> {
  const normalized = normalizeField(field, 'experience_personalization');
  
  // Garantir que arrays são de fato arrays
  const arrayFields = ['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'];
  
  arrayFields.forEach(arrayField => {
    if (normalized[arrayField] && !Array.isArray(normalized[arrayField])) {
      if (typeof normalized[arrayField] === 'string') {
        normalized[arrayField] = [normalized[arrayField]];
      } else {
        normalized[arrayField] = [];
      }
    }
  });
  
  return normalized;
}

/**
 * Normaliza URLs de sites, garantindo que comecem com http:// ou https://
 */
export function normalizeWebsite(url: string | null | undefined): string {
  if (!url) return '';
  
  // Se já começa com protocolo, retornar como está
  if (url.match(/^https?:\/\//)) {
    return url;
  }
  
  // Adicionar https:// por padrão
  return `https://${url}`;
}
