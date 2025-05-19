
/**
 * Gera um ID temporário para identificação de elementos
 * @param prefix Prefixo opcional para o ID
 * @returns String temporária única
 */
export function generateTempId(prefix = 'temp'): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${randomPart}`;
}
