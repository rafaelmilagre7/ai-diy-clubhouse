
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
    
    // Criar novo objeto normalizado
    const normalizedData: NormalizedBusinessGoals = {
      primary_goal: ensureString(data.primary_goal),
      expected_outcomes: ensureArray(data.expected_outcomes || []),
      timeline: ensureString(data.timeline),
      expected_outcome_30days: ensureString(data.expected_outcome_30days),
      priority_solution_type: ensureString(data.priority_solution_type),
      how_implement: ensureString(data.how_implement),
      week_availability: ensureString(data.week_availability),
      live_interest: ensureNumber(data.live_interest),
      content_formats: ensureArray(data.content_formats || []),
    };
    
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
