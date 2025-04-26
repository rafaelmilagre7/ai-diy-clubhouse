
/**
 * Tipo normalizado para informações complementares
 */
export interface NormalizedComplementaryInfo {
  how_found_us?: string;
  referred_by?: string;
  authorize_case_usage?: boolean;
  interested_in_interview?: boolean;
  priority_topics?: string[];
  [key: string]: any;
}

/**
 * Normaliza os dados de informações complementares
 * @param data Dados brutos a serem normalizados
 * @returns Dados normalizados
 */
export function normalizeComplementaryInfo(data: any): NormalizedComplementaryInfo {
  console.log("[normalizeComplementaryInfo] Normalizando dados:", typeof data, data);
  
  // Se não houver dados ou não for um objeto, retornar objeto padrão
  if (!data || typeof data !== 'object') {
    console.warn("[normalizeComplementaryInfo] Normalização recebeu dados inválidos:", data);
    return {
      how_found_us: "",
      referred_by: "",
      authorize_case_usage: false,
      interested_in_interview: false,
      priority_topics: []
    };
  }
  
  // Se for string, tentar parsear
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
      console.log("[normalizeComplementaryInfo] Dados convertidos de string para objeto:", data);
    } catch (e) {
      console.error("[normalizeComplementaryInfo] Erro ao parsear string para objeto:", e);
      return {
        how_found_us: "",
        referred_by: "",
        authorize_case_usage: false,
        interested_in_interview: false,
        priority_topics: []
      };
    }
  }
  
  // Garantir que arrays sejam realmente arrays
  const ensureArray = (value: any) => {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
      } catch (e) {
        return value.trim() ? [value] : [];
      }
    }
    return [value];
  };
  
  // Normalização de dados
  const normalized = {
    how_found_us: data.how_found_us || "",
    referred_by: data.referred_by || "",
    authorize_case_usage: Boolean(data.authorize_case_usage),
    interested_in_interview: Boolean(data.interested_in_interview),
    priority_topics: ensureArray(data.priority_topics),
    ...data, // Manter outros campos personalizados
  };
  
  console.log("[normalizeComplementaryInfo] Dados normalizados:", normalized);
  return normalized;
}
