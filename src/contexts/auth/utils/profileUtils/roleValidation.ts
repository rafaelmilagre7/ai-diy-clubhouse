
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/supabase/types";

/**
 * Verifica se um determinado papel é válido para o usuário
 * @param role Papel a ser validado
 * @param email Email do usuário
 */
export function validateRole(role: string, email?: string): boolean {
  if (!email) return true;
  
  const correctRole = determineRoleFromEmail(email);
  return role === correctRole;
}

/**
 * Valida o papel do usuário e atualiza se necessário
 * @param profile Perfil do usuário
 * @param email Email para determinar o papel correto
 */
export async function validateUserRole(profile: UserProfile, email?: string): Promise<string> {
  if (!email) return profile.role || 'member';

  const correctRole = determineRoleFromEmail(email);
  
  // Se o papel não corresponder ao email, atualizar
  if (profile.role !== correctRole) {
    await supabase
      .from('profiles')
      .update({ role: correctRole })
      .eq('id', profile.id);
    
    return correctRole;
  }
  
  return profile.role || 'member';
}

/**
 * Determina o papel correto com base no email
 * @param email Email do usuário
 */
export function determineRoleFromEmail(email: string): string {
  if (!email) return 'member';
  
  if (email.includes('@viverdeia.ai') || email === 'admin@teste.com') {
    return 'admin';
  } else if (email.includes('@formacao.viverdeia.ai') || email.includes('formacao@viverdeia.ai')) {
    return 'formacao';
  } else {
    return 'member';
  }
}

/**
 * Verifica se o usuário é um super administrador
 * @param profile Perfil do usuário
 */
export function isSuperAdmin(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.role === 'admin';
}
