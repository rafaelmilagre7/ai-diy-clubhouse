
/**
 * Normaliza especificamente dados de experience_personalization
 */
export function normalizeExperiencePersonalization(data: any): Record<string, any> {
  console.log("Normalizando experience_personalization:", typeof data, data);
  
  // Caso 1: Se for null ou undefined, retorna objeto vazio
  if (data === null || data === undefined) {
    console.log("experience_personalization é null ou undefined, retornando objeto vazio");
    return {
      interests: [],
      time_preference: [],
      available_days: [],
      networking_availability: 5,
      skills_to_share: [],
      mentorship_topics: [],
    };
  }
  
  // Caso 2: Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      // Se for string vazia, retorna objeto vazio
      if (data.trim() === '') {
        console.log("experience_personalization é string vazia, retornando objeto vazio");
        return {
          interests: [],
          time_preference: [],
          available_days: [],
          networking_availability: 5,
          skills_to_share: [],
          mentorship_topics: [],
        };
      }
      
      // Tenta parsear a string como JSON
      const parsedData = JSON.parse(data);
      console.log("experience_personalization convertido de string para objeto:", parsedData);
      
      // Garante campos obrigatórios após conversão
      return {
        interests: Array.isArray(parsedData.interests) ? parsedData.interests : [],
        time_preference: Array.isArray(parsedData.time_preference) ? parsedData.time_preference : [],
        available_days: Array.isArray(parsedData.available_days) ? parsedData.available_days : [],
        networking_availability: parsedData.networking_availability !== undefined ? 
                                Number(parsedData.networking_availability) : 5,
        skills_to_share: Array.isArray(parsedData.skills_to_share) ? parsedData.skills_to_share : [],
        mentorship_topics: Array.isArray(parsedData.mentorship_topics) ? parsedData.mentorship_topics : [],
      };
    } catch (e) {
      console.error("Erro ao converter experience_personalization de string para objeto:", e);
      return {
        interests: [],
        time_preference: [],
        available_days: [],
        networking_availability: 5,
        skills_to_share: [],
        mentorship_topics: [],
      };
    }
  }
  
  // Caso 3: Se for objeto, garante campos obrigatórios
  if (typeof data === 'object') {
    console.log("experience_personalization já é um objeto, normalizando campos");
    return {
      interests: Array.isArray(data.interests) ? data.interests : [],
      time_preference: Array.isArray(data.time_preference) ? data.time_preference : [],
      available_days: Array.isArray(data.available_days) ? data.available_days : [],
      networking_availability: data.networking_availability !== undefined ? 
                             Number(data.networking_availability) : 5,
      skills_to_share: Array.isArray(data.skills_to_share) ? data.skills_to_share : [],
      mentorship_topics: Array.isArray(data.mentorship_topics) ? data.mentorship_topics : [],
    };
  }
  
  // Caso padrão: retorna objeto vazio
  console.warn("Tipo de dados inesperado para experience_personalization:", typeof data);
  return {
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: 5,
    skills_to_share: [],
    mentorship_topics: [],
  };
}
