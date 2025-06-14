
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { navigationCache } from '@/utils/navigationCache';
import { secureSessionCache } from '@/utils/secureSessionCache';
import { rateLimit } from '@/utils/intelligentRateLimit'; // CORREÇÃO: importação correta

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

  // OTIMIZAÇÃO: Rate limiting para operações de autenticação
  const authRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // máximo 10 tentativas por minuto
    message: 'Muitas tentativas de autenticação',
    statusCode: 429
  });

  const setupAuthSession = useCallback(async () => {
    logger.info('[AUTH-STATE] Iniciando setup com segurança aprimorada');
    
    try {
      setIsLoading(true);
      setGlobalLoading('auth', true);

      // SEGURANÇA: Rate limiting para prevenir ataques
      const rateLimitResult = authRateLimit('auth_session_setup');
      if (!rateLimitResult.success) {
        logger.warn('[AUTH-STATE] Rate limit atingido para setup de sessão');
        setIsLoading(false);
        setGlobalLoading('auth', false);
        return;
      }

      // OTIMIZAÇÃO 1: Verificação de circuit breaker mais rápida
      if (circuitBreakerActive) {
        logger.warn('[AUTH-STATE] Circuit breaker ativo - setup simplificado');
        setIsLoading(false);
        setGlobalLoading('auth', false);
        return;
      }

      // SEGURANÇA: Verificar cache seguro primeiro
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

      // OTIMIZAÇÃO 2: Timeout reduzido para 2 segundos
      const sessionPromise = validateUserSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Auth session timeout")), 2000)
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

      // SEGURANÇA: Armazenar sessão no cache seguro
      secureSessionCache.set('current_session', {
        session,
        user,
        timestamp: Date.now(),
        isValid: true
      });

      // Definir sessão e usuário
      setSession(session);
      setUser(user);

      // OTIMIZAÇÃO 4: Verificar cache antes de buscar perfil
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

      // OTIMIZAÇÃO 5: Buscar perfil com timeout reduzido para 1 segundo
      try {
        const profilePromise = fetchUserProfileSecurely(user.id);
        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile timeout")), 1000)
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
          
          // OTIMIZAÇÃO 6: Atualizar cache de navegação baseado APENAS no role do banco
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
      logger.info('[AUTH-STATE] ✅ Setup finalizado (segurança aprimorada)');
    }
  }, [setSession, setUser, setProfile, setIsLoading, setGlobalLoading, circuitBreakerActive, authRateLimit]);

  return { setupAuthSession };
};
