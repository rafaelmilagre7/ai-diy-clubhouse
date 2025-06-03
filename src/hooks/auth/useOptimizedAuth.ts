
import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth';

/**
 * Hook otimizado para autenticação com memoização
 * Evita re-computações desnecessárias
 */
export const useOptimizedAuth = () => {
  const { user, profile, isLoading, signOut } = useAuth();

  // Memoizar computações baseadas no role
  const authData = useMemo(() => {
    const role = profile?.role || 'member';
    
    return {
      isAuthenticated: !!user,
      isAdmin: role === 'admin',
      isFormacao: role === 'formacao',
      isMember: role === 'member',
      role,
      userId: user?.id,
      userEmail: user?.email,
      userName: profile?.name,
      userAvatar: profile?.avatar_url
    };
  }, [user, profile]);

  return {
    ...authData,
    user,
    profile,
    isLoading,
    signOut
  };
};
