
/**
 * Utilitário para normalizar dados de informações complementares
 */

export function normalizeComplementaryInfo(data: any): Record<string, any> {
  // Verificar se os dados existem
  if (!data) return {};
  
  // Se for string, tentar converter para objeto
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Erro ao converter complementary_info de string para objeto:", e);
      return {};
    }
  }
  
  // Se for objeto, garantir que os campos tenham valores válidos
  if (typeof data === 'object' && data !== null) {
    // Criar uma cópia para não modificar o objeto original
    const normalized = { ...data };
    
    // Garantir que arrays sejam arrays
    if (normalized.priority_topics && !Array.isArray(normalized.priority_topics)) {
      normalized.priority_topics = normalized.priority_topics ? [normalized.priority_topics] : [];
    }
    
    // Garantir que booleanos sejam booleanos
    normalized.authorize_case_usage = !!normalized.authorize_case_usage;
    normalized.interested_in_interview = !!normalized.interested_in_interview;
    
    return normalized;
  }
  
  // Fallback para objeto vazio
  return {};
}
