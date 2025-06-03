
import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth';

/**
 * Hook otimizado para contexto de autenticação
 * Memoiza valores computados para evitar re-renders desnecessários
 */
export const useOptimizedAuth = () => {
  const auth = useAuth();
  
  // Memoizar valores computados para evitar recálculos
  const authState = useMemo(() => ({
    user: auth.user,
    profile: auth.profile,
    isAuthenticated: !!auth.user,
    isAdmin: auth.profile?.role === 'admin',
    isFormacao: auth.profile?.role === 'formacao',
    isMember: auth.profile?.role === 'member',
    isLoading: auth.isLoading,
    hasProfile: !!auth.profile
  }), [auth.user, auth.profile, auth.isLoading]);

  // Memoizar métodos para evitar re-criação
  const authMethods = useMemo(() => ({
    signOut: auth.signOut,
    setProfile: auth.setProfile
  }), [auth.signOut, auth.setProfile]);

  return {
    ...authState,
    ...authMethods
  };
};
