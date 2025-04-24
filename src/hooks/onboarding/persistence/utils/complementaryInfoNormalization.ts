
/**
 * Utilitário para normalizar dados de informações complementares
 * Garante formato consistente independente de como os dados foram armazenados
 */

// Definindo e exportando o tipo para dados normalizados
export interface NormalizedComplementaryInfo {
  how_found_us: string;
  referred_by: string;
  authorize_case_usage: boolean;
  interested_in_interview: boolean;
  priority_topics: string[];
}

export function normalizeComplementaryInfo(data: any): NormalizedComplementaryInfo {
  // Se não temos dados, retornar objeto vazio
  if (!data) {
    return {
      how_found_us: "",
      referred_by: "",
      authorize_case_usage: false,
      interested_in_interview: false,
      priority_topics: []
    };
  }
  
  // Se for string, tentar converter para objeto
  if (typeof data === 'string' && data !== "" && data !== "{}") {
    try {
      data = JSON.parse(data);
      console.log("[normalizeComplementaryInfo] Dados convertidos de string:", data);
    } catch (e) {
      console.error("[normalizeComplementaryInfo] Erro ao converter string para objeto:", e);
      return {
        how_found_us: "",
        referred_by: "",
        authorize_case_usage: false,
        interested_in_interview: false,
        priority_topics: []
      };
    }
  }
  
  // Garantir estrutura consistente
  const normalizedData: NormalizedComplementaryInfo = {
    how_found_us: data.how_found_us || "",
    referred_by: data.referred_by || "",
    authorize_case_usage: Boolean(data.authorize_case_usage),
    interested_in_interview: Boolean(data.interested_in_interview),
    priority_topics: Array.isArray(data.priority_topics) ? data.priority_topics : []
  };
  
  return normalizedData;
}
