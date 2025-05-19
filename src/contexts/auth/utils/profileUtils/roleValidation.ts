
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/supabase/types";

/**
 * Valida se a função do usuário está correta com base no e-mail
 * @param profile Perfil do usuário
 * @returns Perfil atualizado se necessário
 */
export async function validateUserRole(profile: UserProfile): Promise<UserProfile> {
  if (!profile || !profile.email) {
    return profile;
  }
  
  // Determinar a função correta com base no e-mail
  const correctRole = determineRoleFromEmail(profile.email);
  
  // Se a função atual for diferente, atualizar
  if (profile.role !== correctRole) {
    try {
      // Buscar o ID da função correta
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', correctRole)
        .single();
      
      if (roleData) {
        // Atualizar o perfil com a nova função
        await supabase
          .from('profiles')
          .update({ 
            role: correctRole,
            role_id: roleData.id 
          })
          .eq('id', profile.id);
        
        // Atualizar o objeto de perfil para refletir a mudança
        return {
          ...profile,
          role: correctRole,
          role_id: roleData.id
        };
      }
    } catch (error) {
      console.error("Erro ao atualizar função do usuário:", error);
    }
  }
  
  return profile;
}

/**
 * Determina a função correta do usuário com base no e-mail
 * @param email E-mail do usuário
 * @returns Nome da função adequada
 */
export function determineRoleFromEmail(email: string): string {
  if (!email) return 'member';
  
  const lowerEmail = email.toLowerCase();
  
  // Verificar se é um e-mail de admin
  if (lowerEmail.endsWith('@viverdeia.ai') || 
      lowerEmail === 'admin@teste.com') {
    return 'admin';
  }
  
  // Verificar se é um e-mail de formação
  if (lowerEmail.includes('formacao') && lowerEmail.endsWith('@viverdeia.ai') ||
      lowerEmail.endsWith('@formacao.viverdeia.ai')) {
    return 'formacao';
  }
  
  // Por padrão, retornar 'member'
  return 'member';
}

/**
 * Verifica se o usuário é um superadmin
 * @param email E-mail do usuário
 * @returns Booleano indicando se é superadmin
 */
export function isSuperAdmin(email: string): boolean {
  if (!email) return false;
  
  const lowerEmail = email.toLowerCase();
  const superAdminEmails = [
    'admin@viverdeia.ai',
    'admin@teste.com'
  ];
  
  return superAdminEmails.includes(lowerEmail);
}
