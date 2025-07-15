
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
    logger.info('[AUTH-STATE] Iniciando setup - timeout otimizado de 2s');
    
    try {
      setIsLoading(true);
      setGlobalLoading('auth', true);

      // OTIMIZAÇÃO 1: Verificação de circuit breaker mais rápida
      if (circuitBreakerActive) {
        logger.warn('[AUTH-STATE] Circuit breaker ativo - setup simplificado');
        setIsLoading(false);
        setGlobalLoading('auth', false);
        return;
      }

      // OTIMIZAÇÃO 2: Timeout ainda mais reduzido para não bloquear
      const sessionPromise = validateUserSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Auth session timeout")), 1500) // Reduzido para 1.5s
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

      // Definir sessão e usuário
      setSession(session);
      setUser(user);

      // CORREÇÃO DE SEGURANÇA: Removida verificação por email hardcodado
      // Agora usa APENAS o sistema de roles do banco de dados

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

      // CORREÇÃO CRÍTICA: Buscar perfil com timeout mais generoso e fallback robusto
      try {
        const profilePromise = fetchUserProfileSecurely(user.id);
        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile timeout")), 6000) // Aumentado para 6s
        );

        let profile;
        try {
          profile = await Promise.race([profilePromise, profileTimeoutPromise]) as UserProfile | null;
        } catch (profileTimeoutError) {
          logger.warn('[AUTH-STATE] Timeout no perfil - tentando fallback direto');
          
          // FALLBACK DIRETO: Buscar direto sem função helper
          try {
            const { data: directProfile, error: directError } = await supabase
              .from('profiles')
              .select(`
                *,
                user_roles!inner (
                  id,
                  name,
                  description,
                  permissions
                )
              `)
              .eq('id', user.id)
              .maybeSingle(); // Usar maybeSingle para evitar erros se não existir
              
            if (directError) {
              throw directError;
            }
              
            profile = directProfile as UserProfile | null;
            logger.info('[AUTH-STATE] ✅ Perfil carregado via fallback direto');
          } catch (fallbackError) {
            logger.error('[AUTH-STATE] Fallback direto falhou:', fallbackError);
            profile = null;
          }
        }
        
        if (profile) {
          if (profile.id !== user.id) {
            logger.error('[AUTH-STATE] VIOLAÇÃO DE SEGURANÇA: ID do perfil incorreto');
            throw new Error('Violação de segurança detectada');
          }

          setProfile(profile);
          
          // Cache de navegação baseado no role do banco
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
        logger.warn('[AUTH-STATE] Erro de timeout - mantendo sessão básica');
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
      logger.info('[AUTH-STATE] ✅ Setup finalizado (otimizado)');
    }
  }, [setSession, setUser, setProfile, setIsLoading, setGlobalLoading, circuitBreakerActive]);

  return { setupAuthSession };
};
