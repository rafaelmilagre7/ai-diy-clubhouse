
import { UserProfile } from "@/lib/supabase/types";
import { validateRole, determineRoleFromEmail, validateUserRole } from "@/contexts/auth/utils/profileUtils/roleValidation";
import { Session } from "@supabase/supabase-js";

/**
 * Processa o perfil do usuário a partir da sessão
 */
export function processUserProfile(session: Session | null): UserProfile | null {
  if (!session || !session.user) return null;

  const { user } = session;
  
  // Extrair dados do usuário
  const email = user.email || '';
  const name = user.user_metadata?.name || user.user_metadata?.full_name || email.split('@')[0] || 'Usuário';
  const avatar_url = user.user_metadata?.avatar_url || null;
  
  // Determinar role com base em regras
  const role = validateRole(
    user.user_metadata?.role || 
    determineRoleFromEmail(email)
  );
  
  // Construir o perfil
  const profile: UserProfile = {
    id: user.id,
    email,
    name,
    avatar_url,
    role,
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString()
  };
  
  return profile;
}

/**
 * Obtém o role do usuário
 */
export function getUserRole(profile: UserProfile | null): string {
  return validateUserRole(profile);
}

/**
 * Valida se o usuário tem autorização para determinado recurso
 */
export function validateUserAuthorization(
  profile: UserProfile | null, 
  requiredRole: string | string[]
): boolean {
  if (!profile) return false;
  
  const userRole = validateUserRole(profile);
  
  // Se o usuário é admin, tem acesso a tudo
  if (userRole === 'admin') return true;
  
  // Converter para array se for string
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Verificar se o role do usuário está na lista de roles permitidos
  return roles.includes(userRole) || roles.includes('*');
}
