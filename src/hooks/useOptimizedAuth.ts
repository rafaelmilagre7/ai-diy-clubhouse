import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth';

/**
 * Hook otimizado para verificações de autenticação comuns
 * Evita re-renders desnecessários usando memoização
 */
export const useOptimizedAuth = () => {
  const { user, profile, isAdmin, isFormacao, isLoading, hasCompletedOnboarding } = useAuth();

  // Memoizar computações caras
  const authState = useMemo(() => {
    return {
      isAuthenticated: !!user,
      hasProfile: !!profile,
      isReady: !isLoading && !!user,
      userRole: profile?.user_roles?.name || profile?.role_id || 'guest',
      canAccessAdminArea: isAdmin,
      canAccessFormacaoArea: isFormacao || isAdmin,
      needsOnboarding: !hasCompletedOnboarding && !!user && !isLoading,
      isLegacyUser: profile?.created_at ? new Date(profile.created_at) < new Date('2025-07-16') : false
    };
  }, [user, profile, isAdmin, isFormacao, isLoading, hasCompletedOnboarding]);

  // Funções auxiliares memoizadas
  const permissions = useMemo(() => ({
    canRead: (resourceUserId?: string) => {
      if (!authState.isAuthenticated) return false;
      if (authState.canAccessAdminArea) return true;
      return !resourceUserId || resourceUserId === user?.id;
    },
    
    canWrite: (resourceUserId?: string) => {
      if (!authState.isAuthenticated) return false;
      if (authState.canAccessAdminArea) return true;
      return resourceUserId === user?.id;
    },
    
    canDelete: (resourceUserId?: string) => {
      if (!authState.isAuthenticated) return false;
      if (authState.canAccessAdminArea) return true;
      return resourceUserId === user?.id;
    },

    hasRole: (requiredRole: string | string[]) => {
      if (!authState.isAuthenticated) return false;
      if (authState.canAccessAdminArea) return true;
      
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      return roles.includes(authState.userRole);
    }
  }), [authState, user?.id]);

  return {
    ...authState,
    permissions,
    user,
    profile
  };
};