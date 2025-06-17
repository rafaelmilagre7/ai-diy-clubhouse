
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { UserProfile } from '@/lib/supabase';

interface UseAuthStateManagerProps {
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStateManager = ({
  setSession,
  setUser,
  setProfile,
  setIsLoading,
}: UseAuthStateManagerProps) => {

  const setupAuthSession = useCallback(async () => {
    console.log('[AUTH-STATE] Iniciando setup');
    
    try {
      setIsLoading(true);

      const sessionResult = await validateUserSession();
      const { session, user } = sessionResult;
      
      if (!session || !user) {
        console.log('[AUTH-STATE] Nenhuma sessão válida');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        return;
      }

      setSession(session);
      setUser(user);

      // Buscar perfil
      try {
        const profile = await fetchUserProfileSecurely(user.id);
        
        if (profile && profile.id === user.id) {
          setProfile(profile);
          console.log('[AUTH-STATE] Setup completo');
        } else {
          console.log('[AUTH-STATE] Sem perfil válido');
          setProfile(null);
        }
        
      } catch (profileError) {
        console.error('[AUTH-STATE] Erro no perfil:', profileError);
        setProfile(null);
      }

    } catch (error) {
      console.error('[AUTH-STATE] Erro crítico:', error);
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
      
    } finally {
      setIsLoading(false);
      console.log('[AUTH-STATE] Setup finalizado');
    }
  }, [setSession, setUser, setProfile, setIsLoading]);

  return { setupAuthSession };
};
