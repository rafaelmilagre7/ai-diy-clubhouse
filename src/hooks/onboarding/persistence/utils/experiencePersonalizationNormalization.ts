
/**
 * Normaliza especificamente dados de experience_personalization
 */
export function normalizeExperiencePersonalization(data: any): Record<string, any> {
  console.log("Normalizando experience_personalization:", typeof data, data);
  
  // Caso 1: Se for null ou undefined, retorna objeto vazio com estrutura completa
  if (data === null || data === undefined) {
    console.log("experience_personalization é null ou undefined, retornando objeto padrão");
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
        console.log("experience_personalization é string vazia, retornando objeto padrão");
        return {
          interests: [],
          time_preference: [],
          available_days: [],
          networking_availability: 5,
          skills_to_share: [],
          mentorship_topics: [],
        };
      }
      
      // CORREÇÃO: Adicionar mais logs de debug para diagnosticar problemas de conversão
      console.log("Tentando converter string para objeto:", data);
      
      // Tenta parsear a string como JSON
      const parsedData = JSON.parse(data);
      console.log("experience_personalization convertido de string para objeto:", parsedData);
      
      // Garantir que todos os campos são normalizados
      return normalizeExperiencePersonalization(parsedData);
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
    
    // Se data for um array, converte para objeto vazio (caso improvável mas possível)
    if (Array.isArray(data)) {
      console.warn("experience_personalization é um array, convertendo para objeto padrão");
      return {
        interests: [],
        time_preference: [],
        available_days: [],
        networking_availability: 5,
        skills_to_share: [],
        mentorship_topics: [],
      };
    }
    
    // Verificar se estamos recebendo um formato aninhado com o campo experience_personalization
    if (data.experience_personalization && typeof data.experience_personalization === 'object') {
      console.log("Detectado formato aninhado, extraindo dados de experience_personalization");
      return normalizeExperiencePersonalization(data.experience_personalization);
    }
    
    // CORREÇÃO: Garantir que todos os arrays sejam realmente arrays
    const ensureArray = (value: any) => Array.isArray(value) ? value : (value ? [value] : []);
    
    // CORREÇÃO: Garantir campos específicos
    return {
      interests: ensureArray(data.interests),
      time_preference: ensureArray(data.time_preference),
      available_days: ensureArray(data.available_days),
      networking_availability: data.networking_availability !== undefined ? 
                             Number(data.networking_availability) : 5,
      skills_to_share: ensureArray(data.skills_to_share),
      mentorship_topics: ensureArray(data.mentorship_topics),
    };
  }
  
  // Caso padrão: retorna objeto vazio com estrutura completa
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
