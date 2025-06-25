
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';

/**
 * Hook otimizado para verificações de auth com debounce
 */
export const useAuthOptimized = () => {
  const auth = useAuth();
  const lastStateRef = useRef<string>('');
  
  // Debounce para logs excessivos
  useEffect(() => {
    const currentState = `${!!auth.user}-${!!auth.profile}-${auth.isLoading}`;
    
    if (lastStateRef.current !== currentState) {
      console.log('[AUTH-OPTIMIZED] Estado:', {
        hasUser: !!auth.user,
        hasProfile: !!auth.profile,
        isLoading: auth.isLoading,
        userRole: auth.profile?.user_roles?.name
      });
      lastStateRef.current = currentState;
    }
  }, [auth.user, auth.profile, auth.isLoading]);

  return auth;
};
