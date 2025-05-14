
import { generateMockId, isDevelopmentMode, isMockId } from "./environmentUtils";

/**
 * Verifica se uma string é um UUID válido
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Verifica se é um ID simulado (para desenvolvimento)
 */
export function isSimulatedID(id: string): boolean {
  return isMockId(id);
}

/**
 * Gera um UUID válido para fins de desenvolvimento
 */
export function generateValidUUID(prefix?: string): string {
  return generateMockId(prefix);
}

/**
 * Verifica se estamos em modo de desenvolvimento
 */
export { isDevelopmentMode } from "./environmentUtils";

/**
 * Validação de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Verifica se uma string é um número de celular brasileiro válido
 */
export function isValidBrazilianPhone(phone: string): boolean {
  // Remover todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verificar se o telefone tem o formato correto para celular brasileiro
  // Deve ter 11 dígitos (com DDD) para celular ou 10 para fixo
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

// Adicionando funções que estão faltando
/**
 * Alias para compatibilidade com código existente
 */
export const validateBrazilianPhone = isValidBrazilianPhone;

/**
 * Valida uma URL do LinkedIn
 */
export function validateLinkedInUrl(url: string): boolean {
  if (!url) return true; // URL vazia é válida (não obrigatória)
  
  // Aceita formatos como linkedin.com/in/username ou https://linkedin.com/in/username
  const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  return linkedinRegex.test(url);
}

/**
 * Valida um nome de usuário ou URL do Instagram
 */
export function validateInstagramUrl(username: string): boolean {
  if (!username) return true; // Username vazio é válido (não obrigatório)
  
  // Remove @ se existir no início
  const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
  
  // Aceita formatos como @username, username, instagram.com/username ou https://instagram.com/username
  const instagramUrlRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/i;
  const usernameRegex = /^[a-zA-Z0-9._]{1,30}$/;
  
  return instagramUrlRegex.test(cleanUsername) || usernameRegex.test(cleanUsername);
}

/**
 * Sanitiza uma string de telefone, mantendo apenas números
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Formata um número de telefone brasileiro
 */
export function formatBrazilianPhone(phone: string): string {
  const cleaned = sanitizePhoneNumber(phone);
  
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  
  // Caso não seja um formato reconhecido, retornar o valor original
  return phone;
}

/**
 * Formata URLs de redes sociais para garantir formato consistente
 */
export function formatSocialUrl(url: string, type: 'linkedin' | 'instagram'): string {
  if (!url) return '';
  
  // Remover espaços em branco
  let formattedUrl = url.trim();
  
  if (type === 'linkedin') {
    // Se não começar com http ou https, adicionar protocolo
    if (!formattedUrl.match(/^https?:\/\//)) {
      // Se não começar com linkedin.com, adicionar
      if (!formattedUrl.match(/^(www\.)?linkedin\.com/)) {
        // Se começar com @ ou in/, remover
        formattedUrl = formattedUrl.replace(/^(@|in\/)/g, '');
        formattedUrl = `https://linkedin.com/in/${formattedUrl}`;
      } else {
        formattedUrl = `https://${formattedUrl}`;
      }
    }
  } else if (type === 'instagram') {
    // Remover @ se existir
    formattedUrl = formattedUrl.replace(/^@/, '');
    
    // Se não começar com http ou https, nem com instagram.com
    if (!formattedUrl.match(/^(https?:\/\/)?(www\.)?instagram\.com/)) {
      formattedUrl = `https://instagram.com/${formattedUrl}`;
    } else if (!formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = `https://${formattedUrl}`;
    }
  }
  
  return formattedUrl;
}
