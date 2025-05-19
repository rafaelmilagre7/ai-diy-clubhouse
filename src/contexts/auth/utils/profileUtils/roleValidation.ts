
import { UserRole } from "@/lib/supabase";

/**
 * Validates if the user's role matches the required role
 */
export function validateRole(
  userRole: string | UserRole, 
  requiredRole: string | string[]
): boolean {
  // Se o userRole for um objeto, pegue a propriedade name
  const roleName = typeof userRole === 'object' ? userRole.name : userRole;
  
  // Se requiredRole for um array, verifica se o userRole está nesse array
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(roleName);
  }
  
  // Senão, compara diretamente
  return roleName === requiredRole;
}

/**
 * Alias para manter compatibilidade com código existente
 */
export const validateUserRole = validateRole;

/**
 * Determina o papel do usuário com base no email
 * @param email Email do usuário
 * @returns Nome do papel determinado
 */
export function determineRoleFromEmail(email: string): string {
  // Verificação para administradores
  if (email.endsWith('@viverdeia.ai') || email === 'admin@teste.com') {
    return 'admin';
  }
  
  // Verificação para usuários de formação
  if (email.endsWith('@formacao.viverdeia.ai') || email.includes('formacao')) {
    return 'formacao';
  }
  
  // Padrão para todos os outros usuários
  return 'member';
}

/**
 * Verifica se o usuário é um super administrador
 * @param role Papel do usuário
 * @returns true se o usuário for super admin
 */
export function isSuperAdmin(role: string | UserRole): boolean {
  const roleName = typeof role === 'object' ? role.name : role;
  return roleName === 'admin';
}
