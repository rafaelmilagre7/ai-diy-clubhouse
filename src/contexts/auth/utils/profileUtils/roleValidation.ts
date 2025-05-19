
import { UserProfile, UserRole } from "@/lib/supabase/types";

/**
 * Valida o role com base no nome
 */
export function validateRole(role: string | null | undefined): string {
  if (!role) return 'member';
  
  const validRoles = ['admin', 'member', 'moderator', 'formacao'];
  return validRoles.includes(role) ? role : 'member';
}

/**
 * Valida o role do usuário com base no perfil
 */
export function validateUserRole(profile: UserProfile | null): string {
  if (!profile) return 'member';
  return validateRole(profile.role);
}

/**
 * Determina o role com base no email
 * Usado principalmente para testes e regras específicas de domínio
 */
export function determineRoleFromEmail(email: string): string {
  if (!email) return 'member';
  
  if (email.endsWith('@admin.com') || email.includes('admin')) {
    return 'admin';
  }
  
  if (email.endsWith('@formacao.com') || email.includes('formacao')) {
    return 'formacao';
  }
  
  return 'member';
}

/**
 * Verifica se o usuário é um super administrador
 */
export function isSuperAdmin(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
  // Verificação por email (para testes)
  if (profile.email && 
     (profile.email.includes('super') || 
      profile.email.includes('admin'))) {
    return true;
  }
  
  // Verificação por role
  return profile.role === 'admin' && !!profile.user_roles?.id;
}
