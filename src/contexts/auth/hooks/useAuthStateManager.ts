
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
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
  const { setLoading: setGlobalLoading, circuitBreakerActive } = useGlobalLoading();

  const setupAuthSession = useCallback(async () => {
    logger.info('[AUTH-STATE] Iniciando setup simplificado');
    
    try {
      setIsLoading(true);
      setGlobalLoading('auth', true);

      // CORREÇÃO: Verificação de circuit breaker simples
      if (circuitBreakerActive) {
        logger.warn('[AUTH-STATE] Circuit breaker ativo');
        setIsLoading(false);
        setGlobalLoading('auth', false);
        return;
      }

      // CORREÇÃO: Timeout único de 3 segundos
      const sessionPromise = validateUserSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Auth timeout")), 3000)
      );

      let sessionResult;
      try {
        sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as { session: Session | null; user: User | null };
      } catch (timeoutError) {
        logger.warn('[AUTH-STATE] Timeout - continuando sem erro');
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

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

      // Definir sessão e usuário
      setSession(session);
      setUser(user);

      // CORREÇÃO: Verificar cache primeiro
      const cachedNavigation = navigationCache.get(user.id);
      if (cachedNavigation?.userProfile) {
        logger.info('[AUTH-STATE] Perfil em cache');
        setProfile(cachedNavigation.userProfile);
        return;
      }

      // CORREÇÃO: Buscar perfil com timeout de 2 segundos
      try {
        const profilePromise = fetchUserProfileSecurely(user.id);
        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile timeout")), 2000)
        );

        let profile;
        try {
          profile = await Promise.race([profilePromise, profileTimeoutPromise]) as UserProfile | null;
        } catch (profileTimeoutError) {
          logger.warn('[AUTH-STATE] Timeout no perfil - continuando sem perfil');
          profile = null;
        }
        
        if (profile && profile.id === user.id) {
          setProfile(profile);
          
          // Atualizar cache
          const roleName = profile.user_roles?.name;
          if (roleName === 'admin') {
            navigationCache.set(user.id, profile, 'admin');
          } else if (roleName === 'formacao') {
            navigationCache.set(user.id, profile, 'formacao');
          }
          
          logger.info('[AUTH-STATE] ✅ Setup completo com perfil');
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
      
      // CORREÇÃO: Em caso de erro, limpar estado mas não falhar
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
      navigationCache.clear();
      
    } finally {
      setIsLoading(false);
      setGlobalLoading('auth', false);
      logger.info('[AUTH-STATE] ✅ Setup finalizado');
    }
  }, [setSession, setUser, setProfile, setIsLoading, setGlobalLoading, circuitBreakerActive]);

  return { setupAuthSession };
};
