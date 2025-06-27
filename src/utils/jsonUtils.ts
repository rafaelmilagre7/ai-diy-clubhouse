
/**
 * Utilitários seguros para manipulação de JSON
 */

// Função utilitária para parsing seguro de JSON
export const safeJsonParse = <T = any>(jsonString: string | null | undefined, fallback: T): T => {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Erro ao fazer parse de JSON:', error);
    return fallback;
  }
};

// Função utilitária para parsing seguro de JSON objects
export const safeJsonParseObject = (jsonData: any, fallback: any = {}): any => {
  if (jsonData === null || jsonData === undefined) {
    return fallback;
  }
  
  if (typeof jsonData === 'object') {
    return jsonData;
  }
  
  if (typeof jsonData === 'string') {
    return safeJsonParse(jsonData, fallback);
  }
  
  return fallback;
};

// Função para stringify seguro
export const safeJsonStringify = (data: any, fallback: string = '{}'): string => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.warn('Erro ao fazer stringify de JSON:', error);
    return fallback;
  }
};

// Função para extrair arrays de JSON
export const extractJsonArray = <T = any>(jsonData: any, fallback: T[] = []): T[] => {
  const parsed = safeJsonParseObject(jsonData, fallback);
  
  if (Array.isArray(parsed)) {
    return parsed;
  }
  
  return fallback;
};

// Função para extrair objetos de JSON
export const extractJsonObject = <T = Record<string, any>>(jsonData: any, fallback: T = {} as T): T => {
  const parsed = safeJsonParseObject(jsonData, fallback);
  
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed;
  }
  
  return fallback;
};
