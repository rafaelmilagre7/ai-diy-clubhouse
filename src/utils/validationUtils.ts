
/**
 * Funções de validação reutilizáveis para todo o sistema
 */

/**
 * Valida se uma string é um UUID válido
 * @param id String a ser validada
 * @returns Boolean indicando se é um UUID válido
 */
export const isValidUUID = (id: string | null | undefined): boolean => {
  if (!id) return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Determina se estamos em ambiente de desenvolvimento
 * @returns Boolean indicando se é ambiente de desenvolvimento
 */
export const isDevelopmentMode = (): boolean => {
  // Verifica se estamos em ambiente de desenvolvimento
  // Em um ambiente real, esta verificação seria baseada em variáveis de ambiente
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

/**
 * Gera um UUID válido para uso em desenvolvimento
 * @returns String contendo UUID válido
 */
export const generateValidUUID = (): string => {
  // Usar crypto.randomUUID() se disponível no navegador
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback simples para gerar UUID se randomUUID não estiver disponível
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Verifica se um ID é um UUID simulado de ambiente de desenvolvimento
 * @param id ID a verificar
 * @returns Boolean indicando se é um ID simulado
 */
export const isSimulatedID = (id: string | null | undefined): boolean => {
  if (!id) return false;
  return isDevelopmentMode() && !isValidUUID(id);
};
