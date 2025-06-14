
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { navigationCache } from '@/utils/navigationCache';
import { secureSessionCache } from '@/utils/secureSessionCache';

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
    logger.info('[AUTH-STATE] Iniciando setup com timeouts otimizados para 10s');
    
    try {
      setIsLoading(true);
      setGlobalLoading('auth', true);

      // CORREÇÃO: Verificação de circuit breaker mais rápida
      if (circuitBreakerActive) {
        logger.warn('[AUTH-STATE] Circuit breaker ativo - setup simplificado');
        setIsLoading(false);
        setGlobalLoading('auth', false);
        return;
      }

      // CORREÇÃO: Verificar cache seguro primeiro
      const cachedSession = secureSessionCache.get('current_session');
      if (cachedSession && cachedSession.isValid) {
        logger.info('[AUTH-STATE] Sessão segura em cache encontrada');
        setSession(cachedSession.session);
        setUser(cachedSession.user);
        
        // Verificar cache de navegação
        const cachedNavigation = navigationCache.get(cachedSession.user.id);
        if (cachedNavigation?.userProfile) {
          setProfile(cachedNavigation.userProfile);
          logger.info('[AUTH-STATE] ✅ Setup completo via cache seguro');
          return;
        }
      }

      // FASE 2: Timeout aumentado para 10 segundos (mais estável)
      const sessionPromise = validateUserSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Auth session timeout")), 10000)
      );

      let sessionResult;
      try {
        sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as { session: Session | null; user: User | null };
      } catch (timeoutError) {
        logger.warn('[AUTH-STATE] Timeout na validação - tentativa final sem timeout');
        try {
          sessionResult = await validateUserSession();
        } catch (finalError) {
          logger.error('[AUTH-STATE] Falha final na validação:', finalError);
          setSession(null);
          setUser(null);
          setProfile(null);
          clearProfileCache();
          secureSessionCache.clear();
          return;
        }
      }

      const { session, user } = sessionResult;
      
      if (!session || !user) {
        logger.info('[AUTH-STATE] Nenhuma sessão válida - estado limpo');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        navigationCache.clear();
        secureSessionCache.clear();
        return;
      }

      // CORREÇÃO: Armazenar sessão no cache seguro
      secureSessionCache.set('current_session', {
        session,
        user,
        timestamp: Date.now(),
        isValid: true
      });

      // Definir sessão e usuário
      setSession(session);
      setUser(user);

      // CORREÇÃO: Verificar cache antes de buscar perfil
      const cachedNavigation = navigationCache.get(user.id);
      if (cachedNavigation?.userProfile) {
        logger.info('[AUTH-STATE] Perfil em cache - usando dados salvos');
        setProfile(cachedNavigation.userProfile);
        
        logger.info('[AUTH-STATE] ✅ Setup completo via cache', {
          userId: user.id.substring(0, 8) + '***',
          hasProfile: true,
          cached: true
        });
        
        return;
      }

      // FASE 2: Buscar perfil com timeout aumentado para 8 segundos
      try {
        const profilePromise = fetchUserProfileSecurely(user.id);
        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile timeout")), 8000)
        );

        let profile;
        try {
          profile = await Promise.race([profilePromise, profileTimeoutPromise]) as UserProfile | null;
        } catch (profileTimeoutError) {
          logger.warn('[AUTH-STATE] Timeout no perfil - continuando sem perfil');
          profile = null;
        }
        
        if (profile) {
          if (profile.id !== user.id) {
            logger.error('[AUTH-STATE] VIOLAÇÃO DE SEGURANÇA: ID do perfil incorreto');
            throw new Error('Violação de segurança detectada');
          }

          setProfile(profile);
          
          // CORREÇÃO: Atualizar cache de navegação baseado APENAS no role do banco
          const roleName = profile.user_roles?.name;
          if (roleName === 'admin') {
            navigationCache.set(user.id, profile, 'admin');
          } else if (roleName === 'formacao') {
            navigationCache.set(user.id, profile, 'formacao');
          }
          
          logger.info('[AUTH-STATE] ✅ Setup completo', {
            userId: user.id.substring(0, 8) + '***',
            hasProfile: true,
            roleName: profile.user_roles?.name || 'sem role',
            cached: false
          });
        } else {
          logger.warn('[AUTH-STATE] Sem perfil disponível');
          setProfile(null);
        }
        
      } catch (profileError) {
        logger.error('[AUTH-STATE] Erro no perfil:', profileError);
        setProfile(null);
        
        if (profileError instanceof Error && profileError.message.includes('segurança')) {
          logger.warn('[AUTH-STATE] Logout por violação de segurança');
          setSession(null);
          setUser(null);
          clearProfileCache();
          navigationCache.clear();
          secureSessionCache.clear();
        }
      }

    } catch (error) {
      logger.error('[AUTH-STATE] Erro crítico:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        logger.warn('[AUTH-STATE] Erro de timeout - mantendo sessão básica');
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        navigationCache.clear();
        secureSessionCache.clear();
      }
      
    } finally {
      setIsLoading(false);
      setGlobalLoading('auth', false);
      logger.info('[AUTH-STATE] ✅ Setup finalizado (timeouts otimizados para 10s)');
    }
  }, [setSession, setUser, setProfile, setIsLoading, setGlobalLoading, circuitBreakerActive]);

  return { setupAuthSession };
};
