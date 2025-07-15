
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
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
    logger.info('[AUTH-STATE] Setup otimizado iniciado');
    
    try {
      setIsLoading(true);
      setGlobalLoading('auth', true);

      // Circuit breaker check
      if (circuitBreakerActive) {
        logger.warn('[AUTH-STATE] Circuit breaker ativo - usando fallback');
        setIsLoading(false);
        setGlobalLoading('auth', false);
        return;
      }

      // Timeout reduzido para melhor performance
      const sessionPromise = validateUserSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Auth timeout")), 1000) // Reduzido para 1s
      );

      let sessionResult;
      try {
        sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as { session: Session | null; user: User | null };
      } catch (timeoutError) {
        logger.warn('[AUTH-STATE] Timeout - tentativa direta');
        try {
          sessionResult = await validateUserSession();
        } catch (finalError) {
          logger.error('[AUTH-STATE] Falha final:', finalError);
          setSession(null);
          setUser(null);
          setProfile(null);
          clearProfileCache();
          return;
        }
      }

      const { session, user } = sessionResult;
      
      if (!session || !user) {
        logger.info('[AUTH-STATE] Sem sessão - limpando estado');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        navigationCache.clear();
        return;
      }

      // Definir sessão e usuário imediatamente
      setSession(session);
      setUser(user);

      // Verificar cache de perfil primeiro
      const cachedNavigation = navigationCache.get(user.id);
      if (cachedNavigation?.userProfile) {
        logger.info('[AUTH-STATE] ✅ Usando perfil em cache');
        setProfile(cachedNavigation.userProfile);
        return;
      }

      // Buscar perfil com fallback otimizado
      try {
        // Usar função de busca segura do backend
        const { data: profileData, error: profileError } = await supabase
          .rpc('get_user_profile_safe', { target_user_id: user.id });

        if (profileError) {
          logger.error('[AUTH-STATE] Erro na função segura:', profileError);
          throw profileError;
        }

        if (profileData && profileData.length > 0) {
          const profile = profileData[0] as UserProfile;
          
          // Validação de segurança
          if (profile.id !== user.id) {
            logger.error('[AUTH-STATE] VIOLAÇÃO DE SEGURANÇA: ID incorreto');
            throw new Error('Violação de segurança detectada');
          }

          setProfile(profile);
          
          // Cache baseado no role
          const roleName = profile.user_roles?.name;
          if (roleName === 'admin') {
            navigationCache.set(user.id, profile, 'admin');
          } else if (roleName === 'formacao') {
            navigationCache.set(user.id, profile, 'formacao');
          }
          
          // Log reduzido para evitar spam no console
          if (roleName) {
            logger.info('[AUTH-STATE] ✅ Perfil carregado');
          }
        } else {
          logger.warn('[AUTH-STATE] Perfil não encontrado');
          setProfile(null);
        }
        
      } catch (profileError) {
        logger.error('[AUTH-STATE] Erro ao buscar perfil:', profileError);
        setProfile(null);
        
        if (profileError instanceof Error && profileError.message.includes('segurança')) {
          logger.warn('[AUTH-STATE] Logout por violação de segurança');
          setSession(null);
          setUser(null);
          clearProfileCache();
          navigationCache.clear();
        }
      }

    } catch (error) {
      logger.error('[AUTH-STATE] Erro crítico:', error);
      
      if (!(error instanceof Error && error.message.includes('timeout'))) {
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        navigationCache.clear();
      }
      
    } finally {
      setIsLoading(false);
      setGlobalLoading('auth', false);
      logger.info('[AUTH-STATE] ✅ Setup finalizado');
    }
  }, [setSession, setUser, setProfile, setIsLoading, setGlobalLoading, circuitBreakerActive]);

  return { setupAuthSession };
};
