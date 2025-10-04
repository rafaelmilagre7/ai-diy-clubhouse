import { UserProfile, getUserRoleName } from '@/lib/supabase/types';

/**
 * Lista de papéis considerados master na hierarquia
 * Usuários com esses papéis têm acesso à gestão de equipe
 */
export const MASTER_ROLES = ['master_user', 'membro_club'] as const;

/**
 * Verifica se o usuário é master (membro_club ou master_user)
 * ✅ Fonte única de verdade para hierarquia master
 */
export function isUserMaster(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
  const roleName = getUserRoleName(profile);
  return (
    profile.is_master_user === true || 
    roleName === 'master_user' ||
    roleName === 'membro_club'
  );
}

/**
 * Verifica se um papel específico é master
 */
export function isMasterRole(roleName: string): boolean {
  return MASTER_ROLES.includes(roleName as typeof MASTER_ROLES[number]);
}
