
import { useAuth } from '@/contexts/auth';
import { useMemo } from 'react';

export interface PermissionsHookReturn {
  hasPermission: (permission: string) => boolean;
  loading: boolean;
  userPermissions: string[];
}

export const usePermissions = (): PermissionsHookReturn => {
  const { user, profile, isAdmin, isLoading } = useAuth();

  const userPermissions = useMemo(() => {
    const permissions: string[] = [];
    
    // Se é admin, tem todas as permissões
    if (isAdmin || profile?.role === 'admin') {
      permissions.push(
        'admin.all',
        'solutions.view',
        'solutions.create', 
        'solutions.edit',
        'solutions.delete',
        'users.view',
        'users.edit',
        'courses.view',
        'courses.create',
        'courses.edit'
      );
    }
    
    // Se é formação, tem permissões específicas
    if (profile?.role === 'formacao') {
      permissions.push(
        'solutions.view',
        'courses.view',
        'courses.create',
        'courses.edit'
      );
    }
    
    // Todos os usuários autenticados têm permissões básicas
    if (user) {
      permissions.push('solutions.view', 'profile.edit');
    }
    
    return permissions;
  }, [user, profile, isAdmin]);

  const hasPermission = (permission: string): boolean => {
    // Verificação rápida para admin
    if (isAdmin || profile?.role === 'admin') {
      return true;
    }
    
    // Verificação específica de permissão
    return userPermissions.includes(permission);
  };

  return {
    hasPermission,
    loading: isLoading,
    userPermissions
  };
};
