
/**
 * Interface para dados normalizados de informações complementares
 */
export interface NormalizedComplementaryInfo {
  how_found_us?: string;
  referred_by?: string;
  authorize_case_usage?: boolean;
  interested_in_interview?: boolean;
  priority_topics?: string[];
}

/**
 * Normaliza dados de informações complementares
 * Garante que todos os campos esperados estejam presentes e com o tipo correto
 */
export function normalizeComplementaryInfo(data: any): NormalizedComplementaryInfo {
  console.log("[normalizeComplementaryInfo] Normalizando dados:", typeof data, data);
  
  // Valores padrão para todos os campos
  const defaultValues: NormalizedComplementaryInfo = {
    how_found_us: '',
    referred_by: '',
    authorize_case_usage: false,
    interested_in_interview: false,
    priority_topics: [],
  };
  
  // Caso 1: Se for null ou undefined, retorna objeto com valores padrão
  if (data === null || data === undefined) {
    console.log("[normalizeComplementaryInfo] Dados nulos, retornando valores padrão");
    return { ...defaultValues };
  }
  
  // Caso 2: Se for string, tenta converter para objeto
  if (typeof data === 'string') {
    try {
      // Se for string vazia, retorna objeto com valores padrão
      if (data.trim() === '') {
        console.log("[normalizeComplementaryInfo] String vazia, retornando valores padrão");
        return { ...defaultValues };
      }
      
      // Tentar parsear a string como JSON
      const parsedData = JSON.parse(data);
      console.log("[normalizeComplementaryInfo] String convertida para objeto");
      
      // Continuar normalização com o dado parseado
      return normalizeComplementaryInfo(parsedData);
    } catch (e) {
      console.error("[normalizeComplementaryInfo] Erro ao converter string:", e);
      return { ...defaultValues };
    }
  }
  
  // Caso 3: Se for objeto, garante campos obrigatórios
  if (typeof data === 'object') {
    console.log("[normalizeComplementaryInfo] Normalizando campos do objeto");
    
    // Se data for um array, converte para objeto com valores padrão
    if (Array.isArray(data)) {
      console.warn("[normalizeComplementaryInfo] Dados são um array, convertendo");
      return { ...defaultValues };
    }
    
    // Verificar formato aninhado com o campo complementary_info
    if (data.complementary_info && typeof data.complementary_info === 'object') {
      console.log("[normalizeComplementaryInfo] Formato aninhado detectado");
      return normalizeComplementaryInfo(data.complementary_info);
    }
    
    // Garantir que arrays sejam realmente arrays
    const ensureArray = (value: any) => {
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
    
    // Garantir que booleanos sejam realmente booleanos
    const ensureBoolean = (value: any) => {
      if (typeof value === 'boolean') return value;
      if (value === undefined || value === null) return false;
      
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      
      if (typeof value === 'number') {
        return value === 1;
      }
      
      return Boolean(value);
    };
    
    // Criar novo objeto normalizado
    const normalizedData: NormalizedComplementaryInfo = {
      how_found_us: data.how_found_us || data.how_discovered || '',
      referred_by: data.referred_by || data.referral_name || '',
      authorize_case_usage: ensureBoolean(data.authorize_case_usage || data.authorize_case_studies),
      interested_in_interview: ensureBoolean(data.interested_in_interview || data.interested_in_interviews),
      priority_topics: ensureArray(data.priority_topics),
    };
    
    console.log("[normalizeComplementaryInfo] Dados normalizados:", normalizedData);
    return normalizedData;
  }
  
  // Caso padrão: retorna objeto com valores padrão
  console.warn("[normalizeComplementaryInfo] Tipo de dados inesperado:", typeof data);
  return { ...defaultValues };
}
