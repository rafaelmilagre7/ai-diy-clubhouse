
import { useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache, debounceManager } from '@/hooks/auth/utils/authSessionUtils';
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
  const isSetupRunning = useRef(false);
  const lastUserId = useRef<string | null>(null);

  const setupAuthSession = useCallback(async () => {
    // Evitar execuções múltiplas simultâneas
    if (isSetupRunning.current) {
      logger.debug('[AUTH-STATE] Setup já em execução, ignorando chamada duplicada');
      return;
    }

    // Usar debounce para evitar chamadas muito frequentes
    return debounceManager.execute('setup-auth-session', async () => {
      isSetupRunning.current = true;
      logger.info('[AUTH-STATE] Iniciando setup otimizado - timeout de 5s');
      
      try {
        setIsLoading(true);
        setGlobalLoading('auth', true);

        // OTIMIZAÇÃO: Verificação de circuit breaker mais eficiente
        if (circuitBreakerActive) {
          logger.warn('[AUTH-STATE] Circuit breaker ativo - setup simplificado');
          return;
        }

        // CORREÇÃO: Timeout aumentado para 5 segundos (mais realista)
        const sessionPromise = validateUserSession(2); // 2 retries
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Auth session timeout")), 5000)
        );

        let sessionResult;
        try {
          sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as { session: Session | null; user: User | null };
        } catch (timeoutError) {
          logger.warn('[AUTH-STATE] Timeout na validação - tentativa final');
          try {
            sessionResult = await validateUserSession(0); // Uma tentativa final
          } catch (finalError) {
            logger.error('[AUTH-STATE] Falha final na validação:', finalError);
            setSession(null);
            setUser(null);
            setProfile(null);
            clearProfileCache();
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
          return;
        }

        // Detectar mudança de usuário
        if (lastUserId.current && lastUserId.current !== user.id) {
          logger.info('[AUTH-STATE] Mudança de usuário detectada - limpando cache');
          clearProfileCache();
          navigationCache.clear();
        }
        lastUserId.current = user.id;

        // Definir sessão e usuário
        setSession(session);
        setUser(user);

        // OTIMIZAÇÃO: Verificar cache de navegação primeiro
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

        // OTIMIZAÇÃO: Buscar perfil com timeout de 3 segundos
        try {
          const profilePromise = fetchUserProfileSecurely(user.id);
          const profileTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Profile timeout")), 3000)
          );

          let profile;
          try {
            profile = await Promise.race([profilePromise, profileTimeoutPromise]) as UserProfile | null;
          } catch (profileTimeoutError) {
            logger.warn('[AUTH-STATE] Timeout no perfil - continuando sem perfil');
            profile = null;
          }
          
          if (profile) {
            // SEGURANÇA: Verificar se ID do perfil corresponde ao usuário
            if (profile.id !== user.id) {
              logger.error('[AUTH-STATE] VIOLAÇÃO DE SEGURANÇA: ID do perfil incorreto');
              throw new Error('Violação de segurança detectada');
            }

            setProfile(profile);
            
            // OTIMIZAÇÃO: Atualizar cache de navegação baseado no role
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
          }
        }

      } catch (error) {
        logger.error('[AUTH-STATE] Erro crítico:', error);
        
        if (error instanceof Error && error.message.includes('timeout')) {
          logger.warn('[AUTH-STATE] Erro de timeout - mantendo sessão básica se possível');
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          clearProfileCache();
          navigationCache.clear();
        }
        
      } finally {
        setIsLoading(false);
        setGlobalLoading('auth', false);
        isSetupRunning.current = false;
        logger.info('[AUTH-STATE] ✅ Setup finalizado (otimizado)');
      }
    }, 200); // 200ms debounce
  }, [setSession, setUser, setProfile, setIsLoading, setGlobalLoading, circuitBreakerActive]);

  return { setupAuthSession };
};
