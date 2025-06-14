
import { useState, useEffect, useRef, useCallback } from "react";
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
  const [retryCount, setRetryCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const maxRetries = 3;
  const retryDelay = 1000; // 1 segundo entre tentativas

  // OTIMIZAÇÃO: Cache de sessão em memória
  const sessionCache = useRef<{
    session: Session | null;
    timestamp: number;
    ttl: number;
  }>({ session: null, timestamp: 0, ttl: 30000 }); // 30 segundos de cache

  // OTIMIZAÇÃO: Exponential backoff para retry
  const getRetryDelay = useCallback((attempt: number) => {
    return Math.min(retryDelay * Math.pow(2, attempt), 5000); // Máximo 5 segundos
  }, []);

  // OTIMIZAÇÃO: Verificar cache de sessão
  const getCachedSession = useCallback(() => {
    const now = Date.now();
    const { session, timestamp, ttl } = sessionCache.current;
    
    if (session && (now - timestamp) < ttl) {
      logger.info('[AUTH-STATE] Usando sessão em cache');
      return session;
    }
    
    return null;
  }, []);

  // OTIMIZAÇÃO: Atualizar cache de sessão
  const setCachedSession = useCallback((session: Session | null) => {
    sessionCache.current = {
      session,
      timestamp: Date.now(),
      ttl: 30000
    };
  }, []);

  const setupAuthSession = useCallback(async () => {
    const now = Date.now();
    
    // OTIMIZAÇÃO: Rate limiting para evitar chamadas excessivas
    if (now - lastAttemptTime < 500) {
      logger.info('[AUTH-STATE] Rate limiting - aguardando...');
      return;
    }
    
    setLastAttemptTime(now);
    logger.info('[AUTH-STATE] Iniciando setup otimizado');
    
    try {
      setIsLoading(true);
      setGlobalLoading('auth', true);

      // OTIMIZAÇÃO: Verificar circuit breaker mais eficiente
      if (circuitBreakerActive) {
        logger.warn('[AUTH-STATE] Circuit breaker ativo - setup simplificado');
        setIsLoading(false);
        setGlobalLoading('auth', false);
        return;
      }

      // OTIMIZAÇÃO: Tentar cache primeiro
      const cachedSession = getCachedSession();
      if (cachedSession) {
        logger.info('[AUTH-STATE] Usando sessão em cache - setup ultra-rápido');
        setSession(cachedSession);
        setUser(cachedSession.user);
        setIsLoading(false);
        setGlobalLoading('auth', false);
        return;
      }

      // OTIMIZAÇÃO: Timeout adaptativo baseado no número de tentativas
      const adaptiveTimeout = 1000 + (retryCount * 500); // Aumenta com retry
      const sessionPromise = validateUserSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Auth session timeout")), adaptiveTimeout)
      );

      let sessionResult;
      try {
        sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as { session: Session | null; user: User | null };
      } catch (timeoutError) {
        if (retryCount < maxRetries) {
          const delay = getRetryDelay(retryCount);
          logger.warn(`[AUTH-STATE] Timeout - retry ${retryCount + 1}/${maxRetries} em ${delay}ms`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
          return;
        }
        
        logger.error('[AUTH-STATE] Timeout máximo atingido');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        return;
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

      // OTIMIZAÇÃO: Atualizar cache de sessão
      setCachedSession(session);

      // Definir sessão e usuário
      setSession(session);
      setUser(user);

      // OTIMIZAÇÃO: Verificar cache de navegação antes de buscar perfil
      const cachedNavigation = navigationCache.get(user.id);
      if (cachedNavigation?.userProfile) {
        logger.info('[AUTH-STATE] Perfil em cache - usando dados salvos');
        setProfile(cachedNavigation.userProfile);
        
        logger.info('[AUTH-STATE] ✅ Setup completo via cache', {
          userId: user.id.substring(0, 8) + '***',
          hasProfile: true,
          cached: true
        });
        
        // Reset retry count em sucesso
        setRetryCount(0);
        return;
      }

      // OTIMIZAÇÃO: Buscar perfil com timeout reduzido
      try {
        const profilePromise = fetchUserProfileSecurely(user.id);
        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile timeout")), 800) // Reduzido para 800ms
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
          
          // OTIMIZAÇÃO: Atualizar cache de navegação baseado APENAS no role do banco
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
        
        // Reset retry count em sucesso
        setRetryCount(0);
        
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
        if (retryCount < maxRetries) {
          const delay = getRetryDelay(retryCount);
          logger.warn(`[AUTH-STATE] Erro de timeout - retry ${retryCount + 1}/${maxRetries} em ${delay}ms`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
          return;
        }
      }
      
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
      navigationCache.clear();
      
    } finally {
      setIsLoading(false);
      setGlobalLoading('auth', false);
      logger.info('[AUTH-STATE] ✅ Setup finalizado (otimizado)');
    }
  }, [
    setSession, 
    setUser, 
    setProfile, 
    setIsLoading, 
    setGlobalLoading, 
    circuitBreakerActive, 
    retryCount, 
    lastAttemptTime,
    getCachedSession,
    setCachedSession,
    getRetryDelay,
    maxRetries
  ]);

  // OTIMIZAÇÃO: Reset automático de retry count após sucesso
  useEffect(() => {
    if (retryCount > 0) {
      const resetTimer = setTimeout(() => {
        setRetryCount(0);
        logger.info('[AUTH-STATE] Retry count resetado automaticamente');
      }, 30000); // Reset após 30 segundos
      
      return () => clearTimeout(resetTimer);
    }
  }, [retryCount]);

  return { setupAuthSession };
};
