
/**
 * Normaliza URLs de websites garantindo que tenham um protocolo válido
 */
export function normalizeWebsite(website: string): string {
  if (!website || typeof website !== 'string') return "";
  
  // Remover espaços em branco no início e no fim
  let url = website.trim();
  
  if (!url) return "";
  
  // Se não tem protocolo, adiciona https://
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`;
  }
  
  try {
    // Validar se é uma URL válida usando o construtor URL
    new URL(url);
    return url;
  } catch (e) {
    // Se não é uma URL válida, retorna o original com https://
    return `https://${website.trim()}`;
  }
}

/**
 * Remove caracteres especiais de um número de telefone
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  
  // Remove todos os caracteres não numéricos
  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Normaliza dados de formulário para serem salvos no banco de dados
 */
export function normalizeFormData(data: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value === undefined || value === null) {
      normalized[key] = null;
      return;
    }
    
    if (key === 'company_website' || key === 'website') {
      normalized[key] = normalizeWebsite(value);
    } else if (key === 'phone') {
      normalized[key] = normalizePhone(value);
    } else if (Array.isArray(value)) {
      normalized[key] = [...value]; // Criar uma cópia do array
    } else if (typeof value === 'object') {
      normalized[key] = { ...value }; // Criar uma cópia do objeto
    } else {
      normalized[key] = value;
    }
  });
  
  return normalized;
}

/**
 * Normaliza campo genérico para garantir estrutura consistente
 * @param field Campo a ser normalizado
 * @param fieldName Nome do campo (para logs)
 */
export function normalizeField(field: any, fieldName: string = 'field'): any {
  if (!field) {
    return {};
  }
  
  // Se for string, tenta converter para objeto
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      console.error(`Erro ao converter ${fieldName} de string para objeto:`, e);
      return {};
    }
  }
  
  // Se já for objeto, retorna uma cópia
  if (typeof field === 'object') {
    return { ...field };
  }
  
  // Caso padrão
  return {};
}

/**
 * Normaliza dados de experiência com IA
 */
export function normalizeAIExperience(data: any): any {
  // Caso base: se não tiver dados, retorna objeto vazio
  if (!data) return {};
  
  // Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error("Erro ao converter AI experience de string para objeto:", e);
      return {};
    }
  }
  
  // Inicializar com valores padrão
  const normalized = {
    knowledge_level: '',
    previous_tools: [],
    has_implemented: '',
    desired_ai_areas: [],
    completed_formation: false,
    is_member_for_month: false,
    nps_score: 0,
    improvement_suggestions: ''
  };
  
  // Mesclar com os dados fornecidos
  if (typeof data === 'object') {
    Object.keys(normalized).forEach(key => {
      if (data[key] !== undefined) {
        if (key === 'previous_tools' || key === 'desired_ai_areas') {
          // Garantir que são arrays
          normalized[key as keyof typeof normalized] = Array.isArray(data[key]) ? 
            data[key] : 
            [data[key]].filter(Boolean);
        } else if (key === 'completed_formation' || key === 'is_member_for_month') {
          // Converter para boolean
          normalized[key as keyof typeof normalized] = !!data[key];
        } else if (key === 'nps_score') {
          // Converter para número
          normalized[key as keyof typeof normalized] = Number(data[key] || 0);
        } else {
          // Outros campos
          normalized[key as keyof typeof normalized] = data[key];
        }
      }
    });
  }
  
  return normalized;
}

/**
 * Normaliza dados de objetivos de negócio
 */
export function normalizeBusinessGoals(data: any): any {
  // Caso base: se não tiver dados, retorna objeto vazio
  if (!data) return {};
  
  // Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error("Erro ao converter business goals de string para objeto:", e);
      return {};
    }
  }
  
  // Inicializar com valores padrão
  const normalized = {
    primary_goal: '',
    expected_outcomes: [],
    expected_outcome_30days: '',
    priority_solution_type: '',
    how_implement: '',
    week_availability: '',
    live_interest: 5,
    content_formats: []
  };
  
  // Mesclar com os dados fornecidos
  if (typeof data === 'object') {
    Object.keys(normalized).forEach(key => {
      if (data[key] !== undefined) {
        if (key === 'expected_outcomes' || key === 'content_formats') {
          // Garantir que são arrays
          normalized[key as keyof typeof normalized] = Array.isArray(data[key]) ? 
            data[key] : 
            [data[key]].filter(Boolean);
        } else if (key === 'live_interest') {
          // Converter para número
          normalized[key as keyof typeof normalized] = Number(data[key] || 5);
        } else {
          // Outros campos
          normalized[key as keyof typeof normalized] = data[key];
        }
      }
    });
  }
  
  return normalized;
}

/**
 * Normaliza dados de personalização de experiência
 */
export function normalizeExperiencePersonalization(data: any): any {
  // Caso base: se não tiver dados, retorna objeto vazio
  if (!data) return {};
  
  // Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error("Erro ao converter experience personalization de string para objeto:", e);
      return {};
    }
  }
  
  // Inicializar com valores padrão
  const normalized = {
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: 5,
    skills_to_share: [],
    mentorship_topics: []
  };
  
  // Mesclar com os dados fornecidos
  if (typeof data === 'object') {
    Object.keys(normalized).forEach(key => {
      if (data[key] !== undefined) {
        if (key === 'interests' || key === 'time_preference' || key === 'available_days' || 
            key === 'skills_to_share' || key === 'mentorship_topics') {
          // Garantir que são arrays
          normalized[key as keyof typeof normalized] = Array.isArray(data[key]) ? 
            data[key] : 
            [data[key]].filter(Boolean);
        } else if (key === 'networking_availability') {
          // Converter para número
          normalized[key as keyof typeof normalized] = Number(data[key] || 5);
        } else {
          // Outros campos
          normalized[key as keyof typeof normalized] = data[key];
        }
      }
    });
  }
  
  return normalized;
}
