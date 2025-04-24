
/**
 * Normaliza URLs de websites para garantir formato uniforme
 * Adiciona prefixo 'https://' se não houver protocolo especificado
 */
export function normalizeWebsite(url: string): string {
  if (!url) return '';
  
  // Remover espaços em branco
  url = url.trim();
  
  // Se já começar com http:// ou https://, retornar como está
  if (url.match(/^https?:\/\//i)) {
    return url;
  }
  
  // Caso contrário, adicionar https://
  return `https://${url}`;
}

/**
 * Normaliza números de telefone para formato padrão
 * (Adicionar conforme necessário)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remover tudo exceto números
  return phone.replace(/\D/g, '');
}

/**
 * Normaliza nomes de empresas (exemplo)
 * (Adicionar conforme necessário)
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  
  // Remover espaços extras
  return name.trim();
}

/**
 * Normaliza um campo de objeto ou seção de dados
 * @param data Dados a serem normalizados
 * @param field Nome do campo ou seção
 */
export function normalizeField(data: any, field: string): Record<string, any> {
  // Caso 1: Se for null ou undefined, retorna objeto vazio
  if (data === null || data === undefined) {
    console.log(`${field} é null ou undefined, retornando objeto vazio`);
    return {};
  }
  
  // Caso 2: Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      // Se for string vazia, retorna objeto vazio
      if (data.trim() === '') {
        console.log(`${field} é string vazia, retornando objeto vazio`);
        return {};
      }
      
      // Tenta parsear a string como JSON
      const parsedData = JSON.parse(data);
      console.log(`${field} convertido de string para objeto:`, parsedData);
      return parsedData;
    } catch (e) {
      console.error(`Erro ao converter ${field} de string para objeto:`, e);
      return {};
    }
  }
  
  // Caso 3: Se for objeto, retorna como está
  if (typeof data === 'object') {
    return data;
  }
  
  // Caso padrão: retorna objeto vazio
  console.warn(`Tipo de dados inesperado para ${field}:`, typeof data);
  return {};
}

/**
 * Normaliza dados de experiência em IA
 */
export function normalizeAIExperience(data: any): Record<string, any> {
  console.log("Normalizando ai_experience:", typeof data, data);
  
  // Caso 1: Se for null ou undefined, retorna objeto vazio
  if (data === null || data === undefined) {
    console.log("ai_experience é null ou undefined, retornando objeto vazio");
    return {
      knowledge_level: '',
      previous_tools: [],
      has_implemented: '',
      desired_ai_areas: [],
      completed_formation: false,
      is_member_for_month: false,
      nps_score: 0,
      improvement_suggestions: ''
    };
  }
  
  // Caso 2: Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      // Se for string vazia, retorna objeto vazio
      if (data.trim() === '') {
        console.log("ai_experience é string vazia, retornando objeto vazio");
        return {
          knowledge_level: '',
          previous_tools: [],
          has_implemented: '',
          desired_ai_areas: [],
          completed_formation: false,
          is_member_for_month: false,
          nps_score: 0,
          improvement_suggestions: ''
        };
      }
      
      // Tenta parsear a string como JSON
      const parsedData = JSON.parse(data);
      console.log("ai_experience convertido de string para objeto:", parsedData);
      
      // Garante campos obrigatórios após conversão
      return {
        knowledge_level: parsedData.knowledge_level || '',
        previous_tools: Array.isArray(parsedData.previous_tools) ? parsedData.previous_tools : [],
        has_implemented: parsedData.has_implemented || '',
        desired_ai_areas: Array.isArray(parsedData.desired_ai_areas) ? parsedData.desired_ai_areas : [],
        completed_formation: !!parsedData.completed_formation,
        is_member_for_month: !!parsedData.is_member_for_month,
        nps_score: Number(parsedData.nps_score || 0),
        improvement_suggestions: parsedData.improvement_suggestions || ''
      };
    } catch (e) {
      console.error("Erro ao converter ai_experience de string para objeto:", e);
      return {
        knowledge_level: '',
        previous_tools: [],
        has_implemented: '',
        desired_ai_areas: [],
        completed_formation: false,
        is_member_for_month: false,
        nps_score: 0,
        improvement_suggestions: ''
      };
    }
  }
  
  // Caso 3: Se for objeto, garante campos obrigatórios
  if (typeof data === 'object') {
    console.log("ai_experience já é um objeto, normalizando campos");
    return {
      knowledge_level: data.knowledge_level || '',
      previous_tools: Array.isArray(data.previous_tools) ? data.previous_tools : [],
      has_implemented: data.has_implemented || '',
      desired_ai_areas: Array.isArray(data.desired_ai_areas) ? data.desired_ai_areas : [],
      completed_formation: !!data.completed_formation,
      is_member_for_month: !!data.is_member_for_month,
      nps_score: Number(data.nps_score || 0),
      improvement_suggestions: data.improvement_suggestions || ''
    };
  }
  
  // Caso padrão: retorna objeto vazio
  console.warn("Tipo de dados inesperado para ai_experience:", typeof data);
  return {
    knowledge_level: '',
    previous_tools: [],
    has_implemented: '',
    desired_ai_areas: [],
    completed_formation: false,
    is_member_for_month: false,
    nps_score: 0,
    improvement_suggestions: ''
  };
}

/**
 * Normaliza dados de objetivos de negócio
 */
export function normalizeBusinessGoals(data: any): Record<string, any> {
  console.log("Normalizando business_goals:", typeof data, data);
  
  // Caso 1: Se for null ou undefined, retorna objeto vazio
  if (data === null || data === undefined) {
    console.log("business_goals é null ou undefined, retornando objeto vazio");
    return {
      primary_goal: '',
      expected_outcomes: [],
      expected_outcome_30days: '',
      priority_solution_type: '',
      how_implement: '',
      week_availability: '',
      live_interest: 5,
      content_formats: []
    };
  }
  
  // Caso 2: Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      // Se for string vazia, retorna objeto vazio
      if (data.trim() === '') {
        console.log("business_goals é string vazia, retornando objeto vazio");
        return {
          primary_goal: '',
          expected_outcomes: [],
          expected_outcome_30days: '',
          priority_solution_type: '',
          how_implement: '',
          week_availability: '',
          live_interest: 5,
          content_formats: []
        };
      }
      
      // Tenta parsear a string como JSON
      const parsedData = JSON.parse(data);
      console.log("business_goals convertido de string para objeto:", parsedData);
      
      // Garante campos obrigatórios após conversão
      return {
        primary_goal: parsedData.primary_goal || '',
        expected_outcomes: Array.isArray(parsedData.expected_outcomes) ? parsedData.expected_outcomes : [],
        expected_outcome_30days: parsedData.expected_outcome_30days || '',
        priority_solution_type: parsedData.priority_solution_type || '',
        how_implement: parsedData.how_implement || '',
        week_availability: parsedData.week_availability || '',
        live_interest: Number(parsedData.live_interest || 5),
        content_formats: Array.isArray(parsedData.content_formats) ? parsedData.content_formats : []
      };
    } catch (e) {
      console.error("Erro ao converter business_goals de string para objeto:", e);
      return {
        primary_goal: '',
        expected_outcomes: [],
        expected_outcome_30days: '',
        priority_solution_type: '',
        how_implement: '',
        week_availability: '',
        live_interest: 5,
        content_formats: []
      };
    }
  }
  
  // Caso 3: Se for objeto, garante campos obrigatórios
  if (typeof data === 'object') {
    console.log("business_goals já é um objeto, normalizando campos");
    return {
      primary_goal: data.primary_goal || '',
      expected_outcomes: Array.isArray(data.expected_outcomes) ? data.expected_outcomes : [],
      expected_outcome_30days: data.expected_outcome_30days || '',
      priority_solution_type: data.priority_solution_type || '',
      how_implement: data.how_implement || '',
      week_availability: data.week_availability || '',
      live_interest: Number(data.live_interest || 5),
      content_formats: Array.isArray(data.content_formats) ? data.content_formats : []
    };
  }
  
  // Caso padrão: retorna objeto vazio
  console.warn("Tipo de dados inesperado para business_goals:", typeof data);
  return {
    primary_goal: '',
    expected_outcomes: [],
    expected_outcome_30days: '',
    priority_solution_type: '',
    how_implement: '',
    week_availability: '',
    live_interest: 5,
    content_formats: []
  };
}

/**
 * Normaliza dados de personalização de experiência
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
