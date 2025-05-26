
import { UserRole } from '@/lib/supabase';

/**
 * Determina o papel do usuário baseado no email
 */
export const determineRoleFromEmail = (email: string): UserRole => {
  if (!email) return 'member';
  
  // Emails de admin específicos
  const adminEmails = [
    'rafael@viverdeia.ai',
    'admin@viverdeia.ai'
  ];
  
  if (adminEmails.includes(email.toLowerCase())) {
    return 'admin';
  }
  
  // Emails de formação
  if (email.toLowerCase().includes('formacao') || email.toLowerCase().includes('instrutor')) {
    return 'formacao';
  }
  
  return 'member';
};

/**
 * Valida e potencialmente atualiza o papel do usuário
 */
export const validateUserRole = async (
  userId: string, 
  currentRole: UserRole, 
  email?: string | null
): Promise<UserRole> => {
  if (!email) return currentRole;
  
  const expectedRole = determineRoleFromEmail(email);
  
  // Se o papel esperado é diferente do atual, retorna o esperado
  if (expectedRole !== currentRole) {
    console.log(`Papel do usuário ${userId} atualizado de ${currentRole} para ${expectedRole}`);
    return expectedRole;
  }
  
  return currentRole;
};

/**
 * Verifica se o usuário é super admin
 */
export const isSuperAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return email.toLowerCase() === 'rafael@viverdeia.ai';
};
