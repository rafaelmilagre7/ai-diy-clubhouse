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
export function normalizeBusinessGoals(data: any): Record<string, any> {
  console.log("Normalizando business_goals:", typeof data, data);
  
  // Caso 1: Se for null ou undefined, retorna objeto vazio
  if (data === null || data === undefined) {
    console.log("business_goals é null ou undefined, retornando objeto vazio");
    return {
      primary_goal: "",
      expected_outcomes: [],
      expected_outcome_30days: "",
      priority_solution_type: "",
      how_implement: "",
      week_availability: "",
      live_interest: 5,
      content_formats: [],
    };
  }
  
  // Caso 2: Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      // Se for string vazia, retorna objeto vazio
      if (data.trim() === '') {
        console.log("business_goals é string vazia, retornando objeto vazio");
        return {
          primary_goal: "",
          expected_outcomes: [],
          expected_outcome_30days: "",
          priority_solution_type: "",
          how_implement: "",
          week_availability: "",
          live_interest: 5,
          content_formats: [],
        };
      }
      
      // Tenta parsear a string como JSON
      const parsedData = JSON.parse(data);
      console.log("business_goals convertido de string para objeto:", parsedData);
      
      // Garante campos obrigatórios após conversão
      return {
        primary_goal: parsedData.primary_goal || "",
        expected_outcomes: Array.isArray(parsedData.expected_outcomes) ? parsedData.expected_outcomes : [],
        expected_outcome_30days: parsedData.expected_outcome_30days || "",
        priority_solution_type: parsedData.priority_solution_type || "",
        how_implement: parsedData.how_implement || "",
        week_availability: parsedData.week_availability || "",
        live_interest: parsedData.live_interest !== undefined ? Number(parsedData.live_interest) : 5,
        content_formats: Array.isArray(parsedData.content_formats) ? parsedData.content_formats : [],
      };
    } catch (e) {
      console.error("Erro ao converter business_goals de string para objeto:", e);
      return {
        primary_goal: "",
        expected_outcomes: [],
        expected_outcome_30days: "",
        priority_solution_type: "",
        how_implement: "",
        week_availability: "",
        live_interest: 5,
        content_formats: [],
      };
    }
  }
  
  // Caso 3: Se for objeto, garante campos obrigatórios
  if (typeof data === 'object') {
    console.log("business_goals já é um objeto, normalizando campos");
    return {
      primary_goal: data.primary_goal || "",
      expected_outcomes: Array.isArray(data.expected_outcomes) ? data.expected_outcomes : [],
      expected_outcome_30days: data.expected_outcome_30days || "",
      priority_solution_type: data.priority_solution_type || "",
      how_implement: data.how_implement || "",
      week_availability: data.week_availability || "",
      live_interest: data.live_interest !== undefined ? Number(data.live_interest) : 5,
      content_formats: Array.isArray(data.content_formats) ? data.content_formats : [],
    };
  }
  
  // Caso padrão: retorna objeto vazio
  console.warn("Tipo de dados inesperado para business_goals:", typeof data);
  return {
    primary_goal: "",
    expected_outcomes: [],
    expected_outcome_30days: "",
    priority_solution_type: "",
    how_implement: "",
    week_availability: "",
    live_interest: 5,
    content_formats: [],
  };
}
