
/**
 * Gera um ID temporário para objetos de vídeo
 * @returns String de ID aleatório
 */
export function generateTempId(): string {
  return `temp_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Gera um nome de arquivo simplificado
 * @param originalName Nome original do arquivo
 * @returns Nome simplificado
 */
export function generateSimpleFileName(originalName: string): string {
  if (!originalName) return '';
  
  // Remover a extensão
  const nameParts = originalName.split('.');
  const nameWithoutExtension = nameParts.slice(0, -1).join('.');
  
  // Simplificar o nome
  return nameWithoutExtension
    .replace(/[^\w\s]/gi, '') // Remover caracteres especiais
    .replace(/\s+/g, '_')     // Substituir espaços por underscores
    .toLowerCase()
    .substring(0, 32);        // Limitar o tamanho
}
