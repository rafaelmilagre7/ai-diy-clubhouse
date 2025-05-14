
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
