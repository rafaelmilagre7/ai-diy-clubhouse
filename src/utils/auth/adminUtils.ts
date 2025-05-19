
/**
 * Utilitários para verificação de admin
 */

import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase/types';

/**
 * Verifica se um usuário é admin baseado em seu perfil e/ou email
 * 
 * @param user Objeto do usuário autenticado
 * @param profile Objeto do perfil do usuário (opcional)
 * @returns boolean indicando se o usuário é admin
 */
export const isUserAdmin = (user: User | null, profile: UserProfile | null): boolean => {
  if (!user) return false;
  
  // Verificação pelo perfil (método principal)
  if (profile?.role === 'admin') {
    return true;
  }
  
  // Verificação pelo email (método secundário)
  if (user.email) {
    return user.email.includes('@viverdeia.ai') || 
           user.email === 'admin@teste.com' || 
           user.email === 'admin@viverdeia.ai';
  }
  
  return false;
};

/**
 * Obtém o nome de exibição do usuário
 * 
 * @param user Objeto do usuário autenticado
 * @param profile Objeto do perfil do usuário (opcional)
 * @returns Nome de exibição do usuário
 */
export const getUserDisplayName = (user: User | null, profile: UserProfile | null): string => {
  // Verificar primeiro no perfil
  if (profile?.name) {
    return profile.name.split(' ')[0];
  }
  
  // Verificar nos metadados do usuário
  if (user?.user_metadata?.name) {
    return String(user.user_metadata.name).split(' ')[0];
  }
  
  if (user?.user_metadata?.full_name) {
    return String(user.user_metadata.full_name).split(' ')[0];
  }
  
  // Usar email como fallback
  if (user?.email) {
    return user.email.split('@')[0];
  }
  
  // Último recurso
  return "Usuário";
};
