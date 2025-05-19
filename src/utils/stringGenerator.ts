
/**
 * Gera uma string aleatória com o comprimento especificado
 * @param length Comprimento da string a ser gerada (padrão: 10)
 * @returns String aleatória
 */
export function generateRandomString(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Gera um ID único para uso temporário
 * @returns String no formato "temp-{timestamp}-{random}"
 */
export function generateTempId(): string {
  const timestamp = Date.now();
  const random = generateRandomString(6);
  return `temp-${timestamp}-${random}`;
}

/**
 * Gera um slug a partir de uma string
 * @param text Texto para converter em slug
 * @returns String formatada como slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Normalizar acentos
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiais
    .replace(/\s+/g, '-') // Substituir espaços por hífens
    .replace(/-+/g, '-') // Evitar hífens duplicados
    .trim(); // Remover espaços extras
}

export default {
  generateRandomString,
  generateTempId,
  generateSlug
};
