
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
    session: auth.session,
    isAuthenticated: !!auth.user,
    isAdmin: auth.isAdmin,
    isFormacao: auth.isFormacao,
    isMember: auth.profile?.role === 'member',
    isLoading: auth.isLoading,
    hasProfile: !!auth.profile,
    authError: auth.authError
  }), [
    auth.user, 
    auth.profile, 
    auth.session,
    auth.isAdmin, 
    auth.isFormacao, 
    auth.isLoading, 
    auth.authError
  ]);

  // Memoizar métodos para evitar re-criação
  const authMethods = useMemo(() => ({
    signOut: auth.signOut,
    signIn: auth.signIn,
    signInAsMember: auth.signInAsMember,
    signInAsAdmin: auth.signInAsAdmin,
    setProfile: auth.setProfile
  }), [
    auth.signOut, 
    auth.signIn, 
    auth.signInAsMember, 
    auth.signInAsAdmin, 
    auth.setProfile
  ]);

  return {
    ...authState,
    ...authMethods
  };
};
