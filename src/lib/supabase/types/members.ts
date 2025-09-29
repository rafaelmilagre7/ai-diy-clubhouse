
import { Database } from './database.types';

// =============================================================================
// TIPOS RELACIONADOS A MEMBROS E PERFIS
// =============================================================================

export type UserProfile = Database['public']['Tables'] extends { profiles: any } 
  ? Database['public']['Tables']['profiles']['Row']
  : {
      id: string;
      email: string;
      name: string | null;
      avatar_url?: string | null;
      company_name?: string | null;
      industry?: string | null;
      role_id?: string | null;
      role?: string | null;
      organization_id?: string | null;
      is_master_user?: boolean;
      onboarding_completed?: boolean;
      status?: string;
      created_at: string;
      updated_at: string;
      user_roles?: {
        id: string;
        name: string;
        description?: string | null;
        permissions?: any;
      } | null;
      organization?: {
        id: string;
        name: string;
        master_user_id?: string;
      } | null;
    };

export type MemberConnection = Database['public']['Tables'] extends { member_connections: any } 
  ? Database['public']['Tables']['member_connections']['Row']
  : {
      id: string;
      requester_id: string;
      recipient_id: string;
      status: string;
      created_at: string;
      updated_at: string;
    };

export function getUserRoleName(profile: UserProfile | null): string {
  if (!profile) return 'guest';
  
  // Prioridade 1: Se tem user_roles relacionado, usar o name de lá
  if (profile.user_roles?.name) {
    return profile.user_roles.name;
  }
  
  // Prioridade 2: Se tem role_id mas não user_roles, tentar mapear
  if (profile.role_id && !profile.user_roles) {
    // Aqui poderia fazer uma consulta adicional, mas por simplicidade:
    return 'member'; // valor padrão seguro
  }
  
  // Prioridade 3: Fallback para o campo role legacy (se existir)
  if (profile.role) {
    return profile.role;
  }
  
  // Prioridade 4: Fallback final
  return 'member';
}

export function isSuperAdmin(profile: UserProfile | null): boolean {
  const roleName = getUserRoleName(profile);
  return roleName === 'admin';
}

export function isMasterUser(profile: UserProfile | null): boolean {
  return profile?.is_master_user === true;
}

