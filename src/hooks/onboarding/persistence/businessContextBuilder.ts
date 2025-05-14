
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Normaliza dados do contexto de negócio para garantir consistência
 * entre os formatos business_data (legado) e business_context
 */
export function normalizeBusinessContextData(data: any): OnboardingData['business_context'] {
  // Se já estiver no formato correto, retornar diretamente
  if (data && 
      (data.business_model !== undefined || 
       data.business_challenges !== undefined || 
       data.short_term_goals !== undefined || 
       data.medium_term_goals !== undefined || 
       data.important_kpis !== undefined)) {
    console.log("[businessContextBuilder] Dados já estão no formato business_context");
    return data;
  }
  
  // Se dados estiverem em formato business_data (legado), converter
  if (data && typeof data === 'object') {
    console.log("[businessContextBuilder] Convertendo business_data para business_context");
    
    // Mapeamento de campos do formato legado para o novo formato
    return {
      business_model: data.model || data.business_model || "",
      business_challenges: Array.isArray(data.challenges) ? data.challenges : 
                         Array.isArray(data.business_challenges) ? data.business_challenges : [],
      short_term_goals: Array.isArray(data.short_goals) ? data.short_goals :
                       Array.isArray(data.short_term_goals) ? data.short_term_goals : [],
      medium_term_goals: Array.isArray(data.mid_goals) ? data.mid_goals :
                        Array.isArray(data.medium_term_goals) ? data.medium_term_goals : [],
      important_kpis: Array.isArray(data.kpis) ? data.kpis :
                     Array.isArray(data.important_kpis) ? data.important_kpis : [],
      additional_context: data.additional_context || data.context || ""
    };
  }
  
  // Retornar objeto vazio se nada for encontrado
  return {
    business_model: "",
    business_challenges: [],
    short_term_goals: [],
    medium_term_goals: [],
    important_kpis: [],
    additional_context: ""
  };
}

/**
 * Extrai dados de contexto de negócio do objeto de progresso,
 * unificando formatos legados e atuais
 */
export function getBusinessContextFromProgress(progress: OnboardingProgress | null): OnboardingData['business_context'] {
  if (!progress) {
    console.log("[businessContextBuilder] Progresso não encontrado, retornando objeto vazio");
    return {
      business_model: "",
      business_challenges: [],
      short_term_goals: [],
      medium_term_goals: [],
      important_kpis: [],
      additional_context: ""
    };
  }

  // Verificar primeiro no formato atual (business_context)
  if (progress.business_context) {
    return normalizeBusinessContextData(progress.business_context);
  }
  
  // Verificar depois no formato legado (business_data)
  if (progress.business_data) {
    return normalizeBusinessContextData(progress.business_data);
  }
  
  // Se nada for encontrado, retornar objeto vazio
  return {
    business_model: "",
    business_challenges: [],
    short_term_goals: [],
    medium_term_goals: [],
    important_kpis: [],
    additional_context: ""
  };
}

/**
 * Constrói objeto de atualização específico para business_context
 * Garante compatibilidade com formatos legados e atuais
 */
export function buildBusinessContextUpdate(data: any, progress: OnboardingProgress | null): Record<string, any> {
  if (!progress) {
    console.log("[businessContextBuilder] Progresso não encontrado, retornando dados como estão");
    return data;
  }

  // Extrair dados de business_context do objeto de dados
  const contextData = data.business_context || {};
  
  // Construir objeto de atualização que mantém ambos os formatos
  const updateObj: Record<string, any> = {
    // Formato atual
    business_context: {
      ...(typeof progress.business_context === 'object' ? progress.business_context || {} : {}),
      ...contextData
    },
  };
  
  console.log("[businessContextBuilder] Objeto de atualização construído:", updateObj);
  return updateObj;
}
