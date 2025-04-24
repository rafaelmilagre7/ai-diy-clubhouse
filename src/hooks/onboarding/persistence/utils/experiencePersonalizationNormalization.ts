
/**
 * Normaliza especificamente dados de experience_personalization
 */
export function normalizeExperiencePersonalization(data: any): Record<string, any> {
  console.log("[normalizeExperiencePersonalization] Normalizando dados:", typeof data, data);
  
  // Caso 1: Se for null ou undefined, retorna objeto vazio com estrutura completa
  if (data === null || data === undefined) {
    console.log("[normalizeExperiencePersonalization] Dados nulos ou indefinidos, retornando objeto padrão");
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
        console.log("[normalizeExperiencePersonalization] String vazia, retornando objeto padrão");
        return {
          interests: [],
          time_preference: [],
          available_days: [],
          networking_availability: 5,
          skills_to_share: [],
          mentorship_topics: [],
        };
      }
      
      // Tentar parsear a string como JSON
      console.log("[normalizeExperiencePersonalization] Tentando converter string para objeto:", data);
      
      const parsedData = JSON.parse(data);
      console.log("[normalizeExperiencePersonalization] Dados convertidos de string para objeto:", parsedData);
      
      // Garantir que todos os campos são normalizados
      return normalizeExperiencePersonalization(parsedData);
    } catch (e) {
      console.error("[normalizeExperiencePersonalization] Erro ao converter dados de string para objeto:", e);
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
    console.log("[normalizeExperiencePersonalization] Dados já são um objeto, normalizando campos");
    
    // Se data for um array, converte para objeto vazio (caso improvável mas possível)
    if (Array.isArray(data)) {
      console.warn("[normalizeExperiencePersonalization] Dados são um array, convertendo para objeto padrão");
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
      console.log("[normalizeExperiencePersonalization] Formato aninhado detectado, extraindo dados");
      return normalizeExperiencePersonalization(data.experience_personalization);
    }
    
    // Garantir que todos os arrays sejam realmente arrays
    const ensureArray = (value: any) => {
      // Se for array, retorna-o diretamente
      if (Array.isArray(value)) return value;
      
      // Se for undefined ou null, retorna array vazio
      if (value === undefined || value === null) return [];
      
      // Se for string, tenta parsear como JSON
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          // Se o resultado for array, retorna-o
          if (Array.isArray(parsed)) return parsed;
          // Caso contrário, envolve em array
          return [parsed];
        } catch (e) {
          // Se falhar ao parsear, trata como valor único
          return [value];
        }
      }
      
      // Para outros tipos, envolve em array
      return [value];
    };
    
    // Criar novo objeto normalizado
    const normalizedData = {
      interests: ensureArray(data.interests),
      time_preference: ensureArray(data.time_preference),
      available_days: ensureArray(data.available_days),
      networking_availability: data.networking_availability !== undefined ? 
                             Number(data.networking_availability) : 5,
      skills_to_share: ensureArray(data.skills_to_share),
      mentorship_topics: ensureArray(data.mentorship_topics),
    };
    
    console.log("[normalizeExperiencePersonalization] Dados normalizados:", normalizedData);
    return normalizedData;
  }
  
  // Caso padrão: retorna objeto vazio com estrutura completa
  console.warn("[normalizeExperiencePersonalization] Tipo de dados inesperado:", typeof data);
  return {
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: 5,
    skills_to_share: [],
    mentorship_topics: [],
  };
}
