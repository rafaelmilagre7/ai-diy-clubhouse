
/**
 * Normaliza dados de personalização da experiência
 * Garante que todos os campos esperados estejam presentes e com o tipo correto
 */
export function normalizeExperiencePersonalization(data: any): Record<string, any> {
  console.log("[normalizeExperiencePersonalization] Normalizando dados:", typeof data, data);
  
  // Valores padrão para todos os campos
  const defaultValues = {
    interests: [],
    preferred_times: [],
    days_available: [],
    networking_level: 5,
    shareable_skills: [],
    mentorship_topics: [],
  };
  
  // Caso 1: Se for null ou undefined, retorna objeto com valores padrão
  if (data === null || data === undefined) {
    console.log("[normalizeExperiencePersonalization] Dados nulos, retornando valores padrão");
    return { ...defaultValues };
  }
  
  // Caso 2: Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      // Se for string vazia, retorna objeto com valores padrão
      if (data.trim() === '') {
        console.log("[normalizeExperiencePersonalization] String vazia, retornando valores padrão");
        return { ...defaultValues };
      }
      
      // Tentar parsear a string como JSON
      const parsedData = JSON.parse(data);
      console.log("[normalizeExperiencePersonalization] String convertida para objeto");
      
      // Continuar normalização com o dado parseado
      return normalizeExperiencePersonalization(parsedData);
    } catch (e) {
      console.error("[normalizeExperiencePersonalization] Erro ao converter string:", e);
      return { ...defaultValues };
    }
  }
  
  // Caso 3: Se for objeto, garante campos obrigatórios
  if (typeof data === 'object') {
    console.log("[normalizeExperiencePersonalization] Normalizando campos do objeto");
    
    // Se data for um array, converte para objeto com valores padrão
    if (Array.isArray(data)) {
      console.warn("[normalizeExperiencePersonalization] Dados são um array, convertendo");
      return { ...defaultValues };
    }
    
    // Verificar formato aninhado com o campo experience_personalization
    if (data.experience_personalization && typeof data.experience_personalization === 'object') {
      console.log("[normalizeExperiencePersonalization] Formato aninhado detectado");
      return normalizeExperiencePersonalization(data.experience_personalization);
    }
    
    // Garantir que todos os arrays sejam realmente arrays
    const ensureArray = (value: any) => {
      if (Array.isArray(value)) return value;
      if (value === undefined || value === null) return [];
      
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [value];
        } catch (e) {
          return value.trim() ? [value] : [];
        }
      }
      
      return [value];
    };
    
    // Criar novo objeto normalizado
    const normalizedData = {
      interests: ensureArray(data.interests),
      preferred_times: ensureArray(data.preferred_times || data.time_preference),
      days_available: ensureArray(data.days_available || data.available_days),
      networking_level: typeof data.networking_level === 'number' ? 
                       data.networking_level : 
                       (data.networking_availability !== undefined ? 
                        Number(data.networking_availability) : defaultValues.networking_level),
      shareable_skills: ensureArray(data.shareable_skills || data.skills_to_share),
      mentorship_topics: ensureArray(data.mentorship_topics),
    };
    
    console.log("[normalizeExperiencePersonalization] Dados normalizados:", normalizedData);
    return normalizedData;
  }
  
  // Caso padrão: retorna objeto com valores padrão
  console.warn("[normalizeExperiencePersonalization] Tipo de dados inesperado:", typeof data);
  return { ...defaultValues };
}
