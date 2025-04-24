
/**
 * Utilitário para normalizar dados de informações complementares
 */

export interface NormalizedComplementaryInfo {
  how_found_us: string;
  referred_by: string;
  authorize_case_usage: boolean;
  interested_in_interview: boolean;
  priority_topics: string[];
}

export function normalizeComplementaryInfo(data: any): NormalizedComplementaryInfo {
  // Criar objeto normalizado com valores padrão
  const normalized: NormalizedComplementaryInfo = {
    how_found_us: '',
    referred_by: '',
    authorize_case_usage: false,
    interested_in_interview: false,
    priority_topics: [],
  };
  
  // Verificar se os dados existem
  if (!data) return normalized;
  
  // Se for string, tentar converter para objeto
  if (typeof data === 'string') {
    try {
      const parsedData = JSON.parse(data);
      return normalizeComplementaryInfo(parsedData); // Recursão para processar o objeto convertido
    } catch (e) {
      console.error("Erro ao converter complementary_info de string para objeto:", e);
      return normalized;
    }
  }
  
  // Se for objeto, extrair valores com segurança
  if (typeof data === 'object' && data !== null) {
    // Copiar valores do objeto original com validações de tipo
    normalized.how_found_us = typeof data.how_found_us === 'string' ? data.how_found_us : normalized.how_found_us;
    normalized.referred_by = typeof data.referred_by === 'string' ? data.referred_by : normalized.referred_by;
    
    // Garantir que booleanos sejam booleanos
    normalized.authorize_case_usage = typeof data.authorize_case_usage === 'boolean' 
      ? data.authorize_case_usage 
      : !!data.authorize_case_usage;  // Converte para booleano
    
    normalized.interested_in_interview = typeof data.interested_in_interview === 'boolean' 
      ? data.interested_in_interview 
      : !!data.interested_in_interview;  // Converte para booleano
    
    // Garantir que tópicos prioritários seja um array
    if (data.priority_topics) {
      if (Array.isArray(data.priority_topics)) {
        normalized.priority_topics = data.priority_topics;
      } else if (typeof data.priority_topics === 'string') {
        // Se for uma string, tentar converter para array
        try {
          const parsedTopics = JSON.parse(data.priority_topics);
          normalized.priority_topics = Array.isArray(parsedTopics) ? parsedTopics : [data.priority_topics];
        } catch {
          // Se não conseguir converter, usar como único item
          normalized.priority_topics = [data.priority_topics];
        }
      } else {
        // Fallback se for outro tipo
        normalized.priority_topics = [String(data.priority_topics)];
      }
    }
  }
  
  return normalized;
}
