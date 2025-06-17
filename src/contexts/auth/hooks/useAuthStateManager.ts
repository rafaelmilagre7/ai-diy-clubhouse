
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { navigationCache } from '@/utils/navigationCache';

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
    logger.info('[AUTH-STATE] Iniciando setup');
    
    try {
      setIsLoading(true);

      const sessionResult = await validateUserSession();
      const { session, user } = sessionResult;
      
      if (!session || !user) {
        logger.info('[AUTH-STATE] Nenhuma sessão válida');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        navigationCache.clear();
        return;
      }

      setSession(session);
      setUser(user);

      // Verificar cache primeiro
      const cachedNavigation = navigationCache.get(user.id);
      if (cachedNavigation?.userProfile) {
        logger.info('[AUTH-STATE] Perfil em cache');
        setProfile(cachedNavigation.userProfile);
        return;
      }

      // Buscar perfil
      try {
        const profile = await fetchUserProfileSecurely(user.id);
        
        if (profile && profile.id === user.id) {
          setProfile(profile);
          
          const roleName = profile.user_roles?.name;
          if (roleName === 'admin') {
            navigationCache.set(user.id, profile, 'admin');
          } else if (roleName === 'formacao') {
            navigationCache.set(user.id, profile, 'formacao');
          }
          
          logger.info('[AUTH-STATE] ✅ Setup completo');
        } else {
          logger.warn('[AUTH-STATE] Sem perfil válido');
          setProfile(null);
        }
        
      } catch (profileError) {
        logger.error('[AUTH-STATE] Erro no perfil:', profileError);
        setProfile(null);
      }

    } catch (error) {
      logger.error('[AUTH-STATE] Erro crítico:', error);
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
      navigationCache.clear();
      
    } finally {
      setIsLoading(false);
      logger.info('[AUTH-STATE] ✅ Setup finalizado');
    }
  }, [setSession, setUser, setProfile, setIsLoading]);

  return { setupAuthSession };
};
