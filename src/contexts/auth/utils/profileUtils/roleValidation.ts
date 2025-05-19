
/**
 * Valida se o papel especificado corresponde ao papel requerido.
 * 
 * @param role O papel a ser validado
 * @param requiredRole O papel ou papéis requeridos
 * @returns true se o papel for válido, false caso contrário
 */
export function validateRole(role: string, requiredRole: string | string[]): boolean {
  // Se o papel for 'admin', ele tem acesso a tudo
  if (role === 'admin') {
    return true;
  }

  // Verificar com um array de papéis requeridos
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(role);
  }

  // Verificar com um único papel requerido
  return role === requiredRole;
}

/**
 * Alias para validateRole para compatibilidade com código existente
 */
export const validateUserRole = validateRole;

/**
 * Determina o papel do usuário com base no email
 * 
 * @param email O email do usuário
 * @returns O papel determinado
 */
export function determineRoleFromEmail(email: string): string {
  if (!email) return 'member';
  
  // Verificar emails administrativos
  if (email.endsWith('@viverdeia.ai') || email === 'admin@teste.com') {
    return 'admin';
  }
  
  // Verificar emails de formação
  if (email.includes('formacao') || email.endsWith('@formacao.viverdeia.ai')) {
    return 'formacao';
  }
  
  // Default para membros normais
  return 'member';
}

/**
 * Verifica se o usuário é um superadmin
 * 
 * @param email O email do usuário
 * @returns true se for superadmin, false caso contrário
 */
export function isSuperAdmin(email: string): boolean {
  const specialEmails = ['admin@viverdeia.ai', 'rafael@viverdeia.ai'];
  return specialEmails.includes(email);
}
