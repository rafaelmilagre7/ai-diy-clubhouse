import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role_id?: string;
  user_roles?: {
    name: string;
    permissions?: any;
  };
}

// Cache de permissões com TTL de 5 minutos
const PERMISSIONS_CACHE_TTL = 5 * 60 * 1000;

export interface UserPermissions {
  isAdmin: boolean;
  isFormacao: boolean;
  isMember: boolean;
  canAccessAdmin: boolean;
  canAccessFormacao: boolean;
  canManageUsers: boolean;
  canManageContent: boolean;
  canViewAnalytics: boolean;
  roleName: string | null;
}

// Função pura para calcular permissões
function calculatePermissions(profile: UserProfile | null): UserPermissions {
  const roleName = profile?.user_roles?.name || null;
  
  const permissions: UserPermissions = {
    isAdmin: roleName === 'admin',
    isFormacao: roleName === 'formacao',
    isMember: ['member', 'membro', 'membro_club'].includes(roleName || ''),
    canAccessAdmin: roleName === 'admin',
    canAccessFormacao: ['admin', 'formacao'].includes(roleName || ''),
    canManageUsers: roleName === 'admin',
    canManageContent: ['admin', 'formacao'].includes(roleName || ''),
    canViewAnalytics: ['admin', 'formacao'].includes(roleName || ''),
    roleName,
  };

  return permissions;
}

export function usePermissions() {
  const { profile, user } = useAuth();

  return useQuery({
    queryKey: ['user-permissions', user?.id, profile?.role_id],
    queryFn: () => calculatePermissions(profile),
    enabled: !!user,
    staleTime: PERMISSIONS_CACHE_TTL,
    gcTime: PERMISSIONS_CACHE_TTL * 2,
    // Retorna valor padrão se não há usuário
    placeholderData: {
      isAdmin: false,
      isFormacao: false,
      isMember: false,
      canAccessAdmin: false,
      canAccessFormacao: false,
      canManageUsers: false,
      canManageContent: false,
      canViewAnalytics: false,
      roleName: null,
    },
  });
}

// Hook simplificado para verificações específicas
export function useIsAdmin() {
  const { data: permissions } = usePermissions();
  return permissions?.isAdmin || false;
}

export function useCanAccess(feature: 'admin' | 'formacao' | 'member') {
  const { data: permissions } = usePermissions();
  
  switch (feature) {
    case 'admin':
      return permissions?.canAccessAdmin || false;
    case 'formacao':
      return permissions?.canAccessFormacao || false;
    case 'member':
      return permissions?.isMember || false;
    default:
      return false;
  }
}

// Função utilitária para usar em componentes
export function getUserRoleName(profile: UserProfile | null): string | null {
  return profile?.user_roles?.name || null;
}

export function isUserAdmin(profile: UserProfile | null): boolean {
  return getUserRoleName(profile) === 'admin';
}