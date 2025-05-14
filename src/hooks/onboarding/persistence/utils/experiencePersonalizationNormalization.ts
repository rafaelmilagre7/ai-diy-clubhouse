
/**
 * Função para normalizar dados de personalização da experiência
 * Compatível com formatos antigos e novos para garantir consistência
 */
export function normalizeExperiencePersonalization(data: any): {
  interests: string[];
  preferred_times: string[];
  days_available: string[];
  networking_level: number;
  shareable_skills: string[];
  mentorship_topics: string[];
} {
  // Se não há dados, retornar objeto padrão
  if (!data) {
    return {
      interests: [],
      preferred_times: [],
      days_available: [],
      networking_level: 5,
      shareable_skills: [],
      mentorship_topics: []
    };
  }
  
  // Converter dados de string para objeto se necessário
  let normalizedData: any = data;
  
  if (typeof data === 'string') {
    try {
      normalizedData = JSON.parse(data);
    } catch (e) {
      console.error("Erro ao converter dados de string para objeto:", e);
      normalizedData = {};
    }
  }

  // Garantir que estamos trabalhando com um objeto
  if (typeof normalizedData !== 'object' || normalizedData === null) {
    normalizedData = {};
  }
  
  // Normalizar dados para compatibilidade com múltiplos formatos
  return {
    // Suporte para nomenclaturas alternativas nos campos
    interests: Array.isArray(normalizedData.interests) ? normalizedData.interests : [],
    
    preferred_times: Array.isArray(normalizedData.preferred_times) 
      ? normalizedData.preferred_times 
      : (Array.isArray(normalizedData.time_preference) 
        ? normalizedData.time_preference 
        : []),
    
    days_available: Array.isArray(normalizedData.days_available) 
      ? normalizedData.days_available 
      : (Array.isArray(normalizedData.available_days) 
        ? normalizedData.available_days 
        : []),
    
    networking_level: typeof normalizedData.networking_level === 'number' 
      ? normalizedData.networking_level 
      : (typeof normalizedData.networking_availability === 'number'
        ? normalizedData.networking_availability
        : 5),
    
    shareable_skills: Array.isArray(normalizedData.shareable_skills) 
      ? normalizedData.shareable_skills 
      : (Array.isArray(normalizedData.skills_to_share) 
        ? normalizedData.skills_to_share 
        : []),
    
    mentorship_topics: Array.isArray(normalizedData.mentorship_topics) 
      ? normalizedData.mentorship_topics 
      : []
  };
}
