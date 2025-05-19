
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  validateRole as validateUserRole,
  determineRoleFromEmail 
} from '@/contexts/auth/utils/profileUtils/roleValidation';

/**
 * Processa e retorna o perfil de usuário baseado no ID do usuário
 */
export async function processUserProfile(
  userId: string,
  email?: string | null,
  name?: string | null
) {
  try {
    // Buscar o perfil do usuário
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, user_roles(*)')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }

    if (!profile) {
      console.log("Perfil não encontrado para o usuário:", userId);
      return null;
    }

    // Validar e potencialmente corrigir o papel do usuário baseado no email
    if (email) {
      const correctRole = determineRoleFromEmail(email);
      if (profile.role !== correctRole) {
        console.log(`Atualizando papel do usuário de ${profile.role} para ${correctRole}`);
        await supabase
          .from('profiles')
          .update({ role: correctRole })
          .eq('id', userId);
        profile.role = correctRole;
      }
    }

    return profile;
  } catch (error) {
    console.error("Erro ao processar perfil de usuário:", error);
    return null;
  }
}

/**
 * Retorna o papel do usuário da sessão ou determina-o a partir do email
 */
export const getUserRole = (session: Session | null): string => {
  if (session?.user?.user_metadata?.role) {
    return session.user.user_metadata.role as string;
  }

  // Determinar papel a partir do email se não estiver nos metadados do usuário
  return determineRoleFromEmail(session?.user?.email || '');
};

/**
 * Valida se o papel do usuário corresponde ao papel requerido
 */
export const validateUserAuthorization = (session: Session | null, requiredRole: string | string[]): boolean => {
  const userRole = getUserRole(session);
  return validateUserRole(userRole, requiredRole);
};
