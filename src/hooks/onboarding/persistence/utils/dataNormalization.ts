
import { OnboardingData } from "@/types/onboarding";

/**
 * Interface para as metas de negócios normalizadas
 */
export interface NormalizedBusinessGoals {
  primary_goal: string;
  expected_outcomes: string[];
  timeline: string;
  expected_outcome_30days?: string;
  priority_solution_type?: string;
  how_implement?: string;
  week_availability?: string;
  live_interest?: number;
  content_formats?: string[];
  [key: string]: any; // Para permitir campos dinâmicos (como objetivos booleanos)
}

/**
 * Normaliza os dados de metas de negócios
 * @param data Dados a serem normalizados
 * @returns Objeto com dados normalizados
 */
export function normalizeBusinessGoals(data: any): NormalizedBusinessGoals {
  console.log("[normalizeBusinessGoals] Normalizando dados:", typeof data, data);
  
  // Valores padrão para campos obrigatórios
  const defaultValues: NormalizedBusinessGoals = {
    primary_goal: '',
    expected_outcomes: [],
    timeline: '',
  };
  
  // Caso 1: Se for null ou undefined, retorna objeto com valores padrão
  if (data === null || data === undefined) {
    console.log("[normalizeBusinessGoals] Dados nulos, retornando valores padrão");
    return { ...defaultValues };
  }
  
  // Caso 2: Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      // Se for string vazia, retorna objeto com valores padrão
      if (data.trim() === '') {
        console.log("[normalizeBusinessGoals] String vazia, retornando valores padrão");
        return { ...defaultValues };
      }
      
      // Tentar parsear a string como JSON
      const parsedData = JSON.parse(data);
      console.log("[normalizeBusinessGoals] String convertida para objeto");
      
      // Continuar normalização com o dado parseado
      return normalizeBusinessGoals(parsedData);
    } catch (e) {
      console.error("[normalizeBusinessGoals] Erro ao converter string:", e);
      return { ...defaultValues };
    }
  }
  
  // Caso 3: Se for objeto, garante campos obrigatórios
  if (typeof data === 'object') {
    console.log("[normalizeBusinessGoals] Normalizando campos do objeto");
    
    // Se data for um array, converte para objeto com valores padrão
    if (Array.isArray(data)) {
      console.warn("[normalizeBusinessGoals] Dados são um array, convertendo");
      return { ...defaultValues };
    }
    
    // Verificar formato aninhado com o campo business_goals
    if (data.business_goals && typeof data.business_goals === 'object') {
      console.log("[normalizeBusinessGoals] Formato aninhado detectado");
      return normalizeBusinessGoals(data.business_goals);
    }
    
    // Garantir que arrays sejam realmente arrays
    const ensureArray = (value: any): string[] => {
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
    
    // Garantir valores string mesmo que sejam nulos
    const ensureString = (value: any): string => {
      if (value === undefined || value === null) return '';
      return String(value);
    };
    
    // Garantir valores numéricos
    const ensureNumber = (value: any): number | undefined => {
      if (value === undefined || value === null) return undefined;
      
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    };

    // Verificar se estamos usando o novo formato (objetivos como valores booleanos)
    const isUsingNewFormat = Object.entries(data).some(([key, value]) => 
      key !== 'primary_goal' && 
      key !== 'expected_outcomes' && 
      key !== 'timeline' && 
      typeof value === 'boolean'
    );
    
    // Criar novo objeto normalizado
    const normalizedData: NormalizedBusinessGoals = {
      primary_goal: ensureString(data.primary_goal || 'custom'),
      expected_outcomes: ensureArray(data.expected_outcomes || []),
      timeline: ensureString(data.timeline || '30days'),
      expected_outcome_30days: ensureString(data.expected_outcome_30days),
      priority_solution_type: ensureString(data.priority_solution_type),
      how_implement: ensureString(data.how_implement),
      week_availability: ensureString(data.week_availability),
      live_interest: ensureNumber(data.live_interest),
      content_formats: ensureArray(data.content_formats || []),
    };
    
    // Se estamos usando o novo formato, adicionar os objetivos como chaves booleanas
    if (isUsingNewFormat) {
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'primary_goal' && key !== 'expected_outcomes' && key !== 'timeline') {
          normalizedData[key] = value;
          
          // Se o valor é true, adicionar à lista de expected_outcomes
          if (value === true && !normalizedData.expected_outcomes.includes(key)) {
            normalizedData.expected_outcomes.push(key);
          }
        }
      });
    }
    
    // Adicionar expected_outcome_30days aos expected_outcomes se existir
    if (normalizedData.expected_outcome_30days && 
        !normalizedData.expected_outcomes.includes(normalizedData.expected_outcome_30days)) {
      normalizedData.expected_outcomes = [
        ...normalizedData.expected_outcomes,
        normalizedData.expected_outcome_30days
      ].filter(Boolean);
    }
    
    console.log("[normalizeBusinessGoals] Dados normalizados:", normalizedData);
    return normalizedData;
  }
  
  // Caso padrão: retorna objeto com valores padrão
  console.warn("[normalizeBusinessGoals] Tipo de dados inesperado:", typeof data);
  return { ...defaultValues };
}

/**
 * Função para normalizar campos genéricos
 * @param value Valor a ser normalizado
 * @returns Valor normalizado como string
 */
export function normalizeField(value: any): any {
  // Se for null ou undefined, retorna string vazia
  if (value === null || value === undefined) {
    return "";
  }
  
  // Se for string, apenas faz trim
  if (typeof value === "string") {
    return value.trim();
  }
  
  // Se for número, converte para string
  if (typeof value === "number") {
    return value.toString();
  }
  
  // Se for objeto, converte para JSON string
  if (typeof value === "object") {
    // Se for um objeto vazio, retorna string vazia
    if (Object.keys(value).length === 0) {
      return "";
    }
    
    try {
      return value; // Retorna o objeto como está para manter na estrutura JSONB
    } catch (e) {
      console.error("[normalizeField] Erro ao converter objeto:", e);
      return "";
    }
  }
  
  // Caso padrão, retorna string vazia
  return "";
}

/**
 * Função para normalizar experiência com IA
 * @param data Dados de experiência com IA
 * @returns Objeto normalizado
 */
export function normalizeAIExperience(data: any): any {
  // Se for null ou undefined, retorna objeto vazio
  if (data === null || data === undefined) {
    return {};
  }
  
  // Se for string, tenta converter para objeto
  if (typeof data === "string") {
    try {
      return normalizeAIExperience(JSON.parse(data));
    } catch (e) {
      console.error("[normalizeAIExperience] Erro ao converter string:", e);
      return {};
    }
  }
  
  // Se não for objeto, retorna objeto vazio
  if (typeof data !== "object") {
    return {};
  }
  
  // Garantir arrays para campos tipo array
  const ensureArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch (e) {
        return value.trim() ? [value] : [];
      }
    }
    return [value];
  };
  
  // Normalizar campos
  return {
    knowledge_level: data.knowledge_level || data.ai_usage_level || "",
    previous_tools: ensureArray(data.previous_tools || data.tools_used || []),
    desired_ai_areas: ensureArray(data.desired_ai_areas || data.interest_areas || []),
    has_implemented: data.has_implemented || data.has_implemented_ai || false,
    nps_score: Number(data.nps_score) || 0,
    completed_formation: Boolean(data.completed_formation || data.completed_training),
    improvement_suggestions: data.improvement_suggestions || data.suggestions || "",
  };
}

/**
 * Função para normalizar personalização de experiência
 * @param data Dados de personalização de experiência
 * @returns Objeto normalizado
 */
export function normalizeExperiencePersonalization(data: any): any {
  // Se for null ou undefined, retorna objeto vazio
  if (data === null || data === undefined) {
    return {};
  }
  
  // Se for string, tenta converter para objeto
  if (typeof data === "string") {
    try {
      return normalizeExperiencePersonalization(JSON.parse(data));
    } catch (e) {
      console.error("[normalizeExperiencePersonalization] Erro ao converter string:", e);
      return {};
    }
  }
  
  // Se não for objeto, retorna objeto vazio
  if (typeof data !== "object") {
    return {};
  }
  
  // Garantir arrays para campos tipo array
  const ensureArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch (e) {
        return value.trim() ? [value] : [];
      }
    }
    return [value];
  };
  
  // Normalizar campos
  return {
    interests: ensureArray(data.interests || []),
    time_preference: ensureArray(data.time_preference || data.preferred_times || []),
    available_days: ensureArray(data.available_days || data.days_available || []),
    networking_availability: Number(data.networking_availability || data.networking_level || 0),
    skills_to_share: ensureArray(data.skills_to_share || data.shareable_skills || []),
    mentorship_topics: ensureArray(data.mentorship_topics || []),
  };
}
