
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/supabase/types";

/**
 * Processa o perfil do usuário a partir da sessão
 * @param user Objeto do usuário autenticado
 * @returns Promessa com o perfil processado
 */
export async function processUserProfile(user: User | null): Promise<UserProfile | null> {
  if (!user) return null;
  
  try {
    // Buscar o perfil do usuário no banco de dados
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_roles:role_id(id, name, description, permissions)')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      console.warn("Perfil de usuário não encontrado no banco de dados.");
      return null;
    }
    
    // Validar o papel do usuário com base no email
    const validatedRole = await validateUserRole(data, user.email);
    
    // Construir o objeto do perfil completo
    const profile: UserProfile = {
      ...data,
      role: validatedRole,
      email: user.email || data.email,
    };
    
    return profile;
  } catch (error) {
    console.error("Erro ao processar perfil do usuário:", error);
    return null;
  }
}

/**
 * Obtém o papel (role) do usuário
 * @param profile Perfil do usuário
 * @returns Papel do usuário
 */
export function getUserRole(profile: UserProfile | null): string {
  return profile?.role || 'member';
}

/**
 * Valida o papel do usuário com base no email
 * @param profile Perfil do usuário
 * @param email Email do usuário para determinar o papel correto
 * @returns Papel validado do usuário
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
 * Valida se o usuário tem autorização para acessar determinadas funcionalidades
 * @param profile Perfil do usuário
 * @param requiredRoles Papéis permitidos
 * @returns Se o usuário tem autorização
 */
export function validateUserAuthorization(profile: UserProfile | null, requiredRoles: string[] = ['admin', 'formacao']): boolean {
  if (!profile) return false;
  
  const userRole = profile.role || 'member';
  return requiredRoles.includes(userRole);
}
